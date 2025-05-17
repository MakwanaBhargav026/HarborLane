const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    order_items: [
      {
        cart_number: {
          type: Number,
          required: true,
          enum: [1, 2, 3],
        },
        product_barcode: {
          type: String,
          required: true,
        },
        product_name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    total_amount_per_cart: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Associate",
    },
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "success", "failure"],
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
