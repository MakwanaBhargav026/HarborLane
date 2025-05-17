import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { employeeApi } from "../../api/employee";
import type { CreateEmployeeInput } from "../../api/employee";

const NewEmployee: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("associate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (role !== "admin" && role !== "associate") {
        throw new Error("Role must be either 'admin' or 'associate'");
      }

      const employeeData: CreateEmployeeInput = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: role as "admin" | "associate",
      };

      await employeeApi.createEmployee(employeeData);

      setSuccessMessage(
        `Successfully created ${employeeData.name} as ${employeeData.role}`
      );

      setName("");
      setEmail("");
      setPassword("");
      setRole("associate");

      setTimeout(() => {
        navigate("/admin/employees");
      }, 1500);
    } catch (err: any) {
      console.error("Error creating employee:", err);
      setError(err?.message || "Failed to create employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-90px)] px-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Add New Employee
        </h2>

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 border-l-4 border-red-500 rounded-md">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 text-green-700 bg-green-100 border-l-4 border-green-500 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            >
              <option value="associate">Associate</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white rounded-lg shadow-md transition-all duration-200 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating Employee..." : "Add Employee"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewEmployee;
