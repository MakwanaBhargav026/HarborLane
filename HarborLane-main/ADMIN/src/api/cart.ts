import api from "./api";

export interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  added_at: Date;
  _id: string;
}

export interface Cart {
  _id: string;
  customer_id: string;
  cart_items: CartItem[];
  wants_verification: boolean;
  verified: boolean;
  verified_by?: string;
  verified_at?: Date;
}

export const getCartsForVerification = async (): Promise<Cart[]> => {
  const response = await api.get<Cart[]>("/employee/carts-to-verify");
  return response.data;
};

export const verifyCart = async (cart_id: string): Promise<void> => {
  const employee_id = localStorage.getItem("userId");
  if (!employee_id) {
    throw new Error("Employee ID not found in localStorage");
  }
  await api.put(`/employee/${employee_id}/verify/${cart_id}`);
};
