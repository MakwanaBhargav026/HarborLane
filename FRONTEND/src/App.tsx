import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { CartManager } from "./pages/CartManager";
import { Checkout } from "./pages/Checkout";
import Header from "./components/Header/Header";
import { UserProvider } from "./context/UserContext";
import { Toaster } from "sonner";

function App() {
  return (
    <UserProvider>
      <Router>
        <Header />
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/home" element={<Home />} />
          {/* Main page with QRScanner */}
          <Route path="/cart" element={<CartManager />} />
          {/* User cart manager page */}
          <Route path="/checkout" element={<Checkout />} />
          {/* User cart manager page */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
