const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customer.controller");

// Create a new customer
router.post("/checkin/:qrCode", createCustomer);

// Get all customers
router.get("/", getAllCustomers);

// Get a single customer by ID
router.get("/:id", getCustomerById);

// Update a customer by ID
router.put("/:id", updateCustomer);

// Delete a customer by ID
router.delete("/:id", deleteCustomer);

module.exports = router;
