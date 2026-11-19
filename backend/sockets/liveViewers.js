'use strict';

const { Server } = require('socket.io');

let ioInstance = null;

function initSocket(server, isAllowedOrigin) {
  const io = new Server(server, {
    cors: {
      origin: (origin, cb) => {
        if (isAllowedOrigin(origin)) return cb(null, true);
        return cb(new Error(`Socket.IO CORS blocked for origin: ${origin}`));
      },
      methods: ['GET', 'POST'],
    },
  });

  ioInstance = io;

  async function updateViewerCount() {
    try {
      const sockets = await io.in('live').allSockets();
      io.to('live').emit('live:viewers', { count: sockets.size });
    } catch (err) {
      console.error('[Socket.IO] Error updating viewer count:', err);
    }
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

  return io;
}

async function getViewerCount() {
  if (!ioInstance) return 0;
  const sockets = await ioInstance.in('live').allSockets();
  return sockets.size;
}

module.exports = {
  initSocket,
  getViewerCount,
};
