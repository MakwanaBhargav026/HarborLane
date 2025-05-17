const Employee = require("../models/employee.model");
const Cart = require("../models/cart.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const verifyCart = async (req, res) => {
  try {
    const { employee_id, cart_id } = req.params;

    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.role !== "associate" && employee.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only associates can verify carts" });
    }

    const cart = await Cart.findById(cart_id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.verified = true;
    cart.verified_by = employee._id;
    cart.verified_at = new Date();

    await cart.save();

    employee.verified_carts.push({
      cart_id: cart._id,
      verified_at: new Date(),
    });
    await employee.save();

    const io = req.app.get("io");
    console.log("Emitting cart-verification-update:", cart.toObject());
    io.emit("cart-verification-update", cart.toObject());

    res.status(200).json({ message: "Cart verified successfully" });
  } catch (err) {
    console.error("Error in verifyCart:", err);
    res.status(500).json({ message: err.message });
  }
};

const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

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
    console.error("Error in loginEmployee:", err);
    res.status(500).json({ message: err.message });
  }
};

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

    const processedCarts = carts.map((cart) => {
      const cartObj = cart.toObject();
      const combinedItemsMap = new Map();

      cart.cart_items.forEach((item) => {
        if (!item.product_id) {
          console.error("Invalid or missing product_id in cart item:", item);
          return;
        }

        const productIdStr = item.product_id.toString();

        if (combinedItemsMap.has(productIdStr)) {
          const existingItem = combinedItemsMap.get(productIdStr);
          existingItem.quantity += item.quantity;
        } else {
          combinedItemsMap.set(productIdStr, {
            product_id: productIdStr,
            product_name: item.product_name,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
            price: item.price,
            added_at: item.added_at,
            _id: item._id.toString(),
          });
        }
      });

      cartObj.cart_items = Array.from(combinedItemsMap.values());
      return cartObj;
    });

    console.log("Processed carts for initial fetch:", processedCarts);
    res.status(200).json(processedCarts);
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
