const express = require("express");
const router = express.Router();
const {
  verifyCart,
  loginEmployee,
  getCartsForVerification,
} = require("../controllers/employee.controller");

// Employee login
router.post("/login", loginEmployee);

// Get carts that need verification
router.get("/carts-to-verify", getCartsForVerification);

// Associate verifies a cart
router.put("/:employee_id/verify/:cart_id", verifyCart);

module.exports = router;
