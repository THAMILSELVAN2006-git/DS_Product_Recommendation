const User = require("../models/User");
const Product = require("../models/Product");
const SearchHistory = require("../models/SearchHistory");
const History = require("../models/History");

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalProducts, searchesToday] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      SearchHistory.countDocuments({ searchedAt: { $gte: today } }),
    ]);

    res.json({ success: true, data: { totalUsers, totalProducts, searchesToday } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTopSearches = async (req, res) => {
  try {
    const results = await SearchHistory.aggregate([
      { $group: { _id: "$keyword", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { keyword: "$_id", count: 1, _id: 0 } },
    ]);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPopularProducts = async (req, res) => {
  try {
    const results = await History.aggregate([
      { $group: { _id: "$productId", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $project: { name: "$product.name", views: 1, _id: 0 } },
    ]);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
