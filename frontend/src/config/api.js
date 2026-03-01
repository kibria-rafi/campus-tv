// central place to define backend API base URL and related helpers
// It uses a Vite environment variable so that the value can be changed
// per‑deployment (e.g. Render) while defaulting to localhost during local
// development.
//
// REQUIRED on Render (frontend service → Environment):
//   VITE_API_URL=https://<your-backend-service>.onrender.com

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Warn once in dev if the env var is missing — in production this means every
// fetch will hit localhost (wrong URL).
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.warn(
    '[api.js] VITE_API_URL is not set. Falling back to http://localhost:5001. ' +
      'Set VITE_API_URL in .env.local for local dev, or on Render for production.'
  );
}

console.log('[api.js] API_BASE resolved to:', API_BASE);

// socket URL is usually the same origin as the API. Exported separately in case
// the two diverge in the future.
export const SOCKET_URL = API_BASE;

// helper that prefixes a route with the base URL, making it easier to call
// fetch/axios without repeating the template string everywhere.
export function apiPath(path) {
  if (path.startsWith('/')) {
    return `${API_BASE}${path}`;
  }
  return `${API_BASE}/${path}`;
}
