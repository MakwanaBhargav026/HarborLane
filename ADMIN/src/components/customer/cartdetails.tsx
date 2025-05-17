import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CartItemCard from "./cartitemcard";
import { Cart } from "@/api/cart";

interface CartDetailsProps {
  selectedCart: Cart | null;
  handleVerifyCart: () => void;
}

export default function CartDetails({
  selectedCart,
  handleVerifyCart,
}: CartDetailsProps) {
  if (!selectedCart) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-gray-500 text-lg">No Cart Selected</p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-2/3 flex flex-col p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Cart Details</h2>
        <Badge
          className={`px-3 py-1 ${
            selectedCart.verified ? "bg-green-500" : "bg-yellow-500"
          }`}
        >
          {selectedCart.verified ? "Verified" : "Pending"}
        </Badge>
      </div>
      <p className="text-sm text-gray-500 mt-1">ID: {selectedCart._id.slice(-5)}</p>

      <Button
        variant={selectedCart.verified ? "outline" : "default"}
        disabled={selectedCart.verified}
        onClick={handleVerifyCart}
        className="mt-4"
      >
        {selectedCart.verified ? "Verified" : "Verify Cart"}
      </Button>

      <Separator className="my-4" />

      <h3 className="font-bold mb-2">
        Cart Items ({selectedCart.cart_items.length})
      </h3>

      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-gray-200 p-2 rounded-md ">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedCart.cart_items.map((item) => (
            <CartItemCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
