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
    const BREAK_DURATION = auctionStore.BREAK_DURATION;

    items.forEach((item) => {
      // 1. Check if auction ended and needs to enter break
      if (now >= item.endTime && !item.breakStartTime) {
        console.log(`Auction ended for ${item.id}. Starting break period.`);
        auctionStore.setItemBreakStartTime(item.id, now);

        // Notify clients about break start for this item
        io.emit("UPDATE_BID", {
          itemId: item.id,
          serverTime: now,
          breakStartTime: now,
          // We can also send breakDuration if client needs it dynamcially, 
          // but usually fixed constant. 
        });
      }
      // 2. Check if break ended and needs to restart
      else if (item.breakStartTime && now - item.breakStartTime >= BREAK_DURATION) {
        console.log(`Break ended for ${item.id}. Restarting auction.`);

        // Reset the item
        const freshItem = auctionStore.resetItem(item.id);

        // Notify clients about restart
        io.emit("UPDATE_BID", {
          itemId: freshItem.id,
          currentBid: freshItem.currentBid,
          highestBidder: freshItem.highestBidder,
          endTime: freshItem.endTime,
          serverTime: now,
          breakStartTime: null, // Clear the break time on client
        });
      }
    });
  }, 1000); // Check every 1 second
});
