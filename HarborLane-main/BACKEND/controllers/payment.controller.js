const razorpay = require("../config/razorpay");
const Product = require("../models/product.model");
const Payment = require("../models/payment.model");
const crypto = require("crypto");

exports.createOrder = async (req, res) => {
  const { productIds, quantities, prices } = req.body;

  try {
    console.log("Received createOrder request:", req.body);

    // Clearly indicate we're searching by barcode
    console.log("Searching products by barcode:", productIds);
    console.log("Quantities:", quantities);
    console.log("Prices:", prices);

    // Fetch the products by their barcode IDs
    const products = await Product.find({ barcode: { $in: productIds } });

    console.log("Products found:", products.length);

    if (!products.length) {
      return res
        .status(400)
        .json({ error: "No valid products found with the provided barcodes!" });
    }

    // Calculate the total amount
    let totalAmount;
    if (prices && prices.length === quantities.length) {
      // If prices are provided
      totalAmount = prices.reduce(
        (total, price, index) => total + price * quantities[index],
        0
      );
    } else {
      // Use product prices from database
      totalAmount = products.reduce((total, product, index) => {
        const quantity = quantities[index] || 1;
        return total + product.price * quantity;
      }, 0);
    }

    const options = {
      amount: Math.round(totalAmount * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Prepare the response with product details
    const response = {
      ...order,
      products: products.map((product, index) => ({
        productId: product._id,
        barcode: product.barcode,
        productName: product.name,
        productPrice: product.price,
        quantity: quantities[index] || 1,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    customer_id, // Changed from user_id to match the model
    userName,
    phone_number,
    amount,
    order_items, // Change from products to match model
  } = req.body;

  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  const hmac = crypto.createHmac("sha256", razorpayKeySecret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === razorpay_signature) {
    try {
      // Calculate total amount per cart
      const totalAmountPerCart = {};
      order_items.forEach((item) => {
        const cartNumber = item.cart_number;
        if (!totalAmountPerCart[cartNumber]) {
          totalAmountPerCart[cartNumber] = 0;
        }
        totalAmountPerCart[cartNumber] += item.price * item.quantity;
      });

      // Create payment record matching the model schema
      const payment = new Payment({
        customer_id, // Changed from user_id
        userName,
        phone_number,
        order_items, // Changed from products
        total_amount_per_cart: totalAmountPerCart,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        payment_status: "success", // Changed from status
        created_at: new Date(),
      });

      await payment.save();

      res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error saving payment details",
        error: error.message,
      });
    }
  } else {
    // Payment verification failed
    try {
      // Calculate total amount per cart
      const totalAmountPerCart = {};
      order_items.forEach((item) => {
        const cartNumber = item.cart_number;
        if (!totalAmountPerCart[cartNumber]) {
          totalAmountPerCart[cartNumber] = 0;
        }
        totalAmountPerCart[cartNumber] += item.price * item.quantity;
      });

      const payment = new Payment({
        customer_id, // Changed from user_id
        userName,
        phone_number,
        order_items, // Changed from products
        total_amount_per_cart: totalAmountPerCart,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        payment_status: "failure", // Changed from status
        created_at: new Date(),
      });

      await payment.save();

      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error saving payment details",
        error: error.message,
      });
    }
  }
};
