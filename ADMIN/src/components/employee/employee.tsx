import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { employeeApi, Employee } from "../../api/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmployeeDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    admins: 0,
    regularEmployees: 0,
    totalVerifiedCarts: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getAllEmployees();
      setEmployees(data);

      const admins = data.filter((emp) => emp.role === "admin").length;
      const totalVerifiedCarts = data.reduce(
        (total, emp) => total + emp.verified_carts.length,
        0
      );

      setStats({
        totalEmployees: data.length,
        admins,
        regularEmployees: data.length - admins,
        totalVerifiedCarts,
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to load employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    navigate("/admin/new-employee");
  };

  const handleRefresh = () => {
    fetchEmployees();
  };

  const sortedEmployees = [...employees].sort(
    (a, b) => b.verified_carts.length - a.verified_carts.length
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-[calc(100vh-90px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={handleRefresh}
          className="bg-black text-white px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Dashboard</h1>
        <div className="space-x-2">
          <button
            onClick={handleAddNewClick}
            className="bg-black  text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
          >
            Add New Employee
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.admins}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              Regular Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.regularEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              Total Verified Carts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalVerifiedCarts}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Employee List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEmployees.map((employee) => (
          <Card
            key={employee._id.$oid}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{employee.name}</span>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    employee.role === "admin"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {employee.role.charAt(0).toUpperCase() +
                    employee.role.slice(1)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Email:</span> {employee.email}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Joined:</span>{" "}
                  {new Date(employee.created_at.$date).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Verified Carts:</span>
                    <span className="font-bold">
                      {employee.verified_carts.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (employee.verified_carts.length /
                            (stats.totalVerifiedCarts > 0
                              ? stats.totalVerifiedCarts * 0.5
                              : 1)) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No employees found.</p>
          <button
            onClick={handleAddNewClick}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Add Your First Employee
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
