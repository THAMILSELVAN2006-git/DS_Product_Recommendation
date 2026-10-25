const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId required" });

    const exists = await Product.findById(productId);
    if (!exists) return res.status(404).json({ success: false, message: "Product not found" });

    const item = await Wishlist.findOneAndUpdate(
      { userId: req.user._id, productId },
      { userId: req.user._id, productId },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) return res.json({ success: true, message: "Already in wishlist" });
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.user._id })
      .populate("productId")
      .sort({ addedAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    // Support removal by wishlist _id or by productId
    const filter = req.params.id.length === 24
      ? { _id: req.params.id, userId: req.user._id }
      : { productId: req.params.id, userId: req.user._id };

    await Wishlist.findOneAndDelete(filter);
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
