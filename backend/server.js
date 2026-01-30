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

  // Automatic Auction Restart Logic
  const { auctionStore } = require("./auctionStore");
  let breakStartTime = null;
  const BREAK_DURATION_MS = 60 * 1000; // 60 seconds

  setInterval(() => {
    const now = Date.now();
    const items = auctionStore.getAll();
    const allEnded = items.every((item) => now >= item.endTime);

    if (allEnded) {
      if (!breakStartTime) {
        console.log("All auctions ended. Starting break period.");
        breakStartTime = now;
      } else if (now - breakStartTime >= BREAK_DURATION_MS) {
        console.log("Break ended. Restarting auctions.");
        auctionStore.reset();
        breakStartTime = null;

        // Broadcast reset to all clients
        // We emit UPDATE_BID for each item so clients refresh their state
        const freshItems = auctionStore.getAll();
        freshItems.forEach((item) => {
          io.emit("UPDATE_BID", {
            itemId: item.id,
            currentBid: item.currentBid,
            highestBidder: item.highestBidder,
            endTime: item.endTime,
            serverTime: Date.now(),
          });
        });
      }
    } else {
      // If auctions are running, ensure breakStartTime is clear (e.g. manual restart)
      breakStartTime = null;
    }
  }, 5000); // Check every 5 seconds
});
