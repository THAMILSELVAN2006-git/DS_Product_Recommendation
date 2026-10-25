const Product = require("../models/Product");
const SearchHistory = require("../models/SearchHistory");

exports.getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20, sort } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
      // Log search keyword (fire-and-forget)
      SearchHistory.create({ userId: req.user?._id || null, keyword: search }).catch(() => {});
    }
    if (category) query.category = { $regex: category, $options: "i" };

    let sortObj = {};
    if (sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "price_desc") sortObj = { price: -1 };
    else if (sort === "rating") sortObj = { rating: -1 };
    else if (search) sortObj = { score: { $meta: "textScore" } };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query, search ? { score: { $meta: "textScore" } } : {})
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({ success: true, data: products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch {
    res.status(404).json({ success: false, message: "Product not found" });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort } = req.query;
    const query = { category: { $regex: req.params.category, $options: "i" } };
    let sortObj = {};
    if (sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "price_desc") sortObj = { price: -1 };
    else sortObj = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);
    res.json({ success: true, data: products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const products = await Product.find({ ratingCount: { $gt: 0 } })
      .sort({ ratingCount: -1 })
      .limit(10);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTopRated = async (req, res) => {
  try {
    const products = await Product.find({ rating: { $gte: 4 } })
      .sort({ rating: -1 })
      .limit(20);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
