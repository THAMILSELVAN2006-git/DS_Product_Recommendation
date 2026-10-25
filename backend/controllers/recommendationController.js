const mlClient = require("../services/mlClient");
const Product = require("../models/Product");

exports.recommend = async (req, res) => {
  const { product, productId } = req.body;

  let productName = product;

  // If productId (MongoDB _id) provided, look up the name
  if (!productName && productId) {
    try {
      const p = await Product.findById(productId);
      if (p) productName = p.name;
    } catch {
      // ignore
    }
  }

  if (!productName) {
    return res.status(400).json({ success: false, message: "product name or productId required" });
  }

  try {
    const { data: mlResults } = await mlClient.post("/recommend", { product: productName });

    // Enrich ML results with MongoDB _id so the frontend can link to /product/:mongoId
    const enriched = await Promise.all(
      mlResults.map(async (item) => {
        try {
          // Match by productId field (CSV id) first, then by name
          let doc = await Product.findOne({ productId: item.productId }).select("_id imageUrl").lean();
          if (!doc) {
            doc = await Product.findOne({ name: item.name }).select("_id imageUrl").lean();
          }
          return {
            ...item,
            _id: doc?._id || null,
            // Use MongoDB imageUrl as fallback if ML service imageUrl is stale
            imageUrl: item.imageUrl || doc?.imageUrl || "",
          };
        } catch {
          return { ...item, _id: null };
        }
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) {
      return res.json({ success: true, data: [], message: "No similar products found" });
    }
    console.error("[Recommend] ML service error:", err.message);
    res.json({ success: true, data: [], message: "Recommendation service temporarily unavailable" });
  }
};
