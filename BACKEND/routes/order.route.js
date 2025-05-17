const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderDetails,
  getAllOrders,
  getCustomersData,
} = require("../controllers/order.controller");
const {
  authenticateUser,
  authorizeRole,
} = require("../middlewares/authMiddleware");

// Create an order (after successful payment)
router.post("/create", createOrder);

router.get("/", getAllOrders);

router.get("/customer", getCustomersData);

// Get order details by order ID
router.get("/:orderId", getOrderDetails);

module.exports = router;
