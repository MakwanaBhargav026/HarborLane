import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";
import { addMultipleItemsToCart, checkCartVerification } from "../api/cart";
import { makePaymentRequest } from "../api/payment";
import { io } from "socket.io-client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const socket = io(import.meta.env.VITE_WS_URL || "http://localhost:3000");

const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function Checkout() {
  const [isVerified, setIsVerified] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] =
    useState(false);
  const { cartItems, setCartItems } = useUser();
  const userId = localStorage.getItem("userId");
  const defaultImage = "https://portal.adia.com.au/nologo.png";

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleVerificationUpdate = (data: {
      customer_id: string;
      verified: boolean;
    }) => {
      if (data.customer_id === userId && data.verified) {
        setIsVerified(true);
        setIsRequestingVerification(false);
        toast.success("Cart verification completed successfully!");
      }
    };

    socket.on("verification-update", handleVerificationUpdate);

    if (isRequestingVerification) {
      const checkVerification = async () => {
        if (userId) {
          const verified = await checkCartVerification(userId);
          if (verified) {
            setIsVerified(true);
            setIsRequestingVerification(false);
            toast.success("Cart verification completed successfully!");
          } else {
            timer = setTimeout(checkVerification, 5000);
          }
        }
      };
      checkVerification();
    }

    return () => {
      clearTimeout(timer);
      socket.off("verification-update", handleVerificationUpdate);
    };
  }, [isRequestingVerification, userId]);

  const handleRequestVerification = async () => {
    setIsRequestingVerification(true);
    if (userId) {
      try {
        const cartItemsToAdd = cartItems.map((item) => ({
          cart_number: item.cartNumber || 1,
          product_id: item.id,
          quantity: item.quantity,
        }));
        await addMultipleItemsToCart(userId, cartItemsToAdd);
        toast.info(
          "Verification request sent! Waiting for associate approval..."
        );
      } catch (error) {
        setIsRequestingVerification(false);
        toast.error("Failed to request verification. Please try again.");
      }
    }
  };

  const handlePayment = async () => {
    const loadingToast = toast.loading("Initializing payment...");

    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      toast.dismiss(loadingToast);
      toast.error(
        "Failed to load Razorpay. Please check your internet connection."
      );
      return;
    }

    try {
      // Format the data according to what your backend expects
      const response = await makePaymentRequest.createOrder({
        productIds: cartItems.map((item) => item.id),
        quantities: cartItems.map((item) => item.quantity),
        prices: cartItems.map((item) => item.price),
      });

      toast.dismiss(loadingToast);

      const { id: order_id, currency, products } = response.data;

      const options = {
        // key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        key: "rzp_test_bKWKJEeA520i0h",
        amount: overallTotal * 100,
        currency,
        name: "Your Store Name",
        description: "Payment for your order",
        order_id,
        handler: async (paymentResponse: any) => {
          const verifyToast = toast.loading("Verifying payment...");

          try {
            // Prepare data for payment verification in the format the backend expects
            const verifyResponse = await makePaymentRequest.verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              customer_id: userId,
              userName:
                (localStorage.getItem("user")
                  ? JSON.parse(localStorage.getItem("user")!)?.firstName
                  : "User Name") +
                " " +
                (localStorage.getItem("user")
                  ? JSON.parse(localStorage.getItem("user")!)?.lastName
                  : ""),
              phone_number: localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")!).phone
                : "7698194594",
              amount: overallTotal,
              // Modified order_items to include string identifiers instead of expecting ObjectIds
              order_items: cartItems.map((item) => ({
                cart_number: item.cartNumber || 1,
                product_barcode: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
            });

            toast.dismiss(verifyToast);

            if (verifyResponse.data.success) {
              setCartItems([]);
              toast.success(
                "Payment successful! The receipt will be provided via sms.",
                {
                  duration: 5000,
                  position: "top-center",
                  style: { backgroundColor: "#ecfdf5", color: "#047857" },
                  icon: "🎉",
                }
              );
            } else {
              toast.error(
                "Payment verification failed. Please contact support.",
                {
                  duration: 5000,
                  position: "top-center",
                }
              );
            }
          } catch (error) {
            toast.dismiss(verifyToast);
            console.error("Payment verification error:", error);
            toast.error(
              "Error verifying payment. The payment may have been processed, please check your email for confirmation.",
              {
                duration: 8000,
                position: "top-center",
              }
            );
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "7698194594",
        },
        notes: {
          address: "Customer Address",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`, {
          duration: 5000,
          position: "top-center",
        });
      });
      paymentObject.open();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Payment initiation error:", error);
      toast.error(
        "Error initiating payment. Please try again or contact support.",
        {
          duration: 5000,
          position: "top-center",
        }
      );
    }
  };

  // Group cart items by their cart number
  const groupedCartItems = cartItems.reduce(
    (acc: { [key: string]: typeof cartItems }, item) => {
      const cartNumber = item.cartNumber || "1";
      if (!acc[cartNumber]) {
        acc[cartNumber] = [];
      }
      acc[cartNumber].push(item);
      return acc;
    },
    {}
  );

  // Calculate the total for all items across all carts
  const overallTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-55px)] bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-600">Add some items to your cart to proceed.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-55px)] bg-gray-50">
      <div className="flex-grow overflow-y-auto p-4 md:p-6">
        {Object.entries(groupedCartItems).map(([cartNumber, items]) => (
          <div
            key={cartNumber}
            className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 mb-6"
          >
            <h2 className="text-xl font-medium text-gray-800 mb-4">
              Cart {cartNumber}
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                    onError={(e) => {
                      e.currentTarget.src = defaultImage;
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ₹{item.price.toLocaleString()} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-lg font-medium text-gray-800 self-end md:self-center">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <p className="text-lg font-semibold text-gray-800">
                Total: ₹
                {items
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 md:p-6 border-t border-gray-200 shadow-md">
        <AnimatePresence mode="wait">
          {!isRequestingVerification && !isVerified && (
            <motion.div
              key="request-verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row justify-between items-center"
            >
              <p className="text-xl font-semibold text-gray-800">
                Overall Total: ₹{overallTotal.toLocaleString()}
              </p>
              <button
                onClick={handleRequestVerification}
                className="mt-4 md:mt-0 bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 w-full md:w-auto"
              >
                Request Verification
              </button>
            </motion.div>
          )}
          {isRequestingVerification && !isVerified && (
            <motion.div
              key="verification-in-progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Verification in Progress
              </h1>
              <p className="text-gray-600 text-center mb-2">
                Your cart number is:{" "}
                <span className="font-semibold">
                  {localStorage.getItem("cartId")?.slice(-5) || "N/A"}
                </span>
              </p>
              <p className="text-gray-600 text-center mb-4">
                Please wait while an associate verifies your cart.
              </p>
              <motion.div
                className="w-16 h-16 border-4 border-green-600 border-dashed rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </motion.div>
          )}
          {isVerified && (
            <motion.div
              key="proceed-to-payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Verification Complete
              </h1>
              <p className="text-gray-600 text-center mb-4">
                Your cart has been verified. Your total is ₹
                {overallTotal.toLocaleString()}.
              </p>
              <button
                onClick={handlePayment}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
              >
                Proceed to Payment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
