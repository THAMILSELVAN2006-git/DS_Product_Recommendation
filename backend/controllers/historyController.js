const History = require("../models/History");

exports.addHistory = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId required" });
    // Upsert: update viewedAt if already exists, else create
    const item = await History.findOneAndUpdate(
      { userId: req.user._id, productId },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const items = await History.find({ userId: req.user._id })
      .populate("productId")
      .sort({ viewedAt: -1 })
      .limit(50);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await History.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: "History cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
