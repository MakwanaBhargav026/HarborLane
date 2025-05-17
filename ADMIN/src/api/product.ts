import api from "./api";

export interface Product {
  _id?: string;
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

// Fetch all products
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/product");
  return response.data;
};

// Fetch a product by ID
export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await api.get<Product>(`/product/${id}`);
  return response.data;
};

// Create a new product
export const createProduct = async (product: Product): Promise<Product> => {
  const response = await api.post<Product>("/product", product);
  return response.data;
};

// Update a product by ID
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const response = await api.put<Product>(`/product/${id}`, product);
  return response.data;
};

// Delete a product by ID
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/product/${id}`);
};