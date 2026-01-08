const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createSale, getSaleById, getAllSales, getSaleInvoice, getLowStockProducts } = require("../controllers/salesController");

// Create checkout sale
router.post("/", authMiddleware(["ADMIN", "CASHIER"]), createSale);

// Low stock products
router.get("/low-stock", authMiddleware(["ADMIN"]), getLowStockProducts);

// GET sale invoice (specific route first!)
router.get("/:id/invoice", authMiddleware(["ADMIN", "CASHIER"]), getSaleInvoice);

// Get single sale
router.get("/:id", authMiddleware(["ADMIN", "CASHIER"]), getSaleById);

// Get all sales (history)
router.get("/", authMiddleware(["ADMIN"]), getAllSales);



module.exports = router;
