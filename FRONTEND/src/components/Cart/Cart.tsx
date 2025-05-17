import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { fetchProductByBarcode, Product } from "../../api/products";
import CartItem from "./CartItem/CartItem";
import CartCard from "./CartCard/CartCard";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, CartItemInterface } from "../../context/UserContext";

const Cart = () => {
  const navigate = useNavigate();
  const { setCartItems } = useUser();

  // We'll use CartItemInterface for scanned items.
  const [scannedItems, setScannedItems] = useState<CartItemInterface[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [scannedItem, setScannedItem] = useState<CartItemInterface | null>(
    null
  );
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState<CartItemInterface | null>(
    null
  );

  // Tabs state
  const [tabs, setTabs] = useState([1]);
  const [activeTab, setActiveTab] = useState(0);

  // Long press state for checkout mode
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);
  const defaultImage = "https://portal.adia.com.au/nologo.png";

  const cleanupScanner = useCallback(() => {
    const scannerElem = document.getElementById("scanner");
    if (scannerElem) scannerElem.innerHTML = "";
  }, []);

  const addNewTab = () => {
    if (tabs.length < 3) {
      setTabs([...tabs, Math.max(...tabs) + 1]);
      setActiveTab(tabs.length);
    }
  };

  // When a barcode is scanned, build a CartItemInterface object.
  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (scannedItem || showProductModal) return;
      try {
        const product: Product = await fetchProductByBarcode(decodedText);
        setProductQuantity(1);
        const newItem: CartItemInterface = {
          id: product.barcode, // Using barcode as id
          name: product.name,
          quantity: 1,
          price: product.price,
          image: product.imageUrl, // Using imageUrl as image
          cartNumber: tabs[activeTab],
        };
        setScannedItem(newItem);
        setIsScannerOpen(false);
        cleanupScanner();
        setShowProductModal(true);
      } catch (error) {
        console.error("Failed to fetch product by barcode:", error);
      }
    },
    [activeTab, cleanupScanner, scannedItem, showProductModal, tabs]
  );

  // Initialize the scanner when open.
  useEffect(() => {
    if (!isScannerOpen) {
      cleanupScanner();
      return;
    }
    const scanner = new Html5QrcodeScanner(
      "scanner",
      { fps: 10, qrbox: { width: 250, height: 100 } },
      false
    );
    scanner.render(handleScanSuccess, console.error);
    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isScannerOpen, handleScanSuccess, cleanupScanner]);

  const handleConfirmAdd = () => {
    if (!scannedItem) return;
    setScannedItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === scannedItem.id && item.cartNumber === tabs[activeTab]
      );
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + productQuantity,
        };
        return updated;
      }
      return [...prev, { ...scannedItem, quantity: productQuantity }];
    });
    // Also update the global cart context.
    setCartItems([
      ...scannedItems,
      {
        ...scannedItem,
        quantity: productQuantity,
        cartNumber: tabs[activeTab],
      },
    ]);
    // Reset modal state.
    setShowProductModal(false);
    setScannedItem(null);
    setProductQuantity(1);
  };

  const handleRemove = () => {
    setShowProductModal(false);
    setScannedItem(null);
    setProductQuantity(1);
  };

  const openScanner = () => {
    if (isCheckoutMode) return;
    setShowProductModal(false);
    setScannedItem(null);
    setProductQuantity(1);
    setIsScannerOpen(true);
  };

  const handleItemClick = (item: CartItemInterface) => {
    setSelectedItem(item);
  };

  const handleCloseCartCard = () => {
    setSelectedItem(null);
  };

  const handleUpdateProduct = (id: string, quantity: number) => {
    setScannedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveProduct = (id: string) => {
    setScannedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = scannedItems.filter(
    (item) => item.cartNumber.toString() === tabs[activeTab].toString()
  );

  // --- Long-Press Handlers for the Floating Button ---
  const handleButtonPressStart = () => {
    // If already in checkout mode, do nothing.
    if (isCheckoutMode) return;
    setIsPressing(true);
    longPressTimerRef.current = window.setTimeout(() => {
      setIsCheckoutMode(true);
      setIsPressing(false);
    }, 1500);
  };

  const handleButtonPressEnd = () => {
    // If in checkout mode, do nothing.
    if (isCheckoutMode) return;
    setIsPressing(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      // Since long press did not complete, open the scanner.
      openScanner();
    }
  };

  // If in checkout mode, clicking the button navigates to /checkout.
  const handleCheckoutClick = () => {
    if (isCheckoutMode) {
      setCartItems(
        scannedItems.map((item) => ({
          ...item,
          cartNumber: item.cartNumber,
        }))
      );
      navigate("/checkout");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white h-calc([100vh]-55px) relative">
      {/* Tabs Header */}
      <div className="flex bg-gray-200 px-1 pt-1 items-end h-10">
        {tabs.map((tabNum, index) => (
          <button
            key={tabNum}
            onClick={() => setActiveTab(index)}
            className={`py-2 flex-1 text-sm rounded-t-lg ${
              activeTab === index
                ? "bg-white font-medium"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            CART {tabNum}
          </button>
        ))}
        {tabs.length < 3 && (
          <button
            onClick={addNewTab}
            className="w-8 bg-gray-400 text-white rounded-full text-lg h-8 ml-1 mb-1 font-bold"
          >
            +
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="bg-white p-2 overflow-y-auto">
        {filteredItems.map((item) => (
          <div key={item.id} onClick={() => handleItemClick(item)}>
            <CartItem product={item} />
          </div>
        ))}
      </div>

      {/* CartCard Modal */}
      {selectedItem && (
        <CartCard
          product={selectedItem}
          onClose={handleCloseCartCard}
          handleUpdate={handleUpdateProduct}
          handleRemove={handleRemoveProduct}
        />
      )}

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Scan Product</h3>
            <div id="scanner" className="mb-4"></div>
            <button
              onClick={() => setIsScannerOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && scannedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 border border-green-300">
            <div className="text-center text-gray-900">
              <img
                src={scannedItem.image}
                alt={scannedItem.name}
                className="w-32 h-32 mx-auto mb-4 rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = defaultImage;
                }}
              />
              <h3 className="text-lg font-semibold mb-2">{scannedItem.name}</h3>
              <p className="text-xl font-semibold text-green-600 mb-3">
                ₹ {scannedItem.price}{" "}
                <span className="text-sm text-gray-600">Per Unit</span>
              </p>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={() =>
                    setProductQuantity((prev) => Math.max(1, prev - 1))
                  }
                  className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full text-xl flex items-center justify-center hover:bg-gray-300 transition"
                >
                  −
                </button>
                <span className="text-xl font-medium">{productQuantity}</span>
                <button
                  onClick={() => setProductQuantity((prev) => prev + 1)}
                  className="w-10 h-10 bg-green-500 text-white rounded-full text-xl flex items-center justify-center hover:bg-green-600 transition"
                >
                  +
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleRemove}
                  className="w-full py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Remove
                </button>
                <button
                  onClick={handleConfirmAdd}
                  className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="fixed bottom-12 right-4 flex flex-col items-end">
        <AnimatePresence>
          {isCheckoutMode && (
            <motion.button
              key="cancel"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsCheckoutMode(false);
              }}
              className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-lg shadow-lg mb-2"
            >
              &times;
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          // Only trigger long press logic if not in checkout mode.
          onMouseDown={() => {
            if (!isCheckoutMode) handleButtonPressStart();
          }}
          onMouseUp={() => {
            if (!isCheckoutMode) handleButtonPressEnd();
          }}
          onTouchStart={() => {
            if (!isCheckoutMode) handleButtonPressStart();
          }}
          onTouchEnd={() => {
            if (!isCheckoutMode) handleButtonPressEnd();
          }}
          onClick={() => {
            if (isCheckoutMode) {
              handleCheckoutClick();
            }
          }}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl shadow-lg transition transform duration-300 hover:scale-105 ${
            isPressing ? "glow" : ""
          }`}
          style={{ backgroundColor: isCheckoutMode ? "#2F855A" : "#22543D" }}
        >
          {isCheckoutMode ? <span>&#x2713;</span> : <span>&#43;</span>}
          {/* Only show the progress circle if not in checkout mode */}
          {!isCheckoutMode && isPressing && (
            <motion.svg
              className="absolute top-0 left-0"
              width="64"
              height="64"
              viewBox="0 0 64 64"
            >
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="transparent"
                stroke="white"
                strokeWidth="4"
                strokeDasharray="175.929"
                initial={{ strokeDashoffset: 175.929 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, ease: "linear" }}
              />
            </motion.svg>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default Cart;
