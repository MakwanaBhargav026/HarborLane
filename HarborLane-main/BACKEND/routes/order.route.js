const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderDetails,
} = require("../controllers/order.controller");

// Create an order (after successful payment)
router.post("/create", createOrder);

// Get order details by order ID
router.get("/:orderId", getOrderDetails);

module.exports = router;
