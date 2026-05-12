# 📺 Campus TV

A full-stack university broadcasting platform with live TV streaming, news publishing, YouTube video archives, and an admin dashboard.

🌐 **Live:** [https://campustv.ac](https://campustv.ac)

---

## ✨ Features

- Live TV streaming with real-time viewer count
- News publishing with a rich-text editor
- YouTube video archive integration
- Admin dashboard (news, stream settings, message inbox)
- Contact form with admin inbox
- Dark / Light theme toggle
- Responsive, mobile-first design
- JWT-based authentication

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Video.js, Socket.IO Client

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Socket.IO

**Hosting:** Render (frontend & backend), MongoDB Atlas (database)

---

## 📸 Screenshots

### Homepage

![Homepage](screenshots/SCREENSHOT_01_HOMEPAGE.png)

### Live Streaming Page

![Live Streaming Page](screenshots/SCREENSHOT_02_LIVE_STREAM.png)

### News Section

![News Section](screenshots/SCREENSHOT_03_NEWS_SECTION.png)

---

## ⚙️ Local Setup

**Prerequisites:** Node.js v18+, npm v9+, MongoDB Atlas account

```bash
# 1. Clone
git clone https://github.com/your-username/campus-tv.git
cd campus-tv

# 2. Backend
cd backend && npm install
# Create backend/.env (see Environment Variables below)
npm start          # http://localhost:5001

# 3. Frontend (new terminal)
cd frontend && npm install
npm run dev        # http://localhost:5173
```

---

## 🔐 Environment Variables

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_USER=admin
ADMIN_PASS=change_this_password
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_channel_id
FRONTEND_URL=https://your-frontend-domain.com
FRONTEND_URL_DEV=http://localhost:5173
PORT=5001
```

Create `frontend/.env` for local development:

```env
VITE_API_URL=http://localhost:5001
```

---

## 📁 Project Structure

```
campus-tv/
├── backend/
│   ├── server.js
│   ├── models/
│   └── routes/
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── hooks/
        ├── context/
        ├── config/
        └── utils/
```

---

## 🚀 Deployment

Both services are deployed on **[Render](https://render.com/)**.

|           | Backend          | Frontend                         |
| --------- | ---------------- | -------------------------------- |
| **Root**  | `backend`        | `frontend`                       |
| **Build** | `npm install`    | `npm install && npm run build`   |
| **Start** | `node server.js` | _(static site — publish `dist`)_ |

Add all environment variables from the section above to the backend service on Render.

For Render production deployments, set:

- Frontend service: `VITE_API_URL=https://<your-backend-service>.onrender.com`
- Backend service: `MONGO_URI`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`, `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`, `FRONTEND_URL`

---

## 📄 License

For educational and university broadcasting purposes.
