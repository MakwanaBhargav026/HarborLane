const express = require("express");
const router = express.Router();
const {
  makePayment,
  getPaymentDetails,
  verifyPayment,
  createOrder,
} = require("../controllers/payment.controller");

// // Make a payment
// router.post("/pay", makePayment);

// // Get payment details by order ID
// router.get("/:orderId", getPaymentDetails);

// Create an order
router.post("/create-order", createOrder);

// Verify a payment
router.post("/verify-payment", verifyPayment);

module.exports = router;
