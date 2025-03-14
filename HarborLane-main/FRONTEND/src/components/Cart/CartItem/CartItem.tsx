import React from "react";

interface Product {
  image: string;
  name: string;
  quantity: number;
  price: number;
}

const CartItem = ({ product }: { product: Product }) => {
  return (
    <div className="flex items-center py-2 px-1 border-b border-gray-200">
      <div className="w-15 h-15 flex-shrink-0 mr-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded"
        />
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-xs text-gray-800 mb-0.5 truncate">
          {product.name}
        </h3>
        <div className="text-xs text-gray-600">
          {product.quantity} X ₹{product.price}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
