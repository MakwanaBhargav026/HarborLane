import React from "react";
import Cart from "../components/Cart/Cart";
import CartDrawer from "../components/Drawer/CartDrawer";

export function CartManager() {
  return (
    <div
      className="flex flex-col w-full"
      style={{ height: "calc(100dvh - 55px)" }}
    >
      <Cart />
      <CartDrawer />
    </div>
  );
}
