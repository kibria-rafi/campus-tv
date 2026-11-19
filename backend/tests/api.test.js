'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const express = require('express');

// Mock or configure env for test run
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_length_16';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_tv_test';

const { validateEnv } = require('../config/env');
const contactRoutes = require('../routes/contact');
const streamRoutes = require('../routes/stream');

test('Environment validation check', () => {
  const result = validateEnv();
  assert.equal(typeof result, 'object');
  assert.ok(Array.isArray(result.missing));
});

test('HTTP API integration test suite', async (t) => {
  const app = express();
  app.use(express.json());

  // Base routes
  app.get('/', (_req, res) => res.status(200).send('Campus TV backend is running.'));
  app.get('/health', (_req, res) => res.status(200).json({ ok: true, service: 'campus-tv-backend' }));

  // Mount actual route modules
  app.use('/api/contact', contactRoutes);
  app.use('/api', streamRoutes);

  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(() => {
    return new Promise((resolve) => server.close(resolve));
  });

  await t.test('GET / returns 200 and running text', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /Campus TV backend is running/i);
  });

  await t.test('GET /health returns 200 and service status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.deepEqual(json, { ok: true, service: 'campus-tv-backend' });
  });

  await t.test('POST /api/contact enforces required fields', async () => {
    // Missing name
    const resNoName = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', message: 'Hello world' }),
    });
    assert.equal(resNoName.status, 400);
    const jsonNoName = await resNoName.json();
    assert.match(jsonNoName.error, /Name is required/i);

    // Invalid email
    const resBadEmail = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student', email: 'invalid-email', message: 'Hello world' }),
    });
    assert.equal(resBadEmail.status, 400);
    const jsonBadEmail = await resBadEmail.json();
    assert.match(jsonBadEmail.error, /valid email/i);

    // Short message
    const resShortMsg = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student', email: 'student@diu.edu.bd', message: 'hi' }),
    });
    assert.equal(resShortMsg.status, 400);
    const jsonShortMsg = await resShortMsg.json();
    assert.match(jsonShortMsg.error, /too short/i);

    // Honeypot silently succeeds
    const resHoneypot = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spammer Bot',
        email: 'spam@bot.com',
        message: 'Spam text message',
        company: 'Spam Co',
      }),
    });
    assert.equal(resHoneypot.status, 200);
    const jsonHoneypot = await resHoneypot.json();
    assert.equal(jsonHoneypot.success, true);
  });
});
