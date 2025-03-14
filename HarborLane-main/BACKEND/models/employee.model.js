const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["associate", "cashier", "admin"], // Different roles for employees
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified_carts: [
      {
        cart_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Cart",
        },
        verified_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
