'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

test('Backend modular architecture loads all components', () => {
  // Verify models load and have schemas
  const { News, ALLOWED_CATEGORIES, CATEGORY_MAP } = require('../models/News');
  assert.ok(News, 'News model should be exported');
  assert.ok(Array.isArray(ALLOWED_CATEGORIES), 'ALLOWED_CATEGORIES should be an array');
  assert.ok(CATEGORY_MAP.Features, 'CATEGORY_MAP should contain Features');

  const AdminCredentials = require('../models/AdminCredentials');
  assert.ok(AdminCredentials, 'AdminCredentials model should be exported');

  const StreamSettings = require('../models/StreamSettings');
  assert.ok(StreamSettings, 'StreamSettings model should be exported');

  const ContactMessage = require('../models/ContactMessage');
  assert.ok(ContactMessage, 'ContactMessage model should be exported');

  // Verify routes load as valid Express routers (router functions)
  const newsRoutes = require('../routes/news');
  assert.equal(typeof newsRoutes, 'function', 'newsRoutes should be an Express router function');

  const adminRoutes = require('../routes/admin');
  assert.equal(typeof adminRoutes, 'function', 'adminRoutes should be an Express router function');

  const contactRoutes = require('../routes/contact');
  assert.equal(typeof contactRoutes, 'function', 'contactRoutes should be an Express router function');

  const streamRoutes = require('../routes/stream');
  assert.equal(typeof streamRoutes, 'function', 'streamRoutes should be an Express router function');

  const youtubeRoutes = require('../routes/youtube');
  assert.equal(typeof youtubeRoutes, 'function', 'youtubeRoutes should be an Express router function');

  // Verify middlewares
  const { requireAdmin, ensureValidObjectId } = require('../middleware/auth');
  assert.equal(typeof requireAdmin, 'function', 'requireAdmin should be a middleware function');
  assert.equal(typeof ensureValidObjectId, 'function', 'ensureValidObjectId should be a middleware function');

  const { initSocket, getViewerCount } = require('../sockets/liveViewers');
  assert.equal(typeof initSocket, 'function', 'initSocket should be a function');
  assert.equal(typeof getViewerCount, 'function', 'getViewerCount should be an async function');
});
