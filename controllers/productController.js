const Product = require("../models/Product");

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// CREATE product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, discount, tax } = req.body;
    const product = await Product.create({ name, price, stock, discount, tax });
    res.json({ message: "Product created", product });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, discount, tax } = req.body;

  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.update({ name, price, stock, discount, tax });
    res.json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.destroy();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
