import React, { useState } from "react";

interface CartCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    cartNumber: number;
  };
  onClose: () => void;
  handleUpdate: (productId: string, quantity: number) => void;
  handleRemove: (productId: string) => void;
}

const CartCard: React.FC<CartCardProps> = ({
  product,
  onClose,
  handleUpdate,
  handleRemove,
}) => {
  const [quantity, setQuantity] = useState(product.quantity);
  const defaultImage = "https://portal.adia.com.au/nologo.png"; // Path to your default image

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const handleUpdateClick = () => {
    handleUpdate(product.id, quantity);
    onClose();
  };

  const handleRemoveClick = () => {
    handleRemove(product.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative transform transition-transform duration-300 ease-in-out scale-95 opacity-90 hover:scale-100 hover:opacity-100">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-4xl"
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-32 h-32 object-cover rounded mb-4"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
          />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {product.name}
          </h3>
          <div className="text-gray-600 mb-2">Price: ₹{product.price}</div>
          {/* <div className="text-gray-600 mb-2">Categories: {product.categories}</div> */}
          <div className="text-gray-600 mb-2">
            {quantity} X ₹{product.price} = ₹{quantity * product.price}
          </div>
          <div className="flex items-center space-x-1 mt-4">
            <button
              onClick={handleDecrement}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded text-sm"
            >
              -
            </button>
            <span className="w-6 text-center text-sm">{quantity}</span>
            <button
              onClick={handleIncrement}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded text-sm"
            >
              +
            </button>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleUpdateClick}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Update
            </button>
            <button
              onClick={handleRemoveClick}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCard;
