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

// Create a new product
router.post("/", createProduct);

// Get all products
router.get("/", getAllProducts);

// Get a single product by ID
router.get("/:id", getProductById);

// Update a product by ID
router.put("/:id", updateProduct);

// Delete a product by ID
router.delete("/:id", deleteProduct);

// Get a product by barcode
router.get("/barcode/:barcode", getProductByBarcode);

module.exports = router;
