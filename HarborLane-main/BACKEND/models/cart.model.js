const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    cart_items: [
      {
        cart_number: {
          type: Number,
          required: true,
          enum: [1, 2, 3],
          default: 1,
        },
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        product_name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        added_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    wants_verification: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    verified_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Middleware to calculate total_amounts per cart number dynamically
cartSchema.virtual("total_amounts").get(function () {
  const totals = { 1: 0, 2: 0, 3: 0 };
  this.cart_items.forEach((item) => {
    totals[item.cart_number] += item.quantity * item.price;
  });
  return totals;
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
