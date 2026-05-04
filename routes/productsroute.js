const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById
} = require("../controllers/productController");

// Public (POS usage)
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin only
router.post("/", authMiddleware(["ADMIN"]), createProduct);
router.put("/:id", authMiddleware(["ADMIN"]), updateProduct);
router.delete("/:id", authMiddleware(["ADMIN"]), deleteProduct);

module.exports = router;