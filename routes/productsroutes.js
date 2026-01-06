const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const authMiddleware = require("../middleware/auth"); // we will create this

// Create Product (Admin only)
router.post("/", authMiddleware(["ADMIN"]), async (req, res) => {
  try {
    const { name, price, stock, discount, tax } = req.body;
    const product = await Product.create({ name, price, stock, discount, tax });
    res.json({ message: "Product created", product });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get All Products (everyone can see)
router.get("/", async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// Update Product (Admin only)
router.put("/:id", authMiddleware(["ADMIN"]), async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, discount, tax } = req.body;
  const product = await Product.findByPk(id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await product.update({ name, price, stock, discount, tax });
  res.json({ message: "Product updated", product });
});

// Delete Product (Admin only)
router.delete("/:id", authMiddleware(["ADMIN"]), async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByPk(id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await product.destroy();
  res.json({ message: "Product deleted" });
});

module.exports = router;
