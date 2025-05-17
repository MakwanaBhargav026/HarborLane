"use client"; // Ensures client-side rendering

import * as React from "react";
import { toast } from "sonner"; // Import Sonner for toasts
import { Cart, getCartsForVerification, verifyCart } from "../api/cart";
import CartList from "./ui/cartlist";
import CartDetails from "./ui/cartdetails";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_WS_URL || "http://localhost:3000");

export default function VerifyCartsTable() {
  const [carts, setCarts] = React.useState<Cart[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCart, setSelectedCart] = React.useState<Cart | null>(null);

  React.useEffect(() => {
    const fetchCarts = async () => {
      try {
        const data = await getCartsForVerification();
        setCarts(data);
      } catch (error) {
        console.error("Failed to fetch carts:", error);
        toast.error("Failed to fetch carts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();

    // Listen for WebSocket events
    socket.on("cart-verification-update", (updatedCarts) => {
      setCarts(updatedCarts);
    });

    return () => {
      socket.off("cart-verification-update");
    };
  }, []);

  const handleVerifyCart = async () => {
    if (selectedCart) {
      try {
        await verifyCart(selectedCart._id);
        setSelectedCart({ ...selectedCart, verified: true });
        setCarts((prevCarts) =>
          prevCarts.map((cart) =>
            cart._id === selectedCart._id ? { ...cart, verified: true } : cart
          )
        );
        toast.success(`Cart ${selectedCart._id} has been verified!`);
      } catch (error) {
        console.error("Failed to verify cart:", error);
        toast.error("Failed to verify cart. Please try again.");
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-90px)] w-full overflow-hidden">
      {loading ? (
        <div className="flex justify-center items-center w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <CartList
            carts={carts}
            setSelectedCart={setSelectedCart}
            selectedCart={selectedCart}
          />
          <CartDetails
            selectedCart={selectedCart}
            handleVerifyCart={handleVerifyCart}
          />
        </>
      )}
    </div>
  );
}
