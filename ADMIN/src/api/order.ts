import api from "./api";

export interface Sales {
  date: string;
  actual: number;
  predicted: number;
}

interface SalesResponse {
  success: boolean;
  data: Sales[];
}

export interface Customers {
    month: string;
    actual: number;
    predicted: number; 
  }
  
  interface CustomersResponse {
    success: boolean;
    data: Customers[];
  }

export const fetchSalesData = async (timeRange: '7d' | '30d' | '90d' = '90d'): Promise<Sales[]> => {
  try {
    const response = await api.get<SalesResponse>(`/order?timeRange=${timeRange}`);
    if (!response.data.success) {
      throw new Error('Failed to fetch sales data');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error; // Re-throw to let the caller handle
  }
};

export const fetchCustomersData = async (): Promise<Customers[]> => {
    try {
      const response = await api.get<CustomersResponse>("/order/customer?period=6m");
      if (!response.data.success) {
        throw new Error("Failed to fetch customers data");
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching customers data:", error);
      throw error; // Re-throw to let the caller handle
    }
  };
  