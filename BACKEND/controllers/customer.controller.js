const Customer = require("../models/customer.model");
const Cart = require("../models/cart.model");
const jwt = require("jsonwebtoken");

// Create a new customer
const createCustomer = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const { qrCode } = req.params;

    // Create new customer
    const customer = new Customer({ firstName, lastName, phone, qrCode });
    await customer.save();

    // Create an empty cart for the new customer
    const cart = new Cart({
      customer_id: customer._id,
      cart_items: [],
      wants_verification: false,
      verified: false,
    });

    await cart.save();

    // Generate a token for the session
    const token = jwt.sign(
      { customerId: customer._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "5h",
      }
    );

    res.status(201).json({ customer, cart, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a customer by ID
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a customer by ID
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
