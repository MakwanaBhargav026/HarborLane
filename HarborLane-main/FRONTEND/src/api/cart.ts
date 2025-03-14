import api from "./api";
import { AxiosResponse } from "axios";

interface CartItem {
  cart_number: number;
  product_id: string;
  quantity: number;
}

interface AddMultipleItemsResponse {
  cart_id: string;
}

// Add multiple items to the cart
export const addMultipleItemsToCart = async (
  customer_id: string,
  cart_items: CartItem[]
): Promise<AddMultipleItemsResponse> => {
  console.log(`Adding multiple items to cart for customer: ${customer_id}`);
  const response: AxiosResponse<AddMultipleItemsResponse> = await api.post(
    `/cart/${customer_id}/add-multiple-items`,
    { cart_items }
  );
  console.log(`Response: ${JSON.stringify(response.data)}`);
  
  // Store cart_id in localStorage
  localStorage.setItem("cartId", response.data.cart_id);
  
  return response.data;
};

// Check if the cart is verified
export const checkCartVerification = async (
  customer_id: string
): Promise<boolean> => {
  const response = await api.get(`/cart/${customer_id}`);
  return response.data.verified;
};
