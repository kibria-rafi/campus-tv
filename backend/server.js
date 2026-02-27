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
app.use(cors());
app.use(express.json());

// --- আপডেট করা নিউজ স্কিমা (Schema) ---
// এখানে সব ফিল্ড একসাথে দেওয়া হয়েছে যাতে পুনরায় ডিক্লেয়ার করার প্রয়োজন না হয়
const newsSchema = new mongoose.Schema({
  title: {
    bn: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    bn: { type: String, required: true },
    en: { type: String, required: true },
  },
  image: String,
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
    // Return only plain articles: no videoUrl and not isLive
    const news = await News.find({
      $or: [{ videoUrl: '' }, { videoUrl: { $exists: false } }],
      isLive: { $ne: true },
    }).sort({ createdAt: -1 });
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

// ── Live Viewers REST Endpoint (debug / initial load) ───────────────────
app.get('/api/live/viewers', async (_req, res) => {
  const sockets = await io.in('live').allSockets();
  res.json({ count: sockets.size });
});

// ── YouTube RSS Route ────────────────────────────────────────────────────
// Simple in-memory cache (5-minute TTL)
const YOUTUBE_CHANNEL_ID = 'UCTSpN9ivGWfXz9vVXMUjVcw';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let ytCache = { videoIds: null, timestamp: 0 };

app.get('/api/youtube/latest', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const now = Date.now();

    // Return cached result if still fresh
    if (ytCache.videoIds && now - ytCache.timestamp < CACHE_TTL_MS) {
      return res.json({ videoIds: ytCache.videoIds.slice(0, limit) });
    }

    // Fetch RSS feed from YouTube
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`YouTube RSS responded with ${response.status}`);
    }
    const xmlText = await response.text();

    // Parse XML safely
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const parsed = parser.parse(xmlText);

    // Extract video IDs from <yt:videoId> nodes
    const entries = parsed?.feed?.entry ?? [];
    const entryArray = Array.isArray(entries) ? entries : [entries];
    const videoIds = entryArray.map((e) => e['yt:videoId']).filter(Boolean);

    if (!videoIds.length) {
      return res.status(502).json({ error: 'No videos found in RSS feed' });
    }

    // Store in cache
    ytCache = { videoIds, timestamp: now };

    return res.json({ videoIds: videoIds.slice(0, limit) });
  } catch (err) {
    console.error('YouTube RSS error:', err.message);
    res
      .status(502)
      .json({ error: 'Failed to fetch YouTube archive', details: err.message });
  }
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
