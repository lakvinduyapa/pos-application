const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  getSalesSummary,
  getTopProducts,
  getCashierPerformance,
} = require("../controllers/reportController");

router.get("/summary", authMiddleware(["ADMIN"]), getSalesSummary);
router.get("/top-products", authMiddleware(["ADMIN"]), getTopProducts);
router.get("/cashiers", authMiddleware(["ADMIN"]), getCashierPerformance);

module.exports = router;