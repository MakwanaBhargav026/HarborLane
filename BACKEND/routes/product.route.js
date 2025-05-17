const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByBarcode,
} = require("../controllers/product.controller");
const {
  authenticateUser,
  authorizeRole,
} = require("../middlewares/authMiddleware");

// Create a new product
router.post("/", authenticateUser, authorizeRole(["admin"]), createProduct);

// Get all products
router.get("/", authenticateUser, authorizeRole(["admin"]), getAllProducts);

// Get a single product by ID
router.get("/:id", getProductById);

// Update a product by ID
router.put("/:id", authenticateUser, authorizeRole(["admin"]), updateProduct);

// Delete a product by ID
router.delete(
  "/:id",
  authenticateUser,
  authorizeRole(["admin"]),
  deleteProduct
);

// Get a product by barcode
router.get("/barcode/:barcode", getProductByBarcode);

module.exports = router;
