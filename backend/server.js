'use strict';

require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');

const { connectDB } = require('./config/db');
const { initSocket } = require('./sockets/liveViewers');

// Route Modules
const newsRoutes = require('./routes/news');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const streamRoutes = require('./routes/stream');
const youtubeRoutes = require('./routes/youtube');

const app = express();
const server = http.createServer(app);

// ── Allowed Origins ────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_DEV,
  'https://campustv.ac',
  'https://www.campustv.ac',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

function isAllowedOrigin(origin) {
  // Allow non-browser clients (curl, health checks, server-to-server)
  if (!origin) return true;
  return allowedOrigins.includes(origin);
}

// ── WebSockets ─────────────────────────────────────────────────────────────
initSocket(server, isAllowedOrigin);

// ── Middlewares ────────────────────────────────────────────────────────────
app.use(compression());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json({ limit: '1mb' }));

// ── Health & Base Routes ───────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).send('Campus TV backend is running.');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'campus-tv-backend' });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api', streamRoutes);

// ── Global Error Handler ───────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ── Server Lifecycle & Graceful Shutdown ───────────────────────────────────
let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('[DB] MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('[Server] Error during database disconnect:', err);
      process.exit(1);
    }
  });

  // Force shutdown if cleanup hangs
  setTimeout(() => {
    console.error('[Server] Forced shutdown timeout reached.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = Number(process.env.PORT) || 5001;

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `[Server] Port ${PORT} is already in use. Stop the existing process or change PORT in .env.`
        );
      } else {
        console.error('[Server] Failed to start HTTP server:', err);
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
