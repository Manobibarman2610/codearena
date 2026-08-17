# CodeArena — Full-Stack Deployment Guide

## 1. Frontend Deployment (Netlify)
- **Base directory:** `./`
- **Build command:** *(none required - static asset hosting)*
- **Publish directory:** `./`
- Set `CODEARENA_API_URL` environment variable to your production backend API URL.

## 2. Backend Deployment (Render / Railway / VPS)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `PORT=5001`
  - `DB_HOST=your-mysql-host`
  - `DB_PORT=3306`
  - `DB_USER=your-db-user`
  - `DB_PASSWORD=your-db-password`
  - `DB_NAME=codearena`
  - `JWT_SECRET=your-secure-jwt-secret`
  - `CLIENT_URL=https://your-frontend.netlify.app`
