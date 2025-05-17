import api from "./api";

interface LoginResponse {
  token: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    qrCode: string;
  };
  cart: {
    customer_id: string;
    cart_items: any[];
    wants_verification: boolean;
    verified: boolean;
  };
}

// Check-in API call
export const checkin = async (
  qrCode: string,
  firstName: string,
  lastName: string,
  phone: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(`/customer/checkin/${qrCode}`, {
    firstName,
    lastName,
    phone,
  });
  console.log(response.data);
  return response.data;
};

// Logout function (clears token)
export const logout = () => {
  localStorage.removeItem("token");
};
