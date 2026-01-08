const { Sale, SaleItem, Product } = require("../models");

// CREATE SALE (checkout)
exports.createSale = async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    const cashier = req.user.id; // Logged-in user

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    let total = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    // Calculate totals
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      const basePrice = product.price * item.quantity;
      const discount = basePrice * (product.discount / 100);
      const tax = (basePrice - discount) * (product.tax / 100);

      total += basePrice;
      totalDiscount += discount;
      totalTax += tax;
    }

    const finalAmount = total - totalDiscount + totalTax;

    // Create sale
    const sale = await Sale.create({
      totalAmount: total,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      finalAmount,
      cashier
    });

    // Create sale items and reduce stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId);

      await SaleItem.create({
        SaleId: sale.id,
        ProductId: product.id,
        quantity: item.quantity,
        price: product.price
      });

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    res.json({ message: "Sale completed", saleId: sale.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET single sale (invoice)
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByPk(id, { include: SaleItem });
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET all sales (history)
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({ include: SaleItem, order: [["createdAt", "DESC"]] });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
