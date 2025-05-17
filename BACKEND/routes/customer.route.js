const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customer.controller");
const {
  authenticateUser,
  authorizeRole,
} = require("../middlewares/authMiddleware");

// Create a new customer
router.post("/checkin/:qrCode", createCustomer);

// Get all customers
router.get("/", authenticateUser, authorizeRole(["admin"]), getAllCustomers);

// Get a single customer by ID
router.get("/:id", authenticateUser, authorizeRole(["admin"]), getCustomerById);

// Update a customer by ID
router.put("/:id", authenticateUser, authorizeRole(["admin"]), updateCustomer);

// Delete a customer by ID
router.delete(
  "/:id",
  authenticateUser,
  authorizeRole(["admin"]),
  deleteCustomer
);

module.exports = router;
