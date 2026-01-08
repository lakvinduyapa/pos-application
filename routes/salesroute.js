const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createSale, getSaleById, getAllSales } = require("../controllers/salesController");

// Create checkout sale
router.post("/", authMiddleware(["ADMIN", "CASHIER"]), createSale);

// Get single sale (invoice)
router.get("/:id", authMiddleware(["ADMIN", "CASHIER"]), getSaleById);

// Get all sales (history)
router.get("/", authMiddleware(["ADMIN"]), getAllSales);

module.exports = router;
