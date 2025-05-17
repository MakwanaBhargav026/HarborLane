import api from "./api";

export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

export interface Payment {
  _id: string;
  customer_id: string;
  userName: string;
  phone_number: string;
  order_items: OrderItem[];
  amount: number;
  payment_status: string;
  created_at: string;
}

export const getPayments = async (): Promise<Payment[]> => {
  const response = await api.get<Payment[]>("/payment");
  return response.data;
};
