import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { updateQRCode } from "../../api/qrcode";
import { io } from "socket.io-client";

// Connect WebSocket to backend (Ensure this is correct)
const socket = io(import.meta.env.VITE_WS_URL || "http://localhost:3000");

export default function QRCodeGenerator() {
  const [qrValue, setQrValue] = useState("");

  // Function to generate and send a new QR code
  const generateNewQR = async () => {
    const newQR = uuidv4();
    console.log(`[GENERATE] New QR Code: ${newQR}`);

    setQrValue(newQR);
    await updateQRCode(newQR); // Send new QR to backend
  };

  useEffect(() => {
    generateNewQR(); // Generate QR when component mounts

    const handleQRScanned = () => {
      console.log("[SOCKET] QR scanned! Generating new...");
      generateNewQR(); // Generate new QR after scan
    };

    const handleQRUpdated = (newQR: string) => {
      console.log(`[SOCKET] New QR Code received: ${newQR}`);
      setQrValue(newQR);
    };

    socket.on("qr-scanned", handleQRScanned);
    socket.on("qr-updated", handleQRUpdated);

    return () => {
      socket.off("qr-scanned", handleQRScanned);
      socket.off("qr-updated", handleQRUpdated);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="bg-muted relative hidden md:block">
                <img
                  src="/haborlane.png"
                  alt="System Preview"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>

              <div className="p-6 md:p-8 flex flex-col items-center gap-6">
                <h1 className="text-2xl font-bold text-center">
                  Secure QR Authentication
                </h1>
                <p className="text-muted-foreground text-center max-w-sm">
                  Scan the QR code to securely log in. Each code is unique and
                  updates only when scanned or manually regenerated.
                </p>
                <QRCodeCanvas value={qrValue} size={200} />
                <Button onClick={generateNewQR}>Generate New QR</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
