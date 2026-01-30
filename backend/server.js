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

  setInterval(() => {
    const now = Date.now();
    const items = auctionStore.getAll();
    const { breakStartTime, breakDuration } = auctionStore.getBreakStatus();

    // Check if everything ended
    const allEnded = items.every((item) => now >= item.endTime);

    if (allEnded) {
      if (!breakStartTime) {
        console.log("All auctions ended. Starting break period.");
        auctionStore.setBreakStartTime(now);

        // Notify clients about break start
        const status = auctionStore.getBreakStatus();
        io.emit("UPDATE_BID", {
          // Send a "dummy" update to trigger state sync or general status update
          itemId: "ALL",
          serverTime: now,
          breakStatus: status,
        });

      } else if (now - breakStartTime >= breakDuration) {
        console.log("Break ended. Restarting auctions.");
        auctionStore.reset();

        // Notify clients about restart (breakStatus will be null from store)
        const newStatus = auctionStore.getBreakStatus();
        const freshItems = auctionStore.getAll();

        freshItems.forEach((item) => {
          io.emit("UPDATE_BID", {
            itemId: item.id,
            currentBid: item.currentBid,
            highestBidder: item.highestBidder,
            endTime: item.endTime,
            serverTime: Date.now(),
            breakStatus: newStatus,
          });
        });
      }
    }
  }, 5000); // Check every 5 seconds
});
