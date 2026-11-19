'use strict';

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { News, ALLOWED_CATEGORIES } = require('../models/News');
const { requireAdmin, ensureValidObjectId } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiters');

// ── Helpers ────────────────────────────────────────────────────────────────

function uploadNewsImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res
          .status(400)
          .json({ error: 'Image size exceeds the 5MB limit.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

function parseCategories(raw) {
  if (typeof raw === 'string') {
    try {
      return parseCategories(JSON.parse(raw));
    } catch {
      return ALLOWED_CATEGORIES.includes(raw) ? [raw] : [];
    }
  }
  if (!Array.isArray(raw)) return [];
  const valid = raw.filter((v) => ALLOWED_CATEGORIES.includes(v));
  return [...new Set(valid)];
}

function parseJsonField(raw, fallback) {
  if (typeof raw !== 'string') return raw || fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function normalizeNewsBody(req) {
  const body = { ...req.body };
  body.title = parseJsonField(body.title, {});
  body.subtitle = parseJsonField(body.subtitle, {});
  body.description = parseJsonField(body.description, {});
  body.category = parseJsonField(body.category, {});
  body.categories = parseCategories(body.categories);
  body.videoUrl = '';
  body.isLive = false;

  if (req.file?.path) {
    body.image = req.file.path;
  }

  return body;
}

function isContentEmpty(str) {
  if (!str || typeof str !== 'string') return true;
  return str.replace(/<[^>]*>/g, '').trim() === '';
}

function validateNewsPayload(body) {
  const titleBn = (body.title?.bn || '').trim();
  const titleEn = (body.title?.en || '').trim();
  const hasBnTitle = titleBn !== '';
  const hasEnTitle = titleEn !== '';

  if (!hasBnTitle && !hasEnTitle) {
    return 'At least one language title is required.';
  }

  const hasBnDesc = !isContentEmpty(body.description?.bn);
  const hasEnDesc = !isContentEmpty(body.description?.en);

  if (hasBnTitle && !hasBnDesc) {
    return 'Bengali title provided but Bengali description is missing.';
  }
  if (!hasBnTitle && hasBnDesc) {
    return 'Bengali description provided but Bengali title is missing.';
  }
  if (hasEnTitle && !hasEnDesc) {
    return 'English title provided but English description is missing.';
  }
  if (!hasEnTitle && hasEnDesc) {
    return 'English description provided but English title is missing.';
  }

  return null;
}

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/news
router.get('/', async (req, res) => {
  try {
    const parsedLimit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const limit =
      Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : null;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const category = req.query.category;
    const summaryOnly =
      req.query.summary === '1' || req.query.summary === 'true';

    // Base filter: only plain articles (no videoUrl and not isLive)
    const filter = {
      $or: [{ videoUrl: '' }, { videoUrl: { $exists: false } }],
      isLive: { $ne: true },
    };

    if (category && ALLOWED_CATEGORIES.includes(category)) {
      filter.categories = category;
    }

    let query = News.find(filter).sort({ createdAt: -1 }).lean();

    if (summaryOnly) {
      query = query.select(
        'title subtitle image videoUrl isLive category categories createdAt'
      );
    }

    if (limit && limit > 0) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const news = await query;
    return res.json(news);
  } catch (err) {
    console.error('[News] GET error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/news/search — must precede /:id to prevent param collision
router.get('/search', searchLimiter, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (q.length < 2) {
      return res.json({ results: [] });
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(escaped, 'i');
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

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
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/news/sidebar/:id — must precede /:id
router.get('/sidebar/:id', ensureValidObjectId, async (req, res) => {
  try {
    const relatedLimit = Math.min(parseInt(req.query.related, 10) || 10, 20);
    const latestLimit = Math.min(parseInt(req.query.latest, 10) || 10, 20);

    const current = await News.findById(req.params.id).lean();
    if (!current) return res.status(404).json({ error: 'News not found' });

    const currentCategories = current.categories || [];

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

    const relatedIds = related.map((item) => String(item._id));

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
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/news/:id
router.get('/:id', ensureValidObjectId, async (req, res) => {
  try {
    const doc = await News.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ error: 'News not found' });
    }
    return res.json(doc);
  } catch (err) {
    console.error('[News] GET by ID error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/news
router.post('/', requireAdmin, uploadNewsImage, async (req, res) => {
  try {
    const body = normalizeNewsBody(req);
    const validationError = validateNewsPayload(body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const newNews = new News(body);
    await newNews.save();
    return res.json({ success: true, message: 'News published!' });
  } catch (err) {
    console.error('[News] POST error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/news/:id
router.put(
  '/:id',
  requireAdmin,
  ensureValidObjectId,
  uploadNewsImage,
  async (req, res) => {
    try {
      const body = normalizeNewsBody(req);
      const validationError = validateNewsPayload(body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const updatedNews = await News.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
      });
      if (!updatedNews) {
        return res.status(404).json({ message: 'News not found' });
      }
      return res.json({ success: true, updatedNews });
    } catch (err) {
      console.error('[News] PUT error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE /api/news/:id
router.delete(
  '/:id',
  requireAdmin,
  ensureValidObjectId,
  async (req, res) => {
    try {
      const deletedNews = await News.findByIdAndDelete(req.params.id);
      if (!deletedNews) {
        return res.status(404).json({ message: 'News not found' });
      }
      return res.json({ success: true, message: 'News deleted successfully' });
    } catch (err) {
      console.error('[News] DELETE error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

module.exports = router;
