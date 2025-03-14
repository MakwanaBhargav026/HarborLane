const express = require("express");
const router = express.Router();

let latestQRCode = null;

// Endpoint for updating QR code
router.post("/update-qr", (req, res) => {
  const { qrCode } = req.body;
  if (!qrCode) return res.status(400).json({ error: "QR Code is required" });

  latestQRCode = qrCode;
  console.log("Updated latest QR:", latestQRCode);

  const io = req.app.get("io");
  io.emit("qr-updated", latestQRCode);

  res.status(200).json({ message: "QR code updated successfully" });
});

// Endpoint for scanning QR code
router.post("/scan-qr", (req, res) => {
  const { scannedQRCode } = req.body;
  if (!scannedQRCode) {
    console.log("QR Code is required");
    return res.status(400).json({ error: "QR Code is required" });
  }

  if (scannedQRCode === latestQRCode) {
    latestQRCode = null;
    console.log("QR Code verified, generate new");

    const io = req.app.get("io");
    io.emit("qr-scanned");

    res
      .status(200)
      .json({ valid: true, message: "QR Code verified, generate new" });
  } else {
    res.status(400).json({ valid: false, message: "Invalid QR Code" });
  }
});

module.exports = router;
