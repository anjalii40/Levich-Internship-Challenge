"use strict";

const express = require("express");
const cors = require("cors");
const { auctionStore } = require("./auctionStore");

/**
 * Creates and configures the Express application.
 *
 * This file is responsible ONLY for:
 * - Creating the Express app instance
 * - Registering global middleware
 * - Defining HTTP routes
 * It does NOT start the HTTP server or deal with Socket.io.
 */
function createApp() {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());

  // Health check route
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

   // List auction items
  app.get("/items", (req, res) => {
    const serverTime = Date.now();
    const items = auctionStore.getAll();

    res.json({
      serverTime,
      items,
    });
  });

  // Example REST endpoint
  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong" });
  });

  // // 404 handler
  // app.use((req, res, next) => {
  //   res.status(404).json({ error: "Not found" });
  // });
  app.use((req, res, next) => {
  if (req.path.startsWith("/socket.io")) {
    return next();
  }
  res.status(404).json({ error: "Not found" });
});


  // Basic error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

module.exports = {
  createApp,
};
