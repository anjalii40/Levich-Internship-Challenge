"use strict";

require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { createApp } = require("./app");
const { registerSocketHandlers } = require("./socket");

const PORT = process.env.PORT || 3000;
const app = createApp();

// Create raw HTTP server so we can attach Socket.io
const httpServer = http.createServer(app);

// Create Socket.io server and configure CORS as needed
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Register all socket handlers in a separate module
registerSocketHandlers(io);

// Start listening
httpServer.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
