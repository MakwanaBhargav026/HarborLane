const express = require("express");
const router = express.Router();
const {
  verifyPayment,
  createOrder,
  getAllPayments,
} = require("../controllers/payment.controller");
const {
  authenticateUser,
  authorizeRole,
} = require("../middlewares/authMiddleware");

// Create an order
router.post("/create-order", createOrder);

// Verify a payment
router.post("/verify-payment", verifyPayment);

// Get all payments
router.get("/", authenticateUser, getAllPayments);

module.exports = router;
