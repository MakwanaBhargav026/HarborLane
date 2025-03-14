const Employee = require("../models/employee.model");
const Cart = require("../models/cart.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "HaBourLaNe";

const verifyCart = async (req, res) => {
  try {
    const { employee_id, cart_id } = req.params;

    // Check if employee exists
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if employee has the necessary role to verify a cart (associates only)
    if (employee.role !== "associate" && employee.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only associates can verify carts" });
    }

    // Find the cart to be verified
    const cart = await Cart.findById(cart_id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Verify the cart
    cart.verified = true;
    cart.verified_by = employee._id;
    cart.verified_at = new Date();

    // Save the cart with verification details
    await cart.save();

    // Track the cart verification in employee's record
    employee.verified_carts.push({
      cart_id: cart._id,
      verified_at: new Date(),
    });
    await employee.save();

    res.status(200).json({ message: "Cart verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Employee login
const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if employee exists
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      employee: {
        _id: employee._id,
        role: employee.role,
        email: employee.email,
        name: employee.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all carts that need verification
const getCartsForVerification = async (req, res) => {
  try {
    const carts = await Cart.find({
      wants_verification: true,
      verified: false,
    });

    if (carts.length === 0) {
      console.log("No carts waiting for verification");
      return res
        .status(404)
        .json({ message: "No carts waiting for verification" });
    }

    // Process each cart to combine items with the same product_id
    const processedCarts = carts.map((cart) => {
      // Create a deep copy of the cart to avoid modifying the original
      const cartObj = cart.toObject();

      // Use a Map to combine items with the same product_id
      const combinedItemsMap = new Map();

      cart.cart_items.forEach((item) => {
        if (!item.product_id) {
          console.error("Invalid or missing product_id in cart item:", item);
          return;
        }

        const productIdStr = item.product_id.toString();

        if (combinedItemsMap.has(productIdStr)) {
          // Update existing entry
          const existingItem = combinedItemsMap.get(productIdStr);
          existingItem.quantity += item.quantity;
        } else {
          // Create new entry
          combinedItemsMap.set(productIdStr, {
            product_id: productIdStr,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            added_at: item.added_at,
            _id: item._id.toString(),
          });
        }
      });

      // Replace cart_items with the combined items
      cartObj.cart_items = Array.from(combinedItemsMap.values());

      return cartObj;
    });

    console.log("Processed carts:", processedCarts);

    res.status(200).json(processedCarts);

    // Emit the updated carts via WebSocket
    const io = req.app.get("io");
    io.emit("cart-verification-update", processedCarts);
  } catch (err) {
    console.error("Error in getCartsForVerification:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  loginEmployee,
  getCartsForVerification,
  verifyCart,
};
