const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { XMLParser } = require('fast-xml-parser');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

/** Broadcast current viewer count to everyone in the "live" room. */
async function updateViewerCount() {
  const sockets = await io.in('live').allSockets();
  io.to('live').emit('live:viewers', { count: sockets.size });
}

io.on('connection', (socket) => {
  socket.on('live:join', () => {
    socket.join('live');
    updateViewerCount();
  });

  socket.on('live:leave', () => {
    socket.leave('live');
    updateViewerCount();
  });

  socket.on('disconnect', () => {
    updateViewerCount();
  });
});

// Set FRONTEND_URL on Render to the deployed frontend origin.
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g. https://campus-tv.onrender.com
  process.env.FRONTEND_URL_DEV,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

console.log('[CORS] Allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients (curl, server-to-server)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());

// ── News Categories ────────────────────────────────────────────────────────
const ALLOWED_CATEGORIES = [
  'Features',
  'Culture',
  'Education',
  'Amar Campus',
  'Opinion',
];

const CATEGORY_MAP = {
  'Features': { bn: 'ফিচার', en: 'Features' },
  'Culture': { bn: 'সংস্কৃতি', en: 'Culture' },
  'Education': { bn: 'শিক্ষা', en: 'Education' },
  'Amar Campus': { bn: 'আমার ক্যাম্পাস', en: 'Amar Campus' },
  'Opinion': { bn: 'অপিনিয়ন', en: 'Opinion' },
};

app.get('/', (_req, res) => {
  res.status(200).send('Campus TV backend is running.');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'campus-tv-backend' });
});

const newsSchema = new mongoose.Schema({
  title: {
    bn: { type: String, required: true },
    en: { type: String, required: true },
  },
  subtitle: {
    bn: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  description: {
    bn: { type: String, required: true },
    en: { type: String, required: true },
  },
  image: String,
  imageCaption: { type: String, default: '' },
  reporterName: { type: String, default: '' },
  category: {
    bn: { type: String, default: 'সাধারণ' },
    en: { type: String, default: 'General' },
  },
  videoUrl: { type: String, default: '' },
  isLive: { type: Boolean, default: false },
  categories: {
    type: [String],
    default: [],
    validate: {
      validator: (arr) =>
        Array.isArray(arr) && arr.every((v) => ALLOWED_CATEGORIES.includes(v)),
      message: 'Invalid category value',
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const News = mongoose.models.News || mongoose.model('News', newsSchema);

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  bio: {
    bn: { type: String, required: true },
    en: { type: String, required: true },
  },
  imageURL: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Employee =
  mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

// ── Stream Settings ────────────────────────────────────────────────────────
// Single-document collection that stores the live stream URLs.
const streamSettingsSchema = new mongoose.Schema({
  primaryM3u8: { type: String, required: true },
  backupM3u8: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: '' },
});

const StreamSettings =
  mongoose.models.StreamSettings ||
  mongoose.model('StreamSettings', streamSettingsSchema);

// ── Auth middleware ────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function isValidStreamUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return false;
  try {
    const u = new URL(url.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/api/news', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const category = req.query.category; // Filter by category
    
    // Base filter: only plain articles (no videoUrl and not isLive)
    const filter = {
      $or: [{ videoUrl: '' }, { videoUrl: { $exists: false } }],
      isLive: { $ne: true },
    };
    
    // Add category filter if provided
    if (category && ALLOWED_CATEGORIES.includes(category)) {
      filter.categories = category;
    }
    
    let query = News.find(filter).sort({ createdAt: -1 });

    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const news = await query;
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Must be declared before /api/news/:id to prevent Express treating "search" as an id.
app.get('/api/news/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    // Return early for missing / too-short queries
    if (q.length < 2) {
      return res.json({ results: [] });
    }

    // Escape special regex characters to prevent ReDoS
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(escaped, 'i');

    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const docs = await News.find({
      $or: [
        { 'title.bn': rx },
        { 'title.en': rx },
        { 'subtitle.bn': rx },
        { 'subtitle.en': rx },
        { 'description.bn': rx },
        { 'description.en': rx },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    const results = docs.map((n) => ({
      id: n._id,
      title: n.title,
      snippet: {
        bn: (n.description?.bn || n.subtitle?.bn || '').slice(0, 160),
        en: (n.description?.en || n.subtitle?.en || '').slice(0, 160),
      },
      image: n.image || '',
      category: n.category,
      createdAt: n.createdAt,
    }));

    return res.json({ results });
  } catch (err) {
    console.error('[Search] News search failed:', err);
    return res
      .status(500)
      .json({ error: 'News search failed', details: err.message });
  }
});

/** Sanitise & validate the categories field from a request body. */
function parseCategories(raw) {
  if (!Array.isArray(raw)) return [];
  const valid = raw.filter((v) => ALLOWED_CATEGORIES.includes(v));
  return [...new Set(valid)];
}

app.post('/api/news', async (req, res) => {
  try {
    const categories = parseCategories(req.body.categories);
    const body = { ...req.body, videoUrl: '', isLive: false, categories };
    const newNews = new News(body);
    await newNews.save();
    res.json({ success: true, message: 'News published!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sidebar endpoint — must be declared BEFORE /api/news/:id patterns
app.get('/api/news/sidebar/:id', async (req, res) => {
  try {
    const relatedLimit = Math.min(parseInt(req.query.related) || 10, 20);
    const latestLimit = Math.min(parseInt(req.query.latest) || 10, 20);

    const current = await News.findById(req.params.id).lean();
    if (!current) return res.status(404).json({ error: 'News not found' });

    const currentCategories = current.categories || [];

    // Base filter: plain articles only, exclude current
    const baseFilter = {
      _id: { $ne: current._id },
      $or: [{ videoUrl: '' }, { videoUrl: { $exists: false } }],
      isLive: { $ne: true },
    };

    let related = [];

    if (currentCategories.length > 0) {
      related = await News.find({
        ...baseFilter,
        categories: { $in: currentCategories },
      })
        .sort({ createdAt: -1 })
        .limit(relatedLimit)
        .lean();
    }

    // Collect related ids to exclude from latest
    const relatedIds = related.map((item) => String(item._id));

    // Fetch latest, excluding current + related; over-fetch so we can trim
    const latestRaw = await News.find({
      ...baseFilter,
      _id: { $nin: [String(current._id), ...relatedIds] },
    })
      .sort({ createdAt: -1 })
      .limit(latestLimit)
      .lean();

    return res.json({ related, latest: latestRaw });
  } catch (err) {
    console.error('[Sidebar] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/news/:id', async (req, res) => {
  try {
    const categories = parseCategories(req.body.categories);
    const body = { ...req.body, videoUrl: '', isLive: false, categories };
    const updatedNews = await News.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!updatedNews)
      return res.status(404).json({ message: 'News not found' });
    res.json({ success: true, updatedNews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews)
      return res.status(404).json({ message: 'News not found' });
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.json({ success: true, message: 'Employee added successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEmployee)
      return res.status(404).json({ message: 'Employee not found' });
    res.json({
      success: true,
      message: 'Employee updated successfully!',
      updatedEmployee,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee)
      return res.status(404).json({ message: 'Employee not found' });
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/live/viewers', async (_req, res) => {
  const sockets = await io.in('live').allSockets();
  res.json({ count: sockets.size });
});

// Simple in-memory cache with 5-minute TTL.
const YOUTUBE_CHANNEL_ID =
  process.env.YOUTUBE_CHANNEL_ID || 'UCTSpN9ivGWfXz9vVXMUjVcw';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let ytCache = { videoIds: null, items: null, timestamp: 0 };

/** Fetch + parse the YouTube RSS feed and return an array of item objects.
 *  Strategy:
 *   1. Try direct YouTube RSS feed.
 *   2. On failure (non-200, HTML response, or parse error) fall back to OpenRSS proxy.
 *   3. If both fail, serve stale cache when available; otherwise throw.
 */
async function fetchYouTubeRSS() {
  const directUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
  const fallbackUrl = `https://openrss.org/youtube/channel/${YOUTUBE_CHANNEL_ID}`;

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  /** Parse an XML string into an item array, or return null on failure. */
  function parseXML(xmlText) {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const parsed = parser.parse(xmlText);
    const entries = parsed?.feed?.entry ?? [];
    const entryArray = Array.isArray(entries) ? entries : [entries];
    if (!entryArray.length) return null;

    const items = entryArray
      .map((e) => {
        const id = e['yt:videoId'];
        if (!id) return null;
        return {
          id,
          title: e.title ?? '',
          publishedAt: e.published ?? null,
          watchUrl: `https://www.youtube.com/watch?v=${id}`,
          thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        };
      })
      .filter(Boolean);

    return items.length ? items : null;
  }

  /** Fetch a URL, ensure it returns XML (not HTML), parse and return items. */
  async function fetchAndParse(url) {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('text/html')) {
      throw new Error(
        `Received HTML instead of XML (content-type: ${contentType})`
      );
    }

    const xmlText = await response.text();
    const items = parseXML(xmlText);
    if (!items) throw new Error('No videos found in RSS feed');
    return items;
  }

  const maxAttempts = 3;
  let primaryError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchAndParse(directUrl);
    } catch (err) {
      primaryError = err;
      const statusMatch = String(err.message).match(/HTTP (\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1], 10) : 0;
      if (status >= 500 && status <= 599 && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 300 * attempt));
        continue;
      }
      break;
    }
  }

  console.warn(
    `[YouTube] Primary RSS failed: ${primaryError?.message}. Trying OpenRSS fallback.`
  );

  // Fallback: OpenRSS proxy
  try {
    const items = await fetchAndParse(fallbackUrl);
    console.log('[YouTube] OpenRSS fallback succeeded.');
    return items;
  } catch (fallbackErr) {
    console.warn(`[YouTube] OpenRSS fallback failed: ${fallbackErr?.message}.`);
  }

  // Last resort: serve stale cache if available.
  if (ytCache.items && ytCache.items.length) {
    console.warn('[YouTube] Both sources failed. Serving stale cache.');
    return ytCache.items;
  }

  throw new Error(
    `YouTube RSS unavailable. Primary error: ${primaryError?.message}`
  );
}

// Legacy: returns video ID array only. Prefer /api/videos/youtube for new callers.
app.get('/api/youtube/latest', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const now = Date.now();
    console.log(
      `[YouTube] GET /api/youtube/latest?limit=${limit} — from origin: ${req.headers.origin || 'n/a'}`
    );

    if (ytCache.videoIds && now - ytCache.timestamp < CACHE_TTL_MS) {
      console.log(
        '[YouTube] Returning cached result, count:',
        ytCache.videoIds.length
      );
      return res.json({ videoIds: ytCache.videoIds.slice(0, limit) });
    }

    const items = await fetchYouTubeRSS();
    const videoIds = items.map((i) => i.id);
    ytCache = { videoIds, items, timestamp: now };
    console.log('[YouTube] Fetched fresh RSS, count:', videoIds.length);

    return res.json({ videoIds: videoIds.slice(0, limit) });
  } catch (err) {
    console.error('[YouTube] RSS fetch error:', err);
    res
      .status(502)
      .json({ error: 'Failed to fetch YouTube archive', details: err.message });
  }
});

app.get('/api/videos/youtube', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const now = Date.now();

    if (ytCache.items && now - ytCache.timestamp < CACHE_TTL_MS) {
      return res.json({
        source: 'youtube-rss',
        channelId: YOUTUBE_CHANNEL_ID,
        items: ytCache.items.slice(0, limit),
      });
    }

    const items = await fetchYouTubeRSS();
    const videoIds = items.map((i) => i.id);
    ytCache = { videoIds, items, timestamp: now };

    return res.json({
      source: 'youtube-rss',
      channelId: YOUTUBE_CHANNEL_ID,
      items: items.slice(0, limit),
    });
  } catch (err) {
    console.error('[YouTube] RSS fetch error:', err);
    res
      .status(502)
      .json({ error: 'Failed to fetch YouTube archive', details: err.message });
  }
});

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message, company } = req.body;

  // Honeypot check — bots fill hidden fields; silently succeed
  if (company && company.trim() !== '') {
    return res.json({ success: true });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res
      .status(400)
      .json({ error: 'A valid email address is required.' });
  }
  if (!message || message.trim().length < 5) {
    return res.status(400).json({ error: 'Message is too short.' });
  }
  if (message.length > 2000) {
    return res
      .status(400)
      .json({ error: 'Message must be under 2000 characters.' });
  }

  // Log submission (replace with nodemailer / DB save as needed)
  console.log('📬 Contact form submission:', {
    name: name.trim(),
    email: email.trim(),
    subject: subject || 'General',
    message: message.trim(),
    receivedAt: new Date().toISOString(),
  });

  return res.json({ success: true, message: 'Message received.' });
});

// ── Stream Settings routes ─────────────────────────────────────────────────

// Public: frontend live player reads this to get current stream URLs.
app.get('/api/stream-settings', async (_req, res) => {
  try {
    const settings = await StreamSettings.findOne();
    if (!settings) {
      return res.json({ primaryM3u8: '', backupM3u8: null });
    }
    return res.json({
      primaryM3u8: settings.primaryM3u8,
      backupM3u8: settings.backupM3u8 || null,
    });
  } catch (err) {
    console.error('[StreamSettings] GET public error:', err);
    return res.status(500).json({ error: 'Failed to fetch stream settings' });
  }
});

// Admin: read current settings
app.get('/api/admin/stream-settings', requireAdmin, async (_req, res) => {
  try {
    const settings = await StreamSettings.findOne();
    if (!settings) {
      return res.json({ primaryM3u8: '', backupM3u8: null });
    }
    return res.json({
      primaryM3u8: settings.primaryM3u8,
      backupM3u8: settings.backupM3u8 || null,
    });
  } catch (err) {
    console.error('[StreamSettings] Admin GET error:', err);
    return res.status(500).json({ error: 'Failed to fetch stream settings' });
  }
});

// Admin: create or update settings (upsert single document)
app.put('/api/admin/stream-settings', requireAdmin, async (req, res) => {
  try {
    const { primaryM3u8, backupM3u8 } = req.body;

    if (!isValidStreamUrl(primaryM3u8)) {
      return res.status(400).json({
        error:
          'primaryM3u8 must be a valid http/https URL (e.g. https://example.com/stream.m3u8)',
      });
    }

    const backup =
      backupM3u8 && backupM3u8.trim()
        ? isValidStreamUrl(backupM3u8)
          ? backupM3u8.trim()
          : (() => {
              throw new Error(
                'backupM3u8 must be a valid http/https URL if provided'
              );
            })()
        : '';

    const updatedBy = req.admin?.username || req.admin?.sub || '';
    const settings = await StreamSettings.findOneAndUpdate(
      {},
      {
        primaryM3u8: primaryM3u8.trim(),
        backupM3u8: backup,
        updatedAt: new Date(),
        updatedBy,
      },
      { upsert: true, new: true }
    );

    return res.json({
      primaryM3u8: settings.primaryM3u8,
      backupM3u8: settings.backupM3u8 || null,
    });
  } catch (err) {
    console.error('[StreamSettings] Admin PUT error:', err);
    return res
      .status(err.message.includes('valid') ? 400 : 500)
      .json({ error: err.message || 'Failed to update stream settings' });
  }
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!');

    // One-time migration: ensure all old docs have categories: []
    const migrated = await News.updateMany(
      { categories: { $exists: false } },
      { $set: { categories: [] } }
    );
    if (migrated.modifiedCount > 0) {
      console.log(
        `[Migration] Backfilled categories:[] on ${migrated.modifiedCount} news document(s).`
      );
    }

    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};

startServer();
