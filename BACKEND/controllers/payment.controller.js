const razorpay = require("../config/razorpay");
const Product = require("../models/product.model");
const Payment = require("../models/payment.model");
const crypto = require("crypto");
const axios = require("axios"); // Import axios

exports.createOrder = async (req, res) => {
  const { productIds, quantities, prices } = req.body;

  try {
    console.log("Received createOrder request:", req.body);

    console.log("Searching products by barcode:", productIds);
    console.log("Quantities:", quantities);
    console.log("Prices:", prices);

    const products = await Product.find({ barcode: { $in: productIds } });

    console.log("Products found:", products.length);

    if (!products.length) {
      return res
        .status(400)
        .json({ error: "No valid products found with the provided barcodes!" });
    }

    let totalAmount;
    if (prices && prices.length === quantities.length) {
      totalAmount = prices.reduce(
        (total, price, index) => total + price * quantities[index],
        0
      );
    } else {
      totalAmount = products.reduce((total, product, index) => {
        const quantity = quantities[index] || 1;
        return total + product.price * quantity;
      }, 0);
    }

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

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
    customer_id,
    userName,
    phone_number,
    amount,
    order_items,
  } = req.body;

  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const hmac = crypto.createHmac("sha256", razorpayKeySecret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === razorpay_signature) {
    try {
      const totalAmountPerCart = {};
      order_items.forEach((item) => {
        const cartNumber = item.cart_number;
        if (!totalAmountPerCart[cartNumber]) {
          totalAmountPerCart[cartNumber] = 0;
        }
        totalAmountPerCart[cartNumber] += item.price * item.quantity;
      });

      const payment = new Payment({
        customer_id,
        userName,
        phone_number,
        order_items,
        total_amount_per_cart: totalAmountPerCart,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        payment_status: "success",
        created_at: new Date(),
      });

      await payment.save();
      // Wait for Invoice API Response
      try {
        const invoiceResponse = await axios.post(
          "https://harborlane-1.onrender.com/generate-invoice",
          payment
        );
        console.log("Invoice API Response:", invoiceResponse.data);
      } catch (invoiceError) {
        console.error("Error sending invoice request:", invoiceError.message);
      }

      // **Send Final Response**
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
    try {
      const totalAmountPerCart = {};
      order_items.forEach((item) => {
        const cartNumber = item.cart_number;
        if (!totalAmountPerCart[cartNumber]) {
          totalAmountPerCart[cartNumber] = 0;
        }
        totalAmountPerCart[cartNumber] += item.price * item.quantity;
      });

      const payment = new Payment({
        customer_id,
        userName,
        phone_number,
        order_items,
        total_amount_per_cart: totalAmountPerCart,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        payment_status: "failure",
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

// Controller to fetch all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ created_at: -1 });
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
