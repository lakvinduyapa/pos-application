const Product = require("../models/Product");
const { Op } = require("sequelize");

// GET products with search + pagination
exports.getAllProducts = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const whereCondition = {
      isActive: true,
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } }
      ]
    };

    const { count, rows } = await Product.findAndCountAll({
      where: whereCondition,
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      products: rows,
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// CREATE product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, discount, tax, barcode } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = await Product.create({
      name,
      price,
      stock: stock || 0,
      discount: discount || 0,
      tax: tax || 0,
      barcode,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.update(req.body);

    res.json({
      message: "Product updated successfully",
      product,
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// SOFT DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: "Product deactivated (soft deleted)" });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};