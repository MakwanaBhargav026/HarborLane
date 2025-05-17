import api from "./api";

interface QRCodeResponse {
  message: string;
  success: boolean;
}

// Function to verify a scanned QR code
export const verifyScannedQRCode = async (
  scannedQRCode: string
): Promise<QRCodeResponse> => {
  try {
    const response = await api.post<QRCodeResponse>("/qrcode/scan-qr", { scannedQRCode });
    return response.data;
  } catch (error) {
    console.error("Error verifying QR Code:", error);
    return { message: "Error verifying QR Code", success: false };
  }
};