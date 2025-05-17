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

const getAllOrders = async (req, res) => {
  try {
    // Extract timeRange from query parameters (default: 90d)
    const { timeRange = "90d" } = req.query;

    // Determine number of days based on timeRange
    let days;
    switch (timeRange) {
      case "7d":
        days = 7;
        break;
      case "30d":
        days = 30;
        break;
      case "90d":
        days = 90;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid timeRange. Use 7d, 30d, or 90d",
        });
    }

    // Calculate start date (use dummy data range for testing)
    const endDate = new Date("2025-03-31");
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);

    console.log(
      `Fetching sales for ${timeRange}: ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    // MongoDB aggregation pipeline
    const salesData = await Order.aggregate([
      // Convert created_at string to Date
      {
        $addFields: {
          created_at_date: { $toDate: "$created_at" },
        },
      },
      // Filter orders within the date range
      {
        $match: {
          created_at_date: { $gte: startDate, $lte: endDate },
        },
      },
      // Group by date (YYYY-MM-DD)
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at_date" },
          },
          actual: {
            $sum: {
              $add: [
                { $ifNull: ["$total_amount_per_cart.1", 0] },
                { $ifNull: ["$total_amount_per_cart.2", 0] },
                { $ifNull: ["$total_amount_per_cart.3", 0] },
              ],
            },
          },
        },
      },
      // Sort by date
      {
        $sort: { _id: 1 },
      },
      // Project to desired format
      {
        $project: {
          date: "$_id",
          actual: 1,
          predicted: {
            $multiply: [
              "$actual",
              {
                $add: [
                  1,
                  { $subtract: [{ $multiply: [{ $rand: {} }, 0.2] }, 0.1] },
                ],
              },
            ],
          },
          _id: 0,
        },
      },
    ]);

    console.log("Aggregation result:", salesData);

    // Fill missing dates with 0 sales
    const result = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      const entry = salesData.find((item) => item.date === dateStr) || {
        date: dateStr,
        actual: 0,
        predicted: 0,
      };
      result.push(entry);
    }

    // Check if no data was found
    if (result.every((entry) => entry.actual === 0)) {
      console.warn(
        "No sales data found. Check if created_at strings are in ISO format or total_amount_per_cart values."
      );
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching sales data:", error.message, error.stack);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getCustomersData = async (req, res) => {
  try {
    const result = [
      { month: "January", actual: 120, predicted: 132 },
      { month: "February", actual: 95, predicted: 102 },
      { month: "March", actual: 140, predicted: 127 },
      { month: "April", actual: 110, predicted: 121 },
      { month: "May", actual: 150, predicted: 138 },
      { month: "June", actual: 125, predicted: 135 },
    ];

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Error generating customers data:",
      error.message,
      error.stack
    );
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { getCustomersData };

module.exports = {
  createOrder,
  getOrderDetails,
  getAllOrders,
  getCustomersData,
};
