const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  keyword: { type: String, required: true },
  searchedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
