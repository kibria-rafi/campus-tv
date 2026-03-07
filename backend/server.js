const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const youtubeRoutes = require('./routes/youtube');
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
  Features: { bn: 'ফিচার', en: 'Features' },
  Culture: { bn: 'সংস্কৃতি', en: 'Culture' },
  Education: { bn: 'শিক্ষা', en: 'Education' },
  'Amar Campus': { bn: 'আমার ক্যাম্পাস', en: 'Amar Campus' },
  Opinion: { bn: 'অপিনিয়ন', en: 'Opinion' },
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
  secondaryImage: { type: String, default: '' },
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

app.get('/api/live/viewers', async (_req, res) => {
  const sockets = await io.in('live').allSockets();
  res.json({ count: sockets.size });
});

app.use('/api/youtube', youtubeRoutes);

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
