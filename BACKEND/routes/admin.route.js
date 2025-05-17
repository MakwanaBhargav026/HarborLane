const express = require("express");
const router = express.Router();
const {
  getAllEmployees,
  updateEmployeeRole,
  createEmployee, // Add createEmployee controller
} = require("../controllers/admin.controller");

// Admin can create an employee
router.post("/register-employee", createEmployee);

// Admin can view all employees
router.get("/get-employees", getAllEmployees);

// Admin can assign role to an employee
router.put("/employee/:id", updateEmployeeRole);

module.exports = router;
