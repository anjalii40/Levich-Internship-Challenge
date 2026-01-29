# Levich-Internship-Challenge
## Real-Time Auction System

This is a **modularized full-stack project** with:
- 🔧 **Backend**: Express.js + Socket.io for real-time bidding
- 🎨 **Frontend**: React + Vite for a responsive UI

### Project Structure
```
.
├── backend/              # Node.js backend (Express + Socket.io)
│   ├── server.js        # Entry point; creates HTTP + Socket.io server
│   ├── app.js           # Express app configuration (routes + middleware)
│   ├── socket.js        # Socket.io event handlers for real-time bidding
│   ├── auctionStore.js  # In-memory auction data store
│   ├── test-socket.js   # Socket.io connection test
│   └── Dockerfile       # Docker configuration for backend
├── frontend/            # React + Vite frontend
│   ├── src/
│   ├── index.html
│   ├── .env.example     # Environment variables template
│   ├── .env.local       # Local configuration (Git ignored)
│   └── vite.config.js   # Vite configuration
├── package.json         # Root dependencies
└── nodemon.json         # Watch configuration for development
```

## Getting Started

### Backend Setup
```bash
# Install dependencies (from root)
npm install

# Start backend (development with auto-reload)
npm run dev

# Or start without auto-reload
npm start
```

Backend listens on `http://localhost:3000` by default. Override with:
```bash
PORT=4000 npm start
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment config
cp .env.example .env.local
# Edit .env.local to point to your backend URL:
# VITE_API_BASE_URL=http://localhost:3000  (local)
# or
# VITE_API_BASE_URL=https://your-railway-url  (production)

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

---

## Deployment

### Backend (Already Deployed on Railway ✅)
Your backend is deployed at: `https://brave-truth-production.up.railway.app`

- **Service Status**: ACTIVE (green)
- **Region**: us-west2
- **Auto-deploys** on push to `main`

### Frontend (Options)

#### Option 1: Netlify (Recommended)
```bash
npm install -g netlify-cli
cd frontend
netlify deploy
```

#### Option 2: Vercel
```bash
npm install -g vercel
cd frontend
vercel
```

#### Option 3: Railway (alongside backend)
Create a new service in Railway dashboard and connect your repo.

---

## Configuration

### Environment Variables

Create `frontend/.env.local` (Git ignored) with:
```env
# For local development:
VITE_API_BASE_URL=http://localhost:3000

# For production (Railway deployed backend):
VITE_API_BASE_URL=https://brave-truth-production.up.railway.app
```

See `frontend/.env.example` for more details.

## HTTP API

- `GET /health` → `{ "status": "ok" }`
- `GET /api/ping` → `{ "message": "pong" }`

## Socket.io Events

Connect to `ws://localhost:3000` (or your chosen port) using a Socket.io client.

### Events (from client to server)

- `message` – payload is forwarded to all clients:
  - **Payload**: anything JSON-serializable.
  - **Broadcast**: `io.emit("message", payload)`.

- `join_room` – join a logical room:
  - **Payload**: `room` (string).
  - Notifies others in the room via `user_joined`.

- `room_message` – send a message to a room:
  - **Payload**: `{ room, message }`.
  - Broadcasts `room_message` to all sockets in `room`.

### Events (from server to clients)

- `message` – broadcast from any `message` received.
- `user_joined` – emitted to a room when someone joins.
- `room_message` – room-scoped messages with metadata `{ room, message, from, timestamp }`.

## Notes

- CORS is configured to allow all origins by default. Tighten this for production.
- All socket logic is centralized in `socket.js` to keep the structure modular and maintainable.

