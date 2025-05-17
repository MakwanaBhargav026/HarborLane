const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { app, setIo } = require("./app");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const DB_URI = process.env.DB_URI;
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  connectionStateRecovery: {},
});

// Set the global io instance using our helper function from app.js
setIo(io);

io.on("connection", (socket) => {
  console.log("New client connected:", {
    id: socket.id,
    time: new Date().toISOString(),
    address: socket.handshake.address,
  });

  socket.on("verification-request", (data) => {
    console.log("Verification request received:", {
      socketId: socket.id,
      data: data,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("error", (error) => {
    console.error("Socket error:", {
      socketId: socket.id,
      error: error,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", {
      id: socket.id,
      reason: reason,
      time: new Date().toISOString(),
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL configured: ${FRONTEND_URL}`);
  console.log(
    `Database URI: ${DB_URI.replace(/\/\/.*:.*@/, "//[REDACTED]:")}`
  );
});

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    console.log("HTTP server closed.");

    io.close(() => {
      console.log("Socket.IO connections closed.");
    });

    mongoose.connection.close(false, () => {
      console.log("Database connection closed.");
      process.exit(0);
    });
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));