import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./app/login/page";
import AdminDashboard from "./app/dashboard/page";
import QRCodeGenerator from "./app/QRgenerator/QRCodeGenerator";
import VerifyCarts from "./components/verify-carts";
import { CustomersComponent } from "@/components/customers-chart";
import { SalesComponent } from "@/components/sales-chart";
import { Toaster } from "sonner";

function App() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user role (Replace with real auth logic)
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);
    setLoading(false);
  }, [role]);

  // Function to return role-based routes
  function renderRoutes() {
    if (loading) {
      return <div>Loading...</div>; // or a spinner component
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
                  <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <CustomersComponent />
                  </div>
                </>
              }
            />
            <Route path="qrcode-generator" element={<QRCodeGenerator />} />
            <Route path="verify-carts" element={<VerifyCarts />} />
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
                  <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                    <SalesComponent />
                  </div>
                  <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <CustomersComponent />
                  </div>
                </>
              }
            />
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
