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
 * - breakStartTime (timestamp in ms when break started, or null if active)
 *
 * NOTE:
 * - This is purely in-memory. Data is lost on server restart.
 * - endTime values are computed relative to module load (i.e. server start).
 */

const now = Date.now();

// Helper to compute future timestamps in minutes from now
const minutesFromNow = (minutes) => now + minutes * 60 * 1000;

const BREAK_DURATION = 60 * 1000;

const items = [
  {
    id: "item-1",
    title: "Vintage Watch",
    startingPrice: 100,
    currentBid: 100,
    highestBidder: null,
    endTime: minutesFromNow(1), // ends ~1 minute from server start
    breakStartTime: null,
  },
  {
    id: "item-2",
    title: "Antique Vase",
    startingPrice: 250,
    currentBid: 250,
    highestBidder: null,
    endTime: minutesFromNow(1.5), // ends ~1.5 minutes from server start
    breakStartTime: null,
  },
  {
    id: "item-3",
    title: "Gaming Laptop",
    startingPrice: 800,
    currentBid: 800,
    highestBidder: null,
    endTime: minutesFromNow(2), // ends ~2 minutes from server start
    breakStartTime: null,
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

  /**
   * Reset all auctions.
   * - Reset currentBid to startingPrice
   * - Clear highestBidder
   * - Set new endTime
   * - Clear breakStartTime
   */
  reset() {
    const now = Date.now();
    items.forEach((item) => {
      this.resetItem(item.id);
    });
    return items;
  },

  /**
   * Set break start time for a specific item.
   * @param {string} itemId
   * @param {number} time
   */
  setItemBreakStartTime(itemId, time) {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      item.breakStartTime = time;
    }
  },

  resetItem(itemId) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const now = Date.now();
    item.currentBid = item.startingPrice;
    item.highestBidder = null;
    item.breakStartTime = null;

    const durationMap = {
      "item-1": 1,
      "item-2": 1.5,
      "item-3": 2,
    };
    const duration = durationMap[itemId] || 2;
    item.endTime = now + duration * 60 * 1000;

    return item;
  },

  // Constant for external usage
  BREAK_DURATION,

  getBreakStatus() {
    return { breakStartTime: null, breakDuration: BREAK_DURATION };
  },
};

module.exports = {
  auctionStore,
};
