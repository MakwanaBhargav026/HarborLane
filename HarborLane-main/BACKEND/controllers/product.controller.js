const Product = require("../models/product.model");

// Create a new product
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    const productObj = product.toObject();
    delete productObj.id;
    res.status(201).json(productObj);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithoutId = products.map((product) => {
      const productObj = product.toObject();
      delete productObj.id;
      return productObj;
    });
    res.status(200).json(productsWithoutId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const productObj = product.toObject();
    delete productObj.id;
    res.status(200).json(productObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a product by barcode
const getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const productObj = product.toObject();
    delete productObj.id;
    res.status(200).json(productObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a product by ID
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const productObj = product.toObject();
    delete productObj.id;
    res.status(200).json(productObj);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByBarcode,
};
