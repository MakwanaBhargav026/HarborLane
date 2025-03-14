const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
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
    min: 0,
  },
  total_price: {
    type: Number,
    required: true,
    min: 0,
  },
  added_at: {
    type: Date,
    default: Date.now,
  },
});

cartItemSchema.pre("save", function (next) {
  this.total_price = this.quantity * this.price;
  next();
});

const CartItem = mongoose.model("CartItem", cartItemSchema);
module.exports = CartItem;
