const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { app, setIo } = require("./app");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const DB_URI = process.env.DB_URI;

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database successfully!");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;
let server = http.createServer(app); // Use let to allow reassignment
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this based on your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

setIo(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed.");
    mongoose.connection.close(false, () => {
      console.log("Database connection closed.");
      process.exit(0);
    });
  });
});

process.on("SIGTERM", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed.");
    mongoose.connection.close(false, () => {
      console.log("Database connection closed.");
      process.exit(0);
    });
  });
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send the latest QR code when an admin connects
  const latestQRCode = app.get("latestQRCode");
  if (latestQRCode) {
    socket.emit("qr-updated", latestQRCode);
  }

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.post("/verify-cart", (req, res) => {
  // Your cart verification logic here

  // Emit the cart-verified event
  io.emit("cart-verified", { message: "Cart has been verified" });

  res.status(200).send("Cart verified");
});
