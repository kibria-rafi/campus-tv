'use strict';

const express = require('express');

const router = express.Router();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** @type {{ data: Array, expiry: number } | null} */
let cache = null;

/**
 * Pick the highest-resolution thumbnail available from a snippet's thumbnails map.
 * @param {object} thumbnails
 * @returns {string}
 */
function pickThumbnail(thumbnails) {
  const priority = ['maxres', 'standard', 'high', 'medium', 'default'];
  for (const key of priority) {
    if (thumbnails[key]?.url) return thumbnails[key].url;
  }
  return '';
}

/**
 * GET /api/youtube/latest?limit=10
 *
 * Returns the most recent videos from the configured YouTube channel using
 * the YouTube Data API v3. Responses are cached in memory for 5 minutes.
 */
router.get('/latest', async (req, res) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId =
    process.env.YOUTUBE_CHANNEL_ID || 'UCTSpN9ivGWfXz9vVXMUjVcw';

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: 'YOUTUBE_API_KEY environment variable is not set.',
    });
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 20);

  // Serve from cache if still valid.
  if (cache && Date.now() < cache.expiry) {
    return res.json({
      success: true,
      source: 'youtube-api',
      items: cache.data.slice(0, limit),
    });
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('channelId', channelId);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('order', 'date');
    url.searchParams.set('maxResults', '20'); // always fetch max so cache is reusable
    url.searchParams.set('type', 'video');

    const response = await fetch(url.toString());
    const payload = await response.json();

    if (!response.ok) {
      // Forward the YouTube API error to the caller.
      return res.status(response.status).json({
        success: false,
        source: 'youtube-api',
        error: payload,
      });
    }

    const items = (payload.items ?? []).map((item) => {
      const videoId = item.id?.videoId ?? '';
      const snippet = item.snippet ?? {};
      return {
        videoId,
        title: snippet.title ?? '',
        description: snippet.description ?? '',
        publishedAt: snippet.publishedAt ?? '',
        channelTitle: snippet.channelTitle ?? '',
        thumbnail: pickThumbnail(snippet.thumbnails ?? {}),
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    });

    // Update cache.
    cache = { data: items, expiry: Date.now() + CACHE_TTL_MS };

    return res.json({
      success: true,
      source: 'youtube-api',
      items: items.slice(0, limit),
    });
  } catch (err) {
    console.error('[YouTube] Data API fetch error:', err);
    return res.status(500).json({
      success: false,
      source: 'youtube-api',
      message: 'Failed to fetch videos from YouTube Data API.',
      details: err.message,
    });
  }
});

module.exports = router;
