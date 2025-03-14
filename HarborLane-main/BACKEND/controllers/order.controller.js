const Order = require("../models/order.model");
const Cart = require("../models/cart.model");

// Create an order from verified cart and successful payment
const createOrder = async (req, res) => {
  const { customer_id, payment_id } = req.body;

  try {
    // Get the verified cart for the customer
    const cart = await Cart.findOne({ customer_id, verified: true }).populate(
      "cart_items.product_id"
    );
    if (!cart)
      return res.status(404).json({ message: "Verified cart not found" });

    const orderItems = cart.cart_items.map((item) => ({
      cart_number: item.cart_number,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
    }));

    const total_amount_per_cart = cart.total_amounts;

    // Create the order
    const newOrder = new Order({
      customer_id,
      order_items: orderItems,
      total_amount_per_cart,
      payment_id,
      created_at: Date.now(),
    });

    await newOrder.save();

    // Remove cart items after order creation
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error });
  }
};

// Get order details by order ID
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("order_items.product_id")
      .populate("payment_id");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving order details", error });
  }
};

module.exports = { createOrder, getOrderDetails };
