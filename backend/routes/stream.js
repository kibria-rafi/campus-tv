'use strict';

const express = require('express');
const router = express.Router();
const StreamSettings = require('../models/StreamSettings');
const { getViewerCount } = require('../sockets/liveViewers');

// Public: frontend live player reads this to get current stream URLs.
router.get('/stream-settings', async (_req, res) => {
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

// Public: get active live room viewer count
router.get('/live/viewers', async (_req, res) => {
  try {
    const count = await getViewerCount();
    return res.json({ count });
  } catch (err) {
    console.error('[LiveViewers] GET error:', err);
    return res.status(500).json({ count: 0 });
  }
});

module.exports = router;
