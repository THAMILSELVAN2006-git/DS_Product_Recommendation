/**
 * Seed script: loads amazon.csv into MongoDB Product collection.
 * Run: node seed.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { parse } = require("csv-parse/sync");
const Product = require("./models/Product");

function cleanPrice(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^\d.]/g, "")) || 0;
}

function cleanPercent(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^\d.]/g, "")) || 0;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const csvPath = path.join(__dirname, "../dataset/amazon.csv");
  const raw = fs.readFileSync(csvPath);
  const records = parse(raw, { columns: true, skip_empty_lines: true });

  const seen = new Set();
  const docs = [];

  for (const r of records) {
    if (!r.product_id || !r.product_name || seen.has(r.product_id)) continue;
    seen.add(r.product_id);
    docs.push({
      productId: r.product_id,
      name: r.product_name,
      category: r.category || "General",
      price: cleanPrice(r.discounted_price),
      originalPrice: cleanPrice(r.actual_price),
      discountPercent: cleanPercent(r.discount_percentage),
      rating: parseFloat(r.rating) || 0,
      ratingCount: parseInt(String(r.rating_count || "0").replace(/[^\d]/g, "")) || 0,
      description: r.about_product || "",
      imageUrl: r.img_link || "",
      amazonLink: r.product_link || "",
    });
  }

  await Product.deleteMany({});
  await Product.insertMany(docs, { ordered: false });
  console.log(`Seeded ${docs.length} products.`);
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
