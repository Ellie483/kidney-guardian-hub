// backend/models/similarCache.model.js
const mongoose = require("mongoose");

const similarCacheSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    signature: { type: String, index: true }, // snapshot of profile + version
    results: [
      {
        patientId: String,
        score: Number, // 0..100
      },
    ],
    // optional denormalized cards to save a round-trip
    cards: { type: Array, default: [] },
  },
  { timestamps: true, collection: "similar_cache" }
);

module.exports = mongoose.model("SimilarCache", similarCacheSchema);
