# Levich-Internship-Challenge
# Express + Socket.io Backend (No Frontend)

This is a minimal, **cleanly modularized** Node.js backend using **Express** for HTTP routes and **Socket.io** for real-time communication. There is **no frontend code** included.

## Structure

- `server.js` – entry point; creates HTTP server, attaches Socket.io, and starts listening.
- `app.js` – creates and configures the Express app (middleware + routes). No server logic.
- `socket.js` – defines all Socket.io event handlers (connection, rooms, messages).

## Getting Started

```bash
npm install
npm run dev    # with nodemon
# or
npm start      # plain node
```

By default, the server listens on port `3000`. You can override this using the `PORT` environment variable.

Example:

```bash
PORT=4000 npm start
```

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

