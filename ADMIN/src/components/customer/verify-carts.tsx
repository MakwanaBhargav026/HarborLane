"use client";
import * as React from "react";
import { toast } from "sonner";
import { Cart, getCartsForVerification, verifyCart } from "../../api/cart";
import CartList from "./cartlist";
import CartDetails from "./cartdetails";
import { io, Socket } from "socket.io-client";

export default function VerifyCartsTable() {
  const [carts, setCarts] = React.useState<Cart[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCart, setSelectedCart] = React.useState<Cart | null>(null);
  const [socket, setSocket] = React.useState<Socket | null>(null);

  // Socket connection setup
  React.useEffect(() => {
    const newSocket = io("wss://ptzj7h9m-3000.inc1.devtunnels.ms", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      toast.success("Connected to verification service");
    });

    newSocket.on("connect_error", () => {
      toast.error("Connection to verification service failed");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch carts and setup socket listeners
  React.useEffect(() => {
    if (!socket) return;

    const fetchCarts = async () => {
      try {
        const data = await getCartsForVerification();
        setCarts(data);
        setLoading(false);
      } catch {
        toast.error("Failed to load carts");
        setLoading(false);
      }
    };

    fetchCarts();

    const handleVerificationUpdate = (updatedCart: Cart) => {
      setCarts((prevCarts) =>
        updatedCart.verified
          ? prevCarts.filter((cart) => cart._id !== updatedCart._id)
          : prevCarts.map((cart) =>
              cart._id === updatedCart._id ? updatedCart : cart
            )
      );

      if (selectedCart?._id === updatedCart._id) {
        setSelectedCart(updatedCart.verified ? null : updatedCart);
      }
    };

    const handleNewCart = (newCart: Cart) => {
      setCarts((prevCarts) => {
        if (!prevCarts.some((cart) => cart._id === newCart._id)) {
          toast.info(
            `New cart ${newCart._id.slice(-5)} added for verification!`
          );
          return [...prevCarts, newCart];
        }
        return prevCarts;
      });
    };

    socket.on("cart-verification-update", handleVerificationUpdate);
    socket.on("new-cart-for-verification", handleNewCart);

    return () => {
      socket.off("cart-verification-update", handleVerificationUpdate);
      socket.off("new-cart-for-verification", handleNewCart);
    };
  }, [socket, selectedCart]);

  const handleVerifyCart = async () => {
    if (!selectedCart) return;

    try {
      await verifyCart(selectedCart._id);
      setCarts((prev) => prev.filter((cart) => cart._id !== selectedCart._id));
      setSelectedCart(null);
      toast.success(`Cart verified successfully!`);
    } catch {
      toast.error("Failed to verify cart");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-90px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (carts.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-90px)]">
        <p className="text-gray-500">No carts available for verification</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-90px)] w-full overflow-hidden">
      <CartList
        carts={carts}
        setSelectedCart={setSelectedCart}
        selectedCart={selectedCart}
      />
      <CartDetails
        selectedCart={selectedCart}
        handleVerifyCart={handleVerifyCart}
      />
    </div>
  );
}
