"use client";

import React from "react";

interface Product {
  image: string;
  name: string;
  price: string;
}

export default function Card({ product }: { product: Product }) {
  const defaultImage =
    "https://portal.adia.com.au/nologo.png"; // Path to your default image

  if (!product) {
    // Skeleton loading
    return (
      <div className="p-3 bg-gray-300 rounded-lg animate-pulse">
        <div className="w-full h-32 bg-gray-400 mb-2 rounded-md"></div>
        <div className="h-4 bg-gray-400 mb-1 rounded-md"></div>
        <div className="w-10 h-4 bg-gray-400 mb-1 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-32 object-cover rounded-md mb-2"
        style={{ aspectRatio: "1 / 1" }} // Ensure the image is square
        onError={(e) => {
          e.currentTarget.src = defaultImage;
        }}
      />
      <h3 className="text-base font-medium leading-tight line-clamp-3">
        {product.name}
      </h3>{" "}
      {/* Adjust font size and line gap */}
      <p className="text-sm text-gray-600">₹{product.price}</p>
    </div>
  );
}
