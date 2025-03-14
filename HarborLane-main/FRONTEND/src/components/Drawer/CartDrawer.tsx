"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "../Card/Card";

export default function CartDrawer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [products, setProducts] = useState(Array(8).fill(null)); // Placeholder for 8 products

  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800; // Fallback for SSR
  const headerHeight = 55; // Header height in pixels
  const drawerHeight = windowHeight - headerHeight; // Drawer height matches viewport minus header

  // Positioning: y=0 is fully open (top at 55px), y adjusts for closed state
  const peekHeight = 36; // How much to show when closed (handle + some content)
  const minY = 0; // Fully open: top at 55px (adjusted by CSS top)
  const maxY = drawerHeight - peekHeight; // Closed: 60px peeks above bottom

  useEffect(() => {
    if (isExpanded) {
      setProducts(Array(8).fill(null)); // Reset products to show skeleton
      setTimeout(() => {
        setProducts([
          {
            id: "1",
            name: "Sunfeast Dark Fantasy Vanilla Creme, 249g, Dark Crunchy Biscuit with Smoo...",
            price: "$20",
            image:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQqwiQcolEIDRVEgRJlZoCMNq8h0ReIwD_IQ&s",
          },
          {
            id: "2",
            name: "Sunfeast Dark Fantasy Vanilla Creme, 249g, Dark Crunchy Biscuit with Smoo...",
            price: "$20",
            image:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5F_1RVEx-WylODDWR1RZRU-gl3iUVVu5NpA&s",
          },
          {
            id: "3",
            name: "Sunfeast Dark Fantasy Vanilla Creme, 249g, Dark Crunchy Biscuit with Smoo...",
            price: "$20",
            image:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlY-R0KTsApW-3xmjAFR7UJ7qG1rNCvWKyow&s",
          },
          {
            id: "4",
            name: "Sunfeast Dark Fantasy Vanilla Creme, 249g, Dark Crunchy Biscuit with Smoo...",
            price: "$20",
            image:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzj6SKeoxe3qcopwP66FmsCVacxuHFM0Mf5Q&s",
          },
          {
            id: "5",
            name: "Sunfeast Dark Fantasy Vanilla Creme, 249g, Dark Crunchy Biscuit with Smoo...",
            price: "$20",
            image:
              "https://plus.unsplash.com/premium_photo-1679513691641-9aedddc94f96?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmFuZG9tJTIwb2JqZWN0c3xlbnwwfHwwfHx8MA%3D%3D",
          },
          {
            id: "6",
            name: "Sunfeast Dark Fantasy Vanilla Creme, 249g, Dark Crunchy Biscuit with Smoo...",
            price: "$20",
            image:
              "https://images.thdstatic.com/productImages/03b3f75e-f804-4e2a-9236-fc27e16084ad/svn/ridgid-orbital-sanders-r8606b-64_600.jpg",
          },
        ]);
      }, 1000); // 1 second delay for skeleton loading
    }
  }, [isExpanded]);

  const preventPullToRefresh = (e: React.TouchEvent<HTMLDivElement>) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    if (scrollTop === 0 && e.touches && e.touches[0].clientY > 0) {
      e.preventDefault();
    }
  };

  return (
    <motion.div
      className="fixed left-0 right-0 bg-gray-100 shadow-2xl rounded-t-2xl p-4"
      style={{ height: `${drawerHeight}px`, top: `${headerHeight}px` }} // Fixed height and top offset
      initial={{ y: maxY }} // Start with 60px peeking
      animate={{ y: isExpanded ? minY : maxY }} // Animate to open or closed
      transition={{ type: "spring", stiffness: 300, damping: 40 }}
    >
      {/* Drag Handle */}
      <div
        className="w-50 h-1.5 bg-gray-400 rounded-full mx-auto mb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)} // Toggle drawer state on click
      />

      {/* Cart Content */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Top picks you'll want in your cart
        </p>
      </div>

      {/* Placeholder for Products */}
      <div
        className="mt-4 grid grid-cols-2 gap-4 p-4 pr-0 pl-0 overflow-y-auto"
        style={{ height: "calc(100% - 60px)" }} // Adjust for handle and text
        onTouchMove={preventPullToRefresh} // Prevent page reload on scroll up
      >
        {products.map((product, index) => (
          <Card key={index} product={product} />
        ))}
      </div>
    </motion.div>
  );
}
