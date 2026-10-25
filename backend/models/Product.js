const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: { type: String, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: Number,
  originalPrice: Number,
  discountPercent: Number,
  rating: Number,
  ratingCount: Number,
  description: String,
  imageUrl: String,
  amazonLink: String,
});

productSchema.index({ name: "text", category: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
