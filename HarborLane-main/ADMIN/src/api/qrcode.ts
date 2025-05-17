import api from "./api";

export interface QRCodeResponse {
  message: string;
  success: boolean;
}

// Function to update the latest QR code in the backend
export async function updateQRCode(qrCode: string): Promise<QRCodeResponse> {
  try {
    const response = await api.post("/qrcode/update-qr", { qrCode });
    return response.data;
  } catch (error) {
    console.error("Error updating QR Code:", error);
    return { message: "Error updating QR Code", success: false };
  }
}

