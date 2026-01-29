# Frontend Setup Guide - Connect to Deployed Backend

## Overview
Your React frontend is now configured to connect to your Railway-deployed backend. Follow these steps to get it working.

---

## Step 1: Get Your Railway Backend URL

1. Go to [Railway Dashboard](https://railway.app)
2. Open your **Levich-Internship-Challenge** project
3. Click on the **brave-truth** (or your service name) deployment
4. Copy the **public URL** from the top (looks like `https://brave-truth-production.up.railway.app`)

---

## Step 2: Configure Frontend Environment

### Option A: Local Development (Connect to Local Backend)
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local to use:
VITE_API_BASE_URL=http://localhost:3000
```

Then start your backend and frontend:
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Option B: Connect to Railway Backend (Production)
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` and replace with your Railway URL:
```
VITE_API_BASE_URL=https://brave-truth-production.up.railway.app
```

Then start just the frontend:
```bash
cd frontend
npm run dev
```

---

## Step 3: Verify Connection

Open your browser and check:
1. **Frontend**: `http://localhost:5173` (or whatever Vite shows)
2. Check browser console (DevTools → Console tab)
3. Look for message: `[socket] connected { id: 'socket-id', url: 'your-backend-url' }`

If you see this, connection is successful! ✅

---

## Step 4: Deploy Frontend

### Option 1: Deploy to Netlify (Recommended for Frontend)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy
```

### Option 2: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

### Option 3: Deploy to Railway (alongside backend)
You can also deploy the frontend to the same Railway project:
1. Create a new service in Railway
2. Connect your GitHub repo
3. Set build command: `cd frontend && npm run build`
4. Set start command: `cd frontend && npm run preview` (or use a simple HTTP server)

---

## Troubleshooting

### Issue: "Failed to connect to backend"
- ✅ Verify Railway service is **ACTIVE** (green indicator)
- ✅ Check `.env.local` has correct URL (no trailing slash)
- ✅ Ensure no typos in the Railway URL
- ✅ Check browser DevTools → Network tab for failed requests

### Issue: "Socket connection times out"
- ✅ The backend URL is correct but unreachable
- ✅ Railway service may be sleeping (free tier) - keep it warm by visiting the URL
- ✅ Check Railway logs for errors

### Issue: CORS errors
- ✅ The backend has CORS enabled (`cors()` middleware in `app.js`)
- ✅ Frontend URL should work automatically
- ✅ If issues persist, contact support

---

## Environment Variable Reference

```
VITE_API_BASE_URL     - Backend API URL (used by Socket.io and HTTP requests)
VITE_SOCKET_URL       - (Optional) Override only Socket.io URL if different from API URL
```

Example `.env.local`:
```
VITE_API_BASE_URL=https://brave-truth-production.up.railway.app
```

---

## Quick Commands

```bash
# Development (local backend)
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Preview production build locally
cd frontend && npm run preview

# Lint code
cd frontend && npm run lint
```

---

## Next Steps

1. ✅ Update `.env.local` with your Railway URL
2. ✅ Start frontend: `npm run dev`
3. ✅ Verify socket connection in browser console
4. ✅ Test features (placing bids, etc.)
5. ✅ Deploy frontend to Netlify/Vercel when ready
6. ✅ Share both URLs with your friend

---

**Questions?** Check the browser console for detailed connection logs!
