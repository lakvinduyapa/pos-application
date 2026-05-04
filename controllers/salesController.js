const sequelize = require("../config/database");
const { Sale, SaleItem, Product, User } = require("../models");
const { Op } = require("sequelize");

const toNumber = (value) => Number(parseFloat(value || 0).toFixed(2));

exports.createSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { items, paymentMethod = "CASH", amountPaid } = req.body;
    const cashierId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "No sale items provided" });
    }

    if (amountPaid == null || Number(amountPaid) < 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Valid amount paid is required" });
    }

    const mergedItems = {};

    for (const item of items) {
      if (!item.productId || !item.quantity || Number(item.quantity) <= 0) {
        await transaction.rollback();
        return res.status(400).json({ message: "Invalid product or quantity" });
      }

      mergedItems[item.productId] =
        (mergedItems[item.productId] || 0) + Number(item.quantity);
    }

    let totalAmount = 0;
    let discountAmount = 0;
    let taxAmount = 0;
    const saleItemsData = [];

    for (const productId of Object.keys(mergedItems)) {
      const quantity = mergedItems[productId];

      const product = await Product.findByPk(productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product || !product.isActive) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Product not found or inactive: ${productId}`,
        });
      }

      if (product.stock < quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const unitPrice = toNumber(product.price);
      const discountRate = toNumber(product.discount);
      const taxRate = toNumber(product.tax);

      const lineTotal = toNumber(unitPrice * quantity);
      const lineDiscount = toNumber(lineTotal * (discountRate / 100));
      const taxableAmount = toNumber(lineTotal - lineDiscount);
      const lineTax = toNumber(taxableAmount * (taxRate / 100));
      const finalLineTotal = toNumber(taxableAmount + lineTax);

      totalAmount = toNumber(totalAmount + lineTotal);
      discountAmount = toNumber(discountAmount + lineDiscount);
      taxAmount = toNumber(taxAmount + lineTax);

      saleItemsData.push({
        product,
        quantity,
        unitPrice,
        discountAmount: lineDiscount,
        taxAmount: lineTax,
        lineTotal,
        finalLineTotal,
      });
    }

    const finalAmount = toNumber(totalAmount - discountAmount + taxAmount);

    const paid = toNumber(amountPaid);
    let changeAmount = 0;
    let paymentStatus = "PAID";

    if (paid < finalAmount) {
      paymentStatus = "PENDING";
      changeAmount = 0;
    } else {
      changeAmount = toNumber(paid - finalAmount);
    }

    const sale = await Sale.create(
      {
        totalAmount,
        discountAmount,
        taxAmount,
        finalAmount,
        paymentMethod,
        amountPaid: paid,
        changeAmount,
        paymentStatus,
        cashierId,
      },
      { transaction }
    );

    for (const item of saleItemsData) {
      await SaleItem.create(
        {
          saleId: sale.id,
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          taxAmount: item.taxAmount,
          lineTotal: item.lineTotal,
          finalLineTotal: item.finalLineTotal,
        },
        { transaction }
      );

      item.product.stock -= item.quantity;
      await item.product.save({ transaction });
    }

    await transaction.commit();

    const invoice = await Sale.findByPk(sale.id, {
      include: [
        {
          model: SaleItem,
          include: [Product],
        },
        {
          model: User,
          as: "cashier",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    return res.status(201).json({
      message: "Sale completed successfully",
      invoice,
    });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(500).json({
      message: "Sale failed",
      error: err.message,
    });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        {
          model: SaleItem,
          include: [Product],
        },
        {
          model: User,
          as: "cashier",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        {
          model: SaleItem,
          include: [Product],
        },
        {
          model: User,
          as: "cashier",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getSaleInvoice = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        {
          model: SaleItem,
          include: [Product],
        },
        {
          model: User,
          as: "cashier",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const invoice = {
      store: {
        name: "Grocery POS",
        address: "Colombo, Sri Lanka",
        phone: "+94 77 000 0000",
        email: "info@grocerypos.com",
      },

      receipt: {
        receiptNo: `INV-${String(sale.id).padStart(6, "0")}`,
        saleId: sale.id,
        date: sale.createdAt,
        cashier: sale.cashier?.name || "Unknown",
      },

      items: sale.SaleItems.map((item) => ({
        productId: item.Product.id,
        productName: item.Product.name,
        barcode: item.Product.barcode,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice).toFixed(2),
        lineTotal: Number(item.lineTotal).toFixed(2),
        discountAmount: Number(item.discountAmount).toFixed(2),
        taxAmount: Number(item.taxAmount).toFixed(2),
        finalLineTotal: Number(item.finalLineTotal).toFixed(2),
      })),

      totals: {
        subtotal: Number(sale.totalAmount).toFixed(2),
        discount: Number(sale.discountAmount).toFixed(2),
        tax: Number(sale.taxAmount).toFixed(2),
        grandTotal: Number(sale.finalAmount).toFixed(2),
      },

      payment: {
        method: sale.paymentMethod,
        status: sale.paymentStatus,
        amountPaid: Number(sale.amountPaid).toFixed(2),
        changeAmount: Number(sale.changeAmount).toFixed(2),
      },

      footer: {
        message: "Thank you for shopping with us!",
        note: "Goods once sold can be returned only according to store policy.",
      },
    };

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.findAll({
      where: {
        stock: { [Op.lte]: 5 },
        isActive: true,
      },
      order: [["stock", "ASC"]],
    });

    res.json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};