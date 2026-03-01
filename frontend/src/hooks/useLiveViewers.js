import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

/**
 * useLiveViewers
 *
 * Connects to the backend Socket.IO server, joins the "live" room, and
 * tracks the real-time viewer count for our website.
 *
 * Returns: { count: number, status: "connecting" | "connected" | "error" }
 */
export function useLiveViewers() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('connecting');
  const socketRef = useRef(null);

  useEffect(() => {
    // Guard: don't create a second socket if already open
    if (socketRef.current) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('connected');
      socket.emit('live:join');
    });

    socket.on('live:viewers', ({ count: c }) => {
      setCount(c);
    });

    socket.on('connect_error', () => {
      setStatus('error');
    });

    socket.on('disconnect', () => {
      setStatus('error');
    });

    // Pause viewer count when tab is hidden; resume on visibility.
    const handleVisibilityChange = () => {
      if (!socket.connected) return;
      if (document.hidden) {
        socket.emit('live:leave');
      } else {
        socket.emit('live:join');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socket.emit('live:leave');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { count, status };
}
