import api from "./api";

interface LoginResponse {
  token: string;
  employee: {
    _id: string;
    role: string;
    email: string;
    name: string;
  };
}

// Login API call
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/employee/login", {
    email,
    password,
  });
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("userId", response.data.employee._id);
  localStorage.setItem("userRole", response.data.employee.role);
  localStorage.setItem("userEmail", response.data.employee.email);
  localStorage.setItem("userName", response.data.employee.name);
  return response.data;
};

// Logout function (clears token)
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
};
