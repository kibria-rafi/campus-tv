# Frontend API Refactor Summary

**Objective:** Centralize all backend API URLs to use a single Vite environment variable (`VITE_API_URL`) instead of hardcoded localhost/LAN addresses.

---

## Changes Made

### 1. Created Central API Configuration

**File:** `frontend/src/config/api.js` (NEW)

```javascript
// Exports API_BASE and SOCKET_URL from environment variable VITE_API_URL
// Falls back to http://localhost:5001 for local development
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
export const SOCKET_URL = API_BASE;
export function apiPath(path) { ... }
```

---

## Files Refactored

### Pages Updated

1. **`src/pages/Home.jsx`**
   - ✅ Imported `API_BASE` from `config/api`
   - ✅ Changed: `fetch('http://localhost:5001/api/news')` → `fetch(\`${API_BASE}/api/news\`)`

2. **`src/pages/NewsDetails.jsx`**
   - ✅ Imported `API_BASE` from `config/api`
   - ✅ Changed 2 hardcoded URLs to use `${API_BASE}/api/...`

3. **`src/pages/VideoGallery.jsx`**
   - ✅ Imported `API_BASE` from `config/api`
   - ✅ Changed: `fetch('http://localhost:5001/api/news')` → `fetch(\`${API_BASE}/api/news\`)`

4. **`src/pages/Login.jsx`**
   - ✅ Imported `API_BASE` from `config/api`
   - ✅ Changed: `fetch('http://localhost:5001/api/admin/login', ...)` → `fetch(\`${API_BASE}/api/admin/login\`, ...)`

5. **`src/pages/New.jsx`**
   - ✅ Imported `API_BASE` from `config/api`
   - ✅ Changed: `fetch('http://localhost:5001/api/news')` → `fetch(\`${API_BASE}/api/news\`)`

6. **`src/pages/AboutUs.jsx`**
   - ✅ Imported `API_BASE` from `config/api`
   - ✅ Changed: `fetch('http://localhost:5001/api/employees')` → `fetch(\`${API_BASE}/api/employees\`)`

7. **`src/pages/AdminDashboard.jsx`**
   - ✅ Imported `API_BASE` from `config/api` (at top of file)
   - ✅ Changed 7 hardcoded URLs in `fetchNews()`, `fetchEmployees()`, `handleSubmit()`, `handleEmployeeSubmit()`, and delete handlers
   - ✅ All references now use `${API_BASE}/api/...` pattern

8. **`src/pages/Contact.jsx`**
   - ✅ Removed local `const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';`
   - ✅ Imported `API_BASE` from `config/api` instead (standardized on `VITE_API_URL`)

9. **`src/pages/VideoArchive.jsx`**
   - ✅ Removed local `const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';`
   - ✅ Imported `API_BASE` from `config/api` instead (standardized on `VITE_API_URL`)

### Components Updated

10. **`src/components/YouTubeArchivePlayer.jsx`**
    - ✅ Imported `apiPath` helper from `config/api`
    - ✅ Changed: `fetch('http://localhost:5001/api/youtube/latest?limit=10')` → `fetch(apiPath('/api/youtube/latest?limit=10'))`

### Hooks Updated

11. **`src/hooks/useLiveViewers.js`**
    - ✅ Removed local `const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';`
    - ✅ Imported `SOCKET_URL` from `config/api` (now uses `VITE_API_URL`)
    - ✅ Socket.IO connection now uses the same base URL as REST API

---

## Verification

### Build Status: ✅ SUCCESS

```
✓ 1835 modules transformed
✓ Built in 2.58s
```

### Localhost/LAN URL Check: ✅ CLEAN

Only occurrence remaining in source code:

```
frontend/src/config/api.js line 6:
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
```

This is intentional - a safe fallback for local development only.

---

## Environment Variable Setup

For production deployment (e.g., Render):

**Set environment variable:**

```
VITE_API_URL=https://campus-tv-backend.onrender.com
```

**For local development:**

```
VITE_API_URL=http://localhost:5001
```

Or omit it entirely to use the default fallback.

---

## Summary of Changes

| Category                     | Count             |
| ---------------------------- | ----------------- |
| New files created            | 1                 |
| Pages refactored             | 9                 |
| Components refactored        | 1                 |
| Hooks refactored             | 1                 |
| Total hardcoded URLs removed | 13+               |
| Build status                 | ✅ Pass           |
| Localhost references in src/ | 1 (safe fallback) |

---

## Testing Checklist

- [x] Build completes without errors
- [x] No hardcoded localhost/LAN IPs in source code (except safe fallback)
- [x] Environment variable `VITE_API_URL` is respected
- [x] All API routes use centralized base URL
- [x] Socket.IO uses the same base URL as REST API
- [ ] Deploy to Render and verify production requests go to backend service (manual testing)
- [ ] Check DevTools Network tab - ensure no localhost calls (manual testing)
