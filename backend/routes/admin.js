'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AdminCredentials = require('../models/AdminCredentials');
const ContactMessage = require('../models/ContactMessage');
const StreamSettings = require('../models/StreamSettings');
const { requireAdmin, ensureValidObjectId } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiters');

function isValidStreamUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return false;
  try {
    const u = new URL(url.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ── Authentication ─────────────────────────────────────────────────────────

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const admin = await AdminCredentials.findOne({ username });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { role: 'admin', username },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );
    return res.json({ success: true, token });
  } catch (err) {
    console.error('[Login] Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/verify', requireAdmin, (req, res) => {
  res.json({ success: true, authenticated: true });
});

router.post('/change-password', requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: 'New password must be at least 8 characters.' });
    }

    const username = req.admin.username;
    const admin = username
      ? await AdminCredentials.findOne({ username })
      : await AdminCredentials.findOne({});
    if (!admin) {
      return res.status(404).json({
        error:
          'Admin account not found. Please restart the server so the admin account can be seeded.',
      });
    }

    const match = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const sameAsOld = await bcrypt.compare(newPassword, admin.passwordHash);
    if (sameAsOld) {
      return res
        .status(400)
        .json({ error: 'New password must differ from the current password.' });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    await admin.save();

    return res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    console.error('[ChangePassword] Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Contact Messages ───────────────────────────────────────────────────────

router.get('/messages', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactMessage.countDocuments(),
    ]);

    return res.json({
      messages,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error('[Messages] GET error:', err);
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

router.get('/messages/unread-count', requireAdmin, async (_req, res) => {
  try {
    const count = await ContactMessage.countDocuments({ isRead: false });
    return res.json({ count });
  } catch (err) {
    console.error('[Messages] Unread count error:', err);
    return res.status(500).json({ error: 'Failed to fetch unread count.' });
  }
});

router.patch(
  '/messages/:id/read',
  requireAdmin,
  ensureValidObjectId,
  async (req, res) => {
    try {
      const updated = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );
      if (!updated)
        return res.status(404).json({ error: 'Message not found.' });
      return res.json({ success: true });
    } catch (err) {
      console.error('[Messages] Mark read error:', err);
      return res.status(500).json({ error: 'Failed to mark message as read.' });
    }
  }
);

router.delete(
  '/messages/:id',
  requireAdmin,
  ensureValidObjectId,
  async (req, res) => {
    try {
      const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
      if (!deleted)
        return res.status(404).json({ error: 'Message not found.' });
      return res.json({ success: true, message: 'Message deleted.' });
    } catch (err) {
      console.error('[Messages] DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete message.' });
    }
  }
);

// ── Stream Settings ────────────────────────────────────────────────────────

router.get('/stream-settings', requireAdmin, async (_req, res) => {
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

router.put('/stream-settings', requireAdmin, async (req, res) => {
  try {
    const { primaryM3u8, backupM3u8 } = req.body;

    if (!isValidStreamUrl(primaryM3u8)) {
      return res.status(400).json({
        error:
          'primaryM3u8 must be a valid http/https URL (e.g. https://example.com/stream.m3u8)',
      });
    }

    let backup = '';
    if (backupM3u8 && backupM3u8.trim()) {
      if (!isValidStreamUrl(backupM3u8)) {
        return res.status(400).json({
          error: 'backupM3u8 must be a valid http/https URL if provided',
        });
      }
      backup = backupM3u8.trim();
    }

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
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
