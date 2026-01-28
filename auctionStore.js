"use strict";

/**
 * In-memory auction store.
 *
 * Each item:
 * - id
 * - title
 * - startingPrice
 * - currentBid
 * - highestBidder
 * - endTime (timestamp in ms since epoch)
 *
 * NOTE:
 * - This is purely in-memory. Data is lost on server restart.
 * - endTime values are computed relative to module load (i.e. server start).
 */

const now = Date.now();

// Helper to compute future timestamps in minutes from now
const minutesFromNow = (minutes) => now + minutes * 60 * 1000;

const items = [
  {
    id: "item-1",
    title: "Vintage Watch",
    startingPrice: 100,
    currentBid: 100,
    highestBidder: null,
    endTime: minutesFromNow(2), // ends ~2 minutes from server start
  },
  {
    id: "item-2",
    title: "Antique Vase",
    startingPrice: 250,
    currentBid: 250,
    highestBidder: null,
    endTime: minutesFromNow(3.5), // ends ~3.5 minutes from server start
  },
  {
    id: "item-3",
    title: "Gaming Laptop",
    startingPrice: 800,
    currentBid: 800,
    highestBidder: null,
    endTime: minutesFromNow(5), // ends ~5 minutes from server start
  },
];

/**
 * Exported in-memory store.
 *
 * You can either use the `items` array directly or the helper methods.
 */
const auctionStore = {
  items,

  /**
   * Get all auction items.
   * @returns {Array} array of items
   */
  getAll() {
    return items;
  },

  /**
   * Get a single item by id.
   * @param {string} id
   * @returns {object | undefined}
   */
  getById(id) {
    return items.find((item) => item.id === id);
  },
};

module.exports = {
  auctionStore,
};

