require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database
const sequelize = require("./config/database");

// Load model relationships
require("./models");

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productsroute");
const salesRoutes = require("./routes/salesroute");
const reportRoutes = require("./routes/reportsroute");

// Test route
app.get("/", (req, res) => {
  res.send("Grocery POS API running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportRoutes);

// Database connection + sync
sequelize.authenticate()
  .then(() => {
    console.log("Database connected successfully");

    // Development only. Later we will replace this with migrations.
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("All models synced");
  })
  .catch((err) => {
    console.error("Database error:", err);
  });

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});