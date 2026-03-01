// Backend API base URL. Set VITE_API_URL on Render for production;
// falls back to localhost for local development.
//
// REQUIRED on Render (frontend service → Environment):
//   VITE_API_URL=https://<your-backend-service>.onrender.com

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Warn once in dev if the env var is missing — in production this means every
// fetch will hit localhost (wrong URL).
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.warn(
    '[api.js] VITE_API_URL is not set. Falling back to http://localhost:5001.'
  );
}

console.log('[api.js] API_BASE resolved to:', API_BASE);

// Socket URL defaults to the same origin as the API.
export const SOCKET_URL = API_BASE;

// Prefix a path with the API base URL.
export function apiPath(path) {
  if (path.startsWith('/')) {
    return `${API_BASE}${path}`;
  }
  return `${API_BASE}/${path}`;
}
