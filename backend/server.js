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

// ── Socket.IO ───────────────────────────────────────────────────────
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

// ── Middleware ───────────────────────────────────────────────────────
// Allow common local/dev + deployed frontends.
// Set FRONTEND_URL on Render (e.g. https://campus-tv.onrender.com).
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g. https://campus-tv.onrender.com
  process.env.FRONTEND_URL_DEV, // optional extra origin
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

// ── Basic routes (useful for Render health checks) ───────────────────
app.get('/', (_req, res) => {
  res.status(200).send('Campus TV backend is running.');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'campus-tv-backend' });
});

// --- আপডেট করা নিউজ স্কিমা (Schema) ---
// এখানে সব ফিল্ড একসাথে দেওয়া হয়েছে যাতে পুনরায় ডিক্লেয়ার করার প্রয়োজন না হয়
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
  videoUrl: { type: String, default: '' }, // ইউটিউব আইডি জমানোর জন্য
  isLive: { type: Boolean, default: false }, // লাইভ কি না তা বোঝার জন্য
  createdAt: { type: Date, default: Date.now },
});

// মডেল ডিক্লেয়ার করার আগে চেক করে নেওয়া হচ্ছে যেন ডুপ্লিকেট না হয়
const News = mongoose.models.News || mongoose.model('News', newsSchema);
// --- Employee Schema ---
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
// --- API Routes ---

// ১. এডমিন লগইন রুট
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

// ২. নিউজ গেট করার রুট — ভিডিও ও লাইভ পোস্ট বাদ দেওয়া হয়েছে
app.get('/api/news', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    // Return only plain articles: no videoUrl and not isLive
    let query = News.find({
      $or: [{ videoUrl: '' }, { videoUrl: { $exists: false } }],
      isLive: { $ne: true },
    }).sort({ createdAt: -1 });

    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const news = await query;
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ৩. নিউজ পোস্ট করার রুট — videoUrl ও isLive সর্বদা নিষ্ক্রিয়
app.post('/api/news', async (req, res) => {
  try {
    const body = { ...req.body, videoUrl: '', isLive: false };
    const newNews = new News(body);
    await newNews.save();
    res.json({ success: true, message: 'News published!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ৪. নিউজ আপডেট/এডিট করার রুট — videoUrl ও isLive সর্বদা নিষ্ক্রিয়
app.put('/api/news/:id', async (req, res) => {
  try {
    const body = { ...req.body, videoUrl: '', isLive: false };
    const updatedNews = await News.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    if (!updatedNews)
      return res.status(404).json({ message: 'News not found' });
    res.json({ success: true, updatedNews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ৫. নিউজ ডিলিট করার রুট
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

// ── Employee Routes ──────────────────────────────────────────────────────
// GET /api/employees - Public endpoint to fetch all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees - Admin only (Add new employee)
app.post('/api/employees', async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.json({ success: true, message: 'Employee added successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id - Admin only (Update employee)
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

// DELETE /api/employees/:id - Admin only (Delete employee)
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

// ── Live Viewers REST Endpoint (debug / initial load) ───────────────────
app.get('/api/live/viewers', async (_req, res) => {
  const sockets = await io.in('live').allSockets();
  res.json({ count: sockets.size });
});

// ── YouTube RSS Route ────────────────────────────────────────────────────
// Simple in-memory cache (5-minute TTL) shared by both endpoints

// Public channel ID (can be overridden via env if needed)
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

  // ── Primary: direct YouTube RSS with retry on 5xx ───────────────────
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

  // ── Fallback: OpenRSS proxy ─────────────────────────────────────────
  try {
    const items = await fetchAndParse(fallbackUrl);
    console.log('[YouTube] OpenRSS fallback succeeded.');
    return items;
  } catch (fallbackErr) {
    console.warn(`[YouTube] OpenRSS fallback failed: ${fallbackErr?.message}.`);
  }

  // ── Last resort: stale cache ────────────────────────────────────────
  if (ytCache.items && ytCache.items.length) {
    console.warn('[YouTube] Both sources failed. Serving stale cache.');
    return ytCache.items;
  }

  throw new Error(
    `YouTube RSS unavailable. Primary error: ${primaryError?.message}`
  );
}

// ── Legacy endpoint: returns only video ID array ─────────────────────────
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

// ── New endpoint: returns full structured video items ────────────────────
// GET /api/videos/youtube?limit=12
app.get('/api/videos/youtube', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const now = Date.now();

    // Reuse cache if fresh
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

// ── Contact Form Endpoint ────────────────────────────────────────────────
// POST /api/contact
// Accepts: { name, email, subject, message, company (honeypot) }
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message, company } = req.body;

  // Honeypot check — bots fill hidden fields; silently succeed
  if (company && company.trim() !== '') {
    return res.json({ success: true });
  }

  // Basic server-side validation
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

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!');

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
