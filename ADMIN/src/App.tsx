import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./app/login/page";
import AdminDashboard from "./app/dashboard/page";
import QRCodeGenerator from "./components/customer/QRCodeGenerator";
import VerifyCarts from "./components/customer/verify-carts";
import { CustomersComponent } from "@/components/customers-chart";
import { SalesComponent } from "@/components/sales-chart";
import { Toaster } from "sonner";
import TopProductsList from "./components/top-products";
import EmployeeDashboard from "./components/employee/employee";
import NewEmployee from "./components/employee/newemployee";
import PaymentsTable from "./components/customer/payments";
import ProductList from "./components/product/ProductList";
import AddProductForm from "./components/product/AddProductForm";

function App() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);
    setLoading(false);
  }, [role]);

  function renderRoutes() {
    if (loading) {
      return (
        <div className="flex justify-center items-center w-full h-[calc(100vh-90px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (role === "admin") {
      return (
        <Routes>
          <Route path="/admin" element={<AdminDashboard />}>
            <Route
              index
              element={
                <>
                  <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                    <SalesComponent />
                  </div>
                  <div className="grid auto-rows-min gap-4 md:grid-cols-2 ">
                    <CustomersComponent />
                    <TopProductsList />
                  </div>
                </>
              }
            />
            <Route path="qrcode-generator" element={<QRCodeGenerator />} />
            <Route path="verify-carts" element={<VerifyCarts />} />
            <Route path="employees" element={<EmployeeDashboard />} />
            <Route path="new-employee" element={<NewEmployee />} />
            <Route path="payments" element={<PaymentsTable />} />
            <Route path="products" element={<ProductList />} />
            <Route path="add-product" element={<AddProductForm />} />
            <Route path="update-product" element={<AddProductForm />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      );
    } else if (role === "associate") {
      return (
        <Routes>
          <Route path="/associate" element={<AdminDashboard />}>
            <Route
              index
              element={
                <>
                  <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <CustomersComponent />
                    <TopProductsList />
                  </div>
                </>
              }
            />
            <Route path="qrcode-generator" element={<QRCodeGenerator />} />
            <Route path="verify-carts" element={<VerifyCarts />} />
            <Route path="payments" element={<PaymentsTable />} />
          </Route>
          <Route path="*" element={<Navigate to="/associate" />} />
        </Routes>
      );
    } else {
      return (
        <Routes>
          <Route path="/login" element={<LoginPage setRole={setRole} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      );
    }
  }

  return (
    <Router>
      <Toaster richColors position="top-right" />
      {renderRoutes()}
    </Router>
  );
}

export default App;
