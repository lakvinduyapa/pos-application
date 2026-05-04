const { Sale, SaleItem, Product, User } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

const getDateRange = (range) => {
  const now = new Date();
  const start = new Date();

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (range === "week") {
    start.setDate(now.getDate() - 7);
  } else if (range === "month") {
    start.setMonth(now.getMonth() - 1);
  } else {
    start.setHours(0, 0, 0, 0);
  }

  return { start, end: now };
};

exports.getSalesSummary = async (req, res) => {
  try {
    const { range = "today" } = req.query;
    const { start, end } = getDateRange(range);

    const sales = await Sale.findAll({
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.finalAmount), 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discountAmount), 0);
    const totalTax = sales.reduce((sum, sale) => sum + Number(sale.taxAmount), 0);

    res.json({
      range,
      totalSales,
      totalRevenue: totalRevenue.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      totalTax: totalTax.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const { range = "today", limit = 5 } = req.query;
    const { start, end } = getDateRange(range);

    const products = await SaleItem.findAll({
      attributes: [
        "productId",
        [fn("SUM", col("quantity")), "totalQuantity"],
        [fn("SUM", col("finalLineTotal")), "totalRevenue"],
      ],
      include: [
        {
          model: Product,
          attributes: ["id", "name", "barcode"],
        },
        {
          model: Sale,
          attributes: [],
          where: {
            createdAt: {
              [Op.between]: [start, end],
            },
          },
        },
      ],
      group: ["SaleItem.productId", "Product.id"],
      order: [[literal('"totalQuantity"'), "DESC"]],
      limit: Number(limit),
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getCashierPerformance = async (req, res) => {
  try {
    const { range = "today" } = req.query;
    const { start, end } = getDateRange(range);

    const performance = await Sale.findAll({
      attributes: [
        "cashierId",
        [fn("COUNT", col("Sale.id")), "totalSales"],
        [fn("SUM", col("finalAmount")), "totalRevenue"],
      ],
      include: [
        {
          model: User,
          as: "cashier",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: ["cashierId", "cashier.id"],
      order: [[literal('"totalRevenue"'), "DESC"]],
    });

    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};