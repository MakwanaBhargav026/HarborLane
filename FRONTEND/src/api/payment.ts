import api from "./api";

interface CreateOrderData {
  productIds: string[];
  quantities: number[];
  prices: number[];
}

interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  customer_id: string | null;
  userName: string;
  phone_number: string;
  amount: number;
  order_items: Array<{
    cart_number: number;
    product_barcode: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

export const makePaymentRequest = {
  createOrder: (data: CreateOrderData) => api.post("/payment/create-order", data),
  verifyPayment: (data: VerifyPaymentData) => api.post("/payment/verify-payment", data),
};