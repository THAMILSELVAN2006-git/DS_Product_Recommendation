require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/recommend", require("./routes/recommend"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/history", require("./routes/history"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/admin", require("./routes/admin"));

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

const start = async () => {
  await connectDB();
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Backend running on port ${process.env.PORT || 5000}`)
  );
};

start();
