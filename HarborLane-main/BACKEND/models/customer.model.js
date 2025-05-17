const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    required: true,
  },
  qrCode: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

customerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
