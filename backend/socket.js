"use strict";

const { auctionStore } = require("./auctionStore");

/**
 * Configure all Socket.io event handlers here.
 *
 * No HTTP/Express logic should live here.
 *
 * @param {import("socket.io").Server} io
 */
function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    /**
     * BID_PLACED
     *
     * Payload (expected):
     * {
     *   itemId: string,
     *   amount: number,
     *   bidderId?: string
     * }
     *
     * Rules:
     * - Item must exist.
     * - Auction must not be ended (based on server time).
     * - Bid must be strictly greater than currentBid.
     *
     * Emits:
     * - UPDATE_BID (to all clients) on success.
     * - OUTBID (to sender) if bid is too low or equal.
     * - BID_ERROR (to sender) for invalid item/auction-ended/validation issues.
     *
     * Implementation is fully synchronous so that, in a single-node setup,
     * each bid is processed atomically relative to the in-memory store.
     */
    socket.on("BID_PLACED", (payload) => {
      const receivedAt = Date.now();

      // Basic payload validation
      if (
        !payload ||
        typeof payload.itemId !== "string" ||
        typeof payload.amount !== "number" ||
        !Number.isFinite(payload.amount) ||
        payload.amount <= 0
      ) {
        socket.emit("BID_ERROR", {
          reason: "invalid_payload",
          message: "Invalid bid payload.",
        });
        return;
      }

      const { itemId, amount, bidderId = socket.id } = payload;

      const item = auctionStore.getById(itemId);
      if (!item) {
        socket.emit("BID_ERROR", {
          reason: "item_not_found",
          itemId,
          message: "Auction item not found.",
        });
        return;
      }

      // Re-check auction status using current server time
      const now = Date.now();
      if (now >= item.endTime) {
        socket.emit("BID_ERROR", {
          reason: "auction_ended",
          itemId,
          message: "Auction has already ended.",
          serverTime: now,
          endTime: item.endTime,
        });
        return;
      }

      // Handle duplicate/self bids:
      // - If the same bidder re-sends a bid equal to the current highest,
      //   treat it as a no-op / error rather than "outbid".
      if (amount === item.currentBid && item.highestBidder === bidderId) {
        socket.emit("BID_ERROR", {
          reason: "duplicate_bid",
          itemId,
          attemptedBid: amount,
          message: "You already hold the current highest bid.",
          serverTime: now,
        });
        return;
      }

      // Enforce strictly greater than currentBid
      if (amount <= item.currentBid) {
        socket.emit("OUTBID", {
          reason: "bid_too_low",
          itemId,
          attemptedBid: amount,
          currentBid: item.currentBid,
          highestBidder: item.highestBidder,
          serverTime: now,
        });
        return;
      }

      // At this point, within a single-node synchronous handler,
      // this update is effectively atomic with respect to other bids.
      item.currentBid = amount;
      item.highestBidder = bidderId;

      const updatePayload = {
        itemId,
        currentBid: item.currentBid,
        highestBidder: item.highestBidder,
        serverTime: now,
        endTime: item.endTime,
      };

      // Notify everyone about the new highest bid
      io.emit("UPDATE_BID", updatePayload);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
}

module.exports = {
  registerSocketHandlers,
};
