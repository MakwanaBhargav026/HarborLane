import api from './api';

export interface Employee {
  _id: {
    $oid: string;
  };
  name: string;
  email: string;
  role: 'admin' | 'associate';
  password: string;
  verified_carts: Array<{
    cart_id: {
      $oid: string;
    };
    verified_at: {
      $date: string;
    };
    _id: {
      $oid: string;
    };
  }>;
  created_at: {
    $date: string;
  };
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'associate';
}

export const employeeApi = {
  // Get all employees
  getAllEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await api.get('/admin/get-employees');
      console.log('Employees fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Create new employee
  createEmployee: async (employeeData: CreateEmployeeInput): Promise<Employee> => {
    try {
      // Update this array to include 'associate'
      if (!['admin', 'associate'].includes(employeeData.role)) {
        throw new Error('Invalid role selected. Must be either "admin" or "associate"');
      }
      
      const response = await api.post('/admin/register-employee', employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }
};