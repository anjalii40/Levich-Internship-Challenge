# Levich Internship Challenge
## Real-Time Auction System

This is a **real-time auction platform** featuring live bidding, instant updates, and user identity tracking.

- 🔧 **Backend**: Node.js, Express, Socket.io (Deployed on Render)
- 🎨 **Frontend**: React, Vite, Plain CSS (Deployed on Vercel)

### Features Implemented
- **Live Bidding**: Real-time bid updates via Socket.io.
- **User Identity**: Frontend-only identity (prompts for name), persisting across reloads.
- **Responsive Dashboard**: Adaptive grid layout (Desktop to Mobile).
- **Visual Feedback**:
  - Green flash/badge for winning bids.
  - Red flash/badge for outbid notifications.
  - Live countdown timers.

---

## Project Structure
```
.
├── backend/              # Node.js backend
│   ├── server.js        # Entry point (HTTP + Socket.io)
│   ├── app.js           # Express app setup (CORS, Routes)
│   ├── socket.js        # Socket.io event handlers (BID_PLACED, etc.)
│   └── auctionStore.js  # In-memory auction state
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── components/  # UI Components (AuctionItemCard, Layout)
│   │   ├── pages/       # Page views (HomePage)
│   │   ├── lib/         # Utilities (socket, http, time)
│   │   └── hooks/       # Custom hooks (useServerNow)
│   └── .env.local       # Local config
└── package.json         # Root dependencies
```

## Getting Started

### 1. Backend Setup
```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure Environment
cp .env.example .env.local
```

**Edit `.env.local`**:
```env
# For local development:
VITE_BACKEND_URL=http://localhost:3000

# For production (if pointing to live backend):
VITE_BACKEND_URL=https://levich-internship-challenge-vd39.onrender.com
```

```bash
# Start frontend (port 5173)
npm run dev
```

---

## Deployment Status

**Backend** (Render): `https://levich-internship-challenge-vd39.onrender.com`
**Frontend** (Vercel): `https://levich-internship-challenge-phi.vercel.app`

### Configuration Notes
- **CORS**: The backend is configured to accept requests ONLY from `localhost:5173` and the Vercel production domain.
- **Environment**: Frontend strictly uses `import.meta.env.VITE_BACKEND_URL`. No hardcoded fallbacks are left in the code.

---

## API & Events

### REST API
- `GET /items`: Returns `{ serverTime, items: [] }`

### Socket.io Events
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `BID_PLACED` | Client → Server | `{ itemId, amount, bidderId }` | User places a bid. |
| `UPDATE_BID` | Server → All | `{ itemId, currentBid, ... }` | Broadcasts new highest bid. |
| `OUTBID` | Server → Client | `{ itemId, reason }` | Sent to user if their bid is too low. |
| `BID_ERROR` | Server → Client | `{ reason, message }` | Sent on validation failure. |
