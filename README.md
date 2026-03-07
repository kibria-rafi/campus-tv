# 📺 Campus TV

**Campus TV** is a full-stack university broadcasting web platform that delivers live TV streaming, a news publishing system, YouTube video archives, and a complete content management dashboard — all in one place.

---

## 🌐 Live Website

| Resource      | URL                                                              |
| ------------- | ---------------------------------------------------------------- |
| **Live Site** | [https://campus-tv.onrender.com](https://campus-tv.onrender.com) |

---

## ✨ Features

- **Live TV Streaming** — Real-time broadcast player powered by Video.js with a live viewer counter via Socket.IO
- **News Publishing System** — Create, edit, and manage news articles with a rich-text editor
- **YouTube Video Integration** — Browse and watch archived video content pulled from a YouTube channel
- **Admin Dashboard** — Secure content management panel for managing news, stream settings, and messages
- **Contact Form & Message Inbox** — Visitors can submit messages; admins can view and manage them in the dashboard
- **Dark / Light Theme** — System-aware theme toggle for optimal viewing comfort
- **Responsive Design** — Mobile-first layout with a bottom navigation bar for small screens
- **JWT Authentication** — Token-based authentication protecting all admin routes

---

## 🛠️ Technology Stack

### Frontend

| Technology                                              | Purpose                     |
| ------------------------------------------------------- | --------------------------- |
| [React 18](https://react.dev/)                          | UI component framework      |
| [Vite](https://vitejs.dev/)                             | Build tool and dev server   |
| [Tailwind CSS](https://tailwindcss.com/)                | Utility-first CSS framework |
| [React Router v7](https://reactrouter.com/)             | Client-side routing         |
| [Video.js](https://videojs.com/)                        | HLS live stream player      |
| [Socket.IO Client](https://socket.io/)                  | Real-time live viewer count |
| [React Quill](https://github.com/zenoamaro/react-quill) | Rich-text news editor       |
| [Lucide React](https://lucide.dev/)                     | Icon library                |

### Backend

| Technology                                                       | Purpose                           |
| ---------------------------------------------------------------- | --------------------------------- |
| [Node.js](https://nodejs.org/)                                   | JavaScript runtime                |
| [Express.js v5](https://expressjs.com/)                          | Web application framework         |
| [MongoDB](https://www.mongodb.com/)                              | NoSQL database                    |
| [Mongoose](https://mongoosejs.com/)                              | MongoDB object modeling           |
| [JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken) | Authentication tokens             |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js)                 | Password hashing                  |
| [Socket.IO](https://socket.io/)                                  | Real-time WebSocket communication |
| [dotenv](https://github.com/motdotla/dotenv)                     | Environment variable management   |

### Database & Deployment

| Service                                        | Role                       |
| ---------------------------------------------- | -------------------------- |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Managed cloud database     |
| [Render](https://render.com/)                  | Frontend & backend hosting |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Client Browser                  │
│              React + Vite + Tailwind CSS             │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP / WebSocket
┌──────────────────────▼──────────────────────────────┐
│               Backend (Node.js / Express)            │
│                                                      │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────┐  │
│  │  REST API    │  │ Socket.IO  │  │ JWT Auth    │  │
│  │  /api/news   │  │ Live Count │  │ Middleware  │  │
│  │  /api/contact│  └────────────┘  └─────────────┘  │
│  │  /api/youtube│                                    │
│  └──────────────┘                                    │
└──────────────────────┬──────────────────────────────┘
                       │  Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│               MongoDB Atlas (Cloud DB)               │
│         Collections: news · contacts · users         │
└─────────────────────────────────────────────────────┘
```

---

## 📸 Project Screenshots

### Homepage

![Homepage](screenshots/SCREENSHOT_01_HOMEPAGE.png)

### Live Streaming Page

![Live Streaming Page](screenshots/SCREENSHOT_02_LIVE_STREAM.png)

### News Section

![News Section](screenshots/SCREENSHOT_03_NEWS_SECTION.png)

---

## ⚙️ Installation & Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (or a local MongoDB instance)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/campus-tv.git
cd campus-tv
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory (see [Environment Variables](#-environment-variables)), then start the server:

```bash
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal tab:

```bash
cd frontend
npm install
npm run dev
# Dev server runs on http://localhost:5173
```

The frontend proxies API requests to the backend automatically via the Vite config.

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory with the following keys:

```env
# MongoDB connection string from MongoDB Atlas
MONGO_URI=your_mongodb_connection_string

# Secret key used to sign JWT tokens
JWT_SECRET=your_jwt_secret

# YouTube Data API v3 key
YOUTUBE_API_KEY=your_youtube_api_key

# Your YouTube channel ID
YOUTUBE_CHANNEL_ID=your_channel_id

# Allowed CORS origin (your deployed frontend URL)
FRONTEND_URL=https://your-frontend-domain.com
```

> **Never commit your `.env` file to version control.** It is listed in `.gitignore` by default.

---

## 📁 Project Structure

```
campus-tv/
├── backend/
│   ├── server.js              # Express app entry point, Socket.IO setup
│   ├── package.json
│   ├── models/
│   │   └── ContactMessage.js  # Mongoose schema for contact messages
│   └── routes/
│       └── youtube.js         # YouTube API proxy route
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx            # Root component with router and theme provider
│       ├── main.jsx
│       ├── data.js            # Static data (nav links, team info, etc.)
│       ├── assets/
│       ├── components/        # Reusable UI components
│       │   ├── Navbar.jsx
│       │   ├── BottomNav.jsx
│       │   ├── Footer.jsx
│       │   ├── LivePlayer.jsx
│       │   ├── LiveViewerBadge.jsx
│       │   ├── VideoJsPlayer.jsx
│       │   ├── VideoSidebar.jsx
│       │   ├── YouTubeArchivePlayer.jsx
│       │   ├── Ticker.jsx
│       │   ├── ScrollToTop.jsx
│       │   ├── AdminMessages.jsx
│       │   └── ui/
│       │       └── Loader.jsx
│       ├── config/
│       │   ├── api.js         # Axios base URL configuration
│       │   └── liveStream.js  # HLS stream URL config
│       ├── context/
│       │   └── ThemeContext.jsx
│       ├── hooks/
│       │   ├── useLiveViewers.js
│       │   └── useStreamSettings.js
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Live.jsx
│       │   ├── New.jsx        # News listing page
│       │   ├── NewsDetails.jsx
│       │   ├── VideoArchive.jsx
│       │   ├── VideoGallery.jsx
│       │   ├── CampusRadio.jsx
│       │   ├── Contact.jsx
│       │   ├── AboutUs.jsx
│       │   ├── SearchPage.jsx
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   └── AdminDashboard.jsx
│       └── utils/
│           ├── lang.js        # Multilingual utility helpers
│           └── theme.js       # Theme utility helpers
│
└── screenshots/
    ├── SCREENSHOT_01_HOMEPAGE.png
    ├── SCREENSHOT_02_LIVE_STREAM.png
    └── SCREENSHOT_03_NEWS_SECTION.png
```

---

## Deployment

Both the frontend and backend are deployed on **[Render](https://render.com/)**.

### Backend (Web Service)

| Setting            | Value                                                                               |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Root Directory** | `backend`                                                                           |
| **Build Command**  | `npm install`                                                                       |
| **Start Command**  | `node server.js`                                                                    |
| **Environment**    | Add all variables from the [Environment Variables](#-environment-variables) section |

### Frontend (Static Site)

| Setting               | Value                          |
| --------------------- | ------------------------------ |
| **Root Directory**    | `frontend`                     |
| **Build Command**     | `npm install && npm run build` |
| **Publish Directory** | `frontend/dist`                |

> Set the `VITE_API_URL` environment variable on Render to point to your deployed backend URL (e.g. `https://campus-tv-api.onrender.com`).

### Database

The project uses **[MongoDB Atlas](https://www.mongodb.com/atlas)** as the cloud database. Create a free-tier cluster, whitelist Render's IP addresses (or set `0.0.0.0/0` for open access), and paste the connection string as `MONGO_URI` in your environment variables.

---

## 📄 License

This project is intended for educational and university broadcasting purposes.
