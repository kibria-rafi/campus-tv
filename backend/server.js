const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
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

// ২. নিউজ গেট করার রুট (সব খবর একসাথে)
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ৩. নিউজ পোস্ট করার রুট
app.post('/api/news', async (req, res) => {
  try {
    const newNews = new News(req.body);
    await newNews.save();
    res.json({ success: true, message: 'News published!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ৪. নিউজ আপডেট/এডিট করার রুট
app.put('/api/news/:id', async (req, res) => {
  try {
    const updatedNews = await News.findByIdAndUpdate(req.params.id, req.body, {
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

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!');

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};

startServer();
