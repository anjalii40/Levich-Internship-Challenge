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

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:3000',      // Local development (backend)
    'http://localhost:5173',      // Local development (frontend - Vite)
    'https://levich-internship-challenge-phi.vercel.app', // Vercel frontend
    'https://brave-truth-production.up.railway.app', // Railway backend (for testing)
  ];

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
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
