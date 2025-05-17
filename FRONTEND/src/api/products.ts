import api from "./api";
import axios from "axios";

export interface Product {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  sub_category?: string;
  barcode: string;
  imageUrl: string;
  is_active: boolean;
  units_sold: number;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  barcode: string;
  category: string;
  imageUrl: string;
  name: string;
  price: number;
  similarity: number;
  sub_category: string;
  units_sold: number;
}

// Create a separate Axios instance for the recommender API
const recommenderApi = axios.create({
  baseURL: "https://harborlane-1.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Fetch all products
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/product");
  return response.data;
};

// Fetch a product by barcode
export const fetchProductByBarcode = async (barcode: string): Promise<Product> => {
  const response = await api.get<Product>(`/product/barcode/${barcode}`);
  return response.data;
};

// Fetch recommendations based on cart barcodes
export const fetchRecommendations = async (cart_barcodes: string[]): Promise<Recommendation[]> => {
  const response = await recommenderApi.post<{ recommendations: Recommendation[] }>(
    "/recommend",
    { cart_barcodes }
  );
  return response.data.recommendations;
};
