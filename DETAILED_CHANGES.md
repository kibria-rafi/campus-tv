# Detailed Changes: Before & After

## 1. NEW FILE: `frontend/src/config/api.js`

```javascript
// central place to define backend API base URL and related helpers
// It uses a Vite environment variable so that the value can be changed
// per‑deployment (e.g. Render) while defaulting to localhost during local
// development.

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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
```

---

## 2. `frontend/src/pages/Home.jsx`

### ✏️ Added Import

```javascript
import { API_BASE } from '../config/api';
```

### ✏️ Changed URL

**Before:**

```javascript
fetch('http://localhost:5001/api/news');
```

**After:**

```javascript
fetch(`${API_BASE}/api/news`);
```

---

## 3. `frontend/src/pages/NewsDetails.jsx`

### ✏️ Added Import

```javascript
import { API_BASE } from '../config/api';
```

### ✏️ Changed 2 URLs

**Before:**

```javascript
const res = await fetch(`http://localhost:5001/api/news`);
...
const latestRes = await fetch('http://localhost:5001/api/news?limit=6');
```

**After:**

```javascript
const res = await fetch(`${API_BASE}/api/news`);
...
const latestRes = await fetch(`${API_BASE}/api/news?limit=6`);
```

---

## 4. `frontend/src/pages/VideoGallery.jsx`

### ✏️ Added Import

```javascript
import { API_BASE } from '../config/api';
```

### ✏️ Changed URL

**Before:**

```javascript
const res = await fetch('http://localhost:5001/api/news');
```

**After:**

```javascript
const res = await fetch(`${API_BASE}/api/news`);
```

---

## 5. `frontend/src/pages/Login.jsx`

### ✏️ Added Import

```javascript
import { API_BASE } from '../config/api';
```

### ✏️ Changed URL

**Before:**

```javascript
const res = await fetch('http://localhost:5001/api/admin/login', {
```

**After:**

```javascript
const res = await fetch(`${API_BASE}/api/admin/login`, {
```

---

## 6. `frontend/src/pages/New.jsx`

### ✏️ Added Import

```javascript
import { API_BASE } from '../config/api';
```

### ✏️ Changed URL

**Before:**

```javascript
const res = await fetch('http://localhost:5001/api/news');
```

**After:**

```javascript
const res = await fetch(`${API_BASE}/api/news`);
```

---

## 7. `frontend/src/pages/AboutUs.jsx`

### ✏️ Added Import

```javascript
import { API_BASE } from '../config/api';
```

### ✏️ Changed URL

**Before:**

```javascript
const res = await fetch('http://localhost:5001/api/employees');
```

**After:**

```javascript
const res = await fetch(`${API_BASE}/api/employees`);
```

---

## 8. `frontend/src/pages/AdminDashboard.jsx`

### ✏️ Added Import at Top

```javascript
import { API_BASE } from '../config/api';
```

### ✏️ Changed 7 URLs

**fetchNews():**

```javascript
// Before
const res = await fetch('http://localhost:5001/api/news');
// After
const res = await fetch(`${API_BASE}/api/news`);
```

**fetchEmployees():**

```javascript
// Before
const res = await fetch('http://localhost:5001/api/employees');
// After
const res = await fetch(`${API_BASE}/api/employees`);
```

**handleSubmit() - News URL:**

```javascript
// Before
const url = editingId
  ? `http://localhost:5001/api/news/${editingId}`
  : 'http://localhost:5001/api/news';
// After
const url = editingId
  ? `${API_BASE}/api/news/${editingId}`
  : `${API_BASE}/api/news`;
```

**handleEmployeeSubmit() - Employee URL:**

```javascript
// Before
const url = editingEmployeeId
  ? `http://localhost:5001/api/employees/${editingEmployeeId}`
  : 'http://localhost:5001/api/employees';
// After
const url = editingEmployeeId
  ? `${API_BASE}/api/employees/${editingEmployeeId}`
  : `${API_BASE}/api/employees`;
```

**handleDeleteEmployee():**

```javascript
// Before
await fetch(`http://localhost:5001/api/employees/${id}`, {
// After
await fetch(`${API_BASE}/api/employees/${id}`, {
```

**Inline Delete Button:**

```javascript
// Before
await fetch(`http://localhost:5001/api/news/${item._id}`, { method: 'DELETE' });
// After
await fetch(`${API_BASE}/api/news/${item._id}`, { method: 'DELETE' });
```

---

## 9. `frontend/src/pages/Contact.jsx`

### ✏️ Removed Old Definition & Added Import

**Before:**

```javascript
import {
  Mail,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';
```

**After:**

```javascript
import {
  Mail,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { API_BASE } from '../config/api';
```

**Note:** Environment variable standardized from `VITE_API_BASE` to `VITE_API_URL`

---

## 10. `frontend/src/pages/VideoArchive.jsx`

### ✏️ Removed Old Definition & Added Import

**Before:**

```javascript
import { useState, useEffect, useCallback } from 'react';
import { PlayCircle, X, AlertCircle, RefreshCw, Film } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';
const STEP = 12;
```

**After:**

```javascript
import { useState, useEffect, useCallback } from 'react';
import { PlayCircle, X, AlertCircle, RefreshCw, Film } from 'lucide-react';
import { API_BASE } from '../config/api';

const STEP = 12;
```

**Note:** Environment variable standardized from `VITE_API_BASE` to `VITE_API_URL`

---

## 11. `frontend/src/components/YouTubeArchivePlayer.jsx`

### ✏️ Added Import

```javascript
import { apiPath } from '../config/api';
```

### ✏️ Changed URL

**Before:**

```javascript
fetch('http://localhost:5001/api/youtube/latest?limit=10');
```

**After:**

```javascript
fetch(apiPath('/api/youtube/latest?limit=10'));
```

---

## 12. `frontend/src/hooks/useLiveViewers.js`

### ✏️ Removed Old Definition & Added Import

**Before:**

```javascript
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
```

**After:**

```javascript
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
```

**Note:**

- Removed old `VITE_BACKEND_URL` environment variable
- Now uses centralized `VITE_API_URL` via `SOCKET_URL` export
- Socket.IO and REST API use same base URL

---

## Summary of Environment Variables

### Old (Pre-Refactor)

```
VITE_API_BASE      (Contact.jsx, VideoArchive.jsx)
VITE_BACKEND_URL   (useLiveViewers.js)
```

### New (Post-Refactor)

```
VITE_API_URL       (Single source of truth for all backend URLs)
```

### Usage in Production

```bash
# Set during build/deployment
VITE_API_URL=https://campus-tv-backend.onrender.com npm run build
```

### Usage in Local Development

```bash
# Option 1: Explicitly set
VITE_API_URL=http://localhost:5001 npm run dev

# Option 2: Use default fallback (no setup needed)
npm run dev
```

---

## All Changes at a Glance

| File                                      | Type         | URLs Changed |
| ----------------------------------------- | ------------ | ------------ |
| `src/config/api.js`                       | NEW          | —            |
| `src/pages/Home.jsx`                      | Modified     | 1            |
| `src/pages/NewsDetails.jsx`               | Modified     | 2            |
| `src/pages/VideoGallery.jsx`              | Modified     | 1            |
| `src/pages/Login.jsx`                     | Modified     | 1            |
| `src/pages/New.jsx`                       | Modified     | 1            |
| `src/pages/AboutUs.jsx`                   | Modified     | 1            |
| `src/pages/AdminDashboard.jsx`            | Modified     | 7            |
| `src/pages/Contact.jsx`                   | Modified     | 0 (env var)  |
| `src/pages/VideoArchive.jsx`              | Modified     | 0 (env var)  |
| `src/components/YouTubeArchivePlayer.jsx` | Modified     | 1            |
| `src/hooks/useLiveViewers.js`             | Modified     | 0 (env var)  |
| **TOTAL**                                 | **12 files** | **15 URLs**  |
