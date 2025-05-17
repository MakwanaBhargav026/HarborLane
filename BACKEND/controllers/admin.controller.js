const Employee = require("../models/employee.model");
const bcrypt = require("bcryptjs");

// Create a new employee
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    const validRoles = ["associate", "cashier", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res
        .status(400)
        .json({ message: "Employee with this email already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create employee with hashed password
    const employee = new Employee({
      name,
      email,
      password: hashedPassword, // Store hashed password
      role,
    });

    await employee.save();
    res
      .status(201)
      .json({ message: "Employee created successfully", employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateEmployeeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // Role should be associate, cashier, or admin

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.role = role;
    await employee.save();

    res.status(200).json({ message: "Role updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  updateEmployeeRole,
};
