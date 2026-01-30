# Real-Time Auction System

## Overview

This project is a **real-time auction platform** designed to handle concurrent bidding with correctness, fairness, and instant synchronization. The system treats the server as the single source of truth for all auction states, timers, and bid validations.

The primary engineering focus is on **real-time behavior**, **race-condition handling**, and **state synchronization**, rather than typical CRUD features.

- **Live Demo (Frontend)**: [https://levich-internship-challenge-phi.vercel.app](https://levich-internship-challenge-phi.vercel.app)
- **Live Server (Backend)**: [https://levich-internship-challenge-vd39.onrender.com](https://levich-internship-challenge-vd39.onrender.com)

---

## Features

- **Live Bidding**: Real-time bid updates via Socket.io with immediate UI reflection.
- **Race Condition Handling**: Server-side synchronous processing ensures only valid bids are accepted even under heavy concurrency.
- **User Identity**: Lightweight, frontend-only identity system (persisted via `sessionStorage`).
- **Responsive Dashboard**: Adaptive grid layout scaling from mobile (1 column) to desktop (4 columns).
- **Smart Notifications**:
  - **Winning Badge**: Green "You're Winning" indicator for the highest bidder.
  - **Outbid Badge**: Red "Outbid" indicator immediately alerting users when they lose the lead.
  - **Live Animations**: Visual flash cues (Green/Red) for bid updates.
- **Auction Results**: End-of-auction banner displaying the winner and final price.
- **Automatic Restart**: Self-healing demo loop that resets auctions after a break period to allow continuous testing.

---

## Architecture & Design Decisions

### 1. Server-Authoritative Time
The system relies entirely on **server time** for auction duration and state transitions. Clients passively receive time updates. This prevents client-side manipulation (e.g., changing system clock) from affecting the auction logic.

### 2. Synchronous Bid Processing
To handle race conditions (e.g., two users bidding the same amount simultaneously):
- The server processes incoming `BID_PLACED` events synchronously in a single-threaded Node.js event loop.
- The first valid bid processed updates the state.
- Subsequent bids for the same amount or lower are rejected immediately with an `OUTBID` or `BID_ERROR` event.

### 3. Automatic Restart (Demo-Friendly)
To facilitate continuous review without manual server intervention:
- **Active Phase**: Auctions run for fixed durations (2–5 minutes).
- **Break Phase**: Once all auctions end, the system enters a 60-second break. Bids are rejected, and the UI displays a live "Restarting In X s" countdown.
- **Reset Phase**: The server automatically re-initializes all items with fresh timers and clears bid history.

### 4. Frontend-Only Identity
To keep the system lightweight and focused on real-time mechanics:
- No database authentication is used.
- Users are prompted for a **Display Name** on first load.
- This name is stored in `sessionStorage` to persist across page reloads.
- This serves as the `bidderId` for distinguishing users in the auction logic.

---

## Auction Lifecycle

1.  **Initialization**: Items load with specific end times.
2.  **Bidding**: Users place bids. Highest bid is broadcasted to all.
3.  **End**: When `serverTime >= endTime`, the auction closes.
4.  **Result**: The final state is locked. A "Winner" banner overlays the item card.
5.  **Restart Loop**: After the break period, the cycle repeats automatically.

---

## Project Structure

```
.
├── backend/              # Node.js + Express + Socket.io
│   ├── server.js        # Entry point (HTTP server + Restart Loop)
│   ├── app.js           # Express app configuration
│   ├── socket.js        # Socket.io event handlers (Business Logic)
│   └── auctionStore.js  # In-memory single-source-of-truth state
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── components/  # Smart UI Components (AuctionItemCard, etc.)
│   │   ├── pages/       # Page views
│   │   ├── lib/         # API & Socket utilities
│   │   └── hooks/       # Custom hooks (e.g., useServerNow)
│   └── .env.local       # Environment configuration
└── package.json         # Root dependencies
```

---

## API & Socket Events

### REST API
- `GET /items`: Returns initial state `{ serverTime, items: [] }`.

### Socket.io Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `BID_PLACED` | Client → Server | `{ itemId, amount, bidderId }` | User attempts to place a bid. |
| `UPDATE_BID` | Server → All | `{ itemId, currentBid, ... }` | Broadcasts new highest bid/bidder to everyone. |
| `OUTBID` | Server → Client | `{ itemId, reason }` | Sent privately to a user if their bid was rejected (too low). |
| `BID_ERROR` | Server → Client | `{ reason, message }` | Sent on validation failure (auction ended, invalid amount). |

---

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

## Deployment Notes

- **Backend**: Deployed on **Render**. It enforces strict CORS settings, allowing requests only from `localhost:5173` and the Vercel production domain.
- **Frontend**: Deployed on **Vercel**. It uses `import.meta.env.VITE_BACKEND_URL` to connect to the backend, ensuring no hardcoded localhost URLs leak into production.

---

## Scope Clarification / Non-Goals
The following features were intentionally excluded to maintain focus on the core real-time synchronization challenge:
- **Authentication**: No email/password or JWT complexity.
- **Persistence**: No database (Redis/Postgres); state is in-memory for speed and simplicity.
- **Admin Tools**: No dashboard for creating items manually.

---

## Testing & Demo Instructions

1.  **Open Multiple Clients**: Open the [Live Demo](https://levich-internship-challenge-phi.vercel.app) in two different browser windows (or Incognito mode).
2.  **Set Different Names**: Use "User A" in one window and "User B" in the other.
3.  **Bid Concurrently**: Place bids on the same item from both windows.
4.  **Observe Sync**:
    - Notice how the prices update instantly on both screens.
    - See the "Winning" badge in one window and "Outbid" in the other.
5.  **Wait for End**: Watch the timer hit zero. See the "Winner" banner appear.
6.  **Observe Restart**: Wait ~60 seconds for the system to auto-reset and allow new bidding.
