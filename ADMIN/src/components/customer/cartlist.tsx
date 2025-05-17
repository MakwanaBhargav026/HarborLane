import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredCarts = carts.filter((cart) =>
    cart._id.slice(-5).toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    console.log("CartList received carts:", carts);
  }, [carts]);

  return (
    <div className="w-1/3 border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold mb-4">Cart Verification</h1>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search last 5 chars of cart ID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <CartTable
        carts={filteredCarts}
        selectedCart={selectedCart}
        setSelectedCart={setSelectedCart}
      />
    </div>
  );
}
