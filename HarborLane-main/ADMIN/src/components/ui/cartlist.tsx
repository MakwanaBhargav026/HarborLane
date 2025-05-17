import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import CartTable from "./carttable";
import { Cart } from "@/api/cart";

interface CartListProps {
  carts: Cart[];
  selectedCart: Cart | null;
  setSelectedCart: (cart: Cart | null) => void;
}

export default function CartList({
  carts,
  selectedCart,
  setSelectedCart,
}: CartListProps) {
  return (
    <div className="w-1/3 border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold mb-4">Cart Verification</h1>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input placeholder="Search cart ID..." className="pl-8" />
        </div>
      </div>
      <CartTable
        carts={carts}
        selectedCart={selectedCart}
        setSelectedCart={setSelectedCart}
      />
    </div>
  );
}
