'use strict';

const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { contactLimiter } = require('../middleware/rateLimiters');

router.post('/', contactLimiter, async (req, res) => {
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

  try {
    await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || 'General',
      message: message.trim(),
    });
  } catch (err) {
    console.error('[Contact] Save error:', err);
    return res
      .status(500)
      .json({ error: 'Failed to save message. Please try again.' });
  }

  return res.json({ success: true, message: 'Message received.' });
});

module.exports = router;
