const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// Routes
router.get("/", getAllProducts); // Anyone can view products
router.post("/", authMiddleware(["ADMIN"]), createProduct); // Admin only
router.put("/:id", authMiddleware(["ADMIN"]), updateProduct); // Admin only
router.delete("/:id", authMiddleware(["ADMIN"]), deleteProduct); // Admin only

module.exports = router;
