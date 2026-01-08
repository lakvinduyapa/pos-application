require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database
const sequelize = require("./config/database");

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productsroute");
const salesRoutes = require("./routes/salesroute");


// Test route
app.get("/", (req, res) => {
  res.send("Grocery POS API running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
// ✅ CONNECT + SYNC DATABASE
sequelize.authenticate()
  .then(() => {
    console.log("Database connected successfully");
    return sequelize.sync({ alter: true }); // TEMPORARY
  })
  .then(() => {
    console.log("All models synced");
  })
  .catch(err => {
    console.error("Database error:", err);
  });

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
