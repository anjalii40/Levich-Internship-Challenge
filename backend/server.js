"use strict";

require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { createApp } = require("./app");
const { registerSocketHandlers } = require("./socket");

const PORT = process.env.PORT || 3000;
const app = createApp();

// CORS configuration for Socket.io (frontend origins only)
const allowedOrigins = [
  'http://localhost:5173',      // Local development (frontend - Vite)
  'https://levich-internship-challenge-phi.vercel.app', // Vercel frontend
];

// Create raw HTTP server so we can attach Socket.io
const httpServer = http.createServer(app);

// Create Socket.io server and configure CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Register all socket handlers in a separate module
registerSocketHandlers(io);

// Start listening
httpServer.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
