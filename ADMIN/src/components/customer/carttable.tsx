import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cart } from "@/api/cart";

interface CartTableProps {
  carts: Cart[];
  selectedCart: Cart | null;
  setSelectedCart: (cart: Cart | null) => void;
}

export default function CartTable({
  carts,
  selectedCart,
  setSelectedCart,
}: CartTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cart ID</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {carts.map((cart) => (
          <TableRow
            key={cart._id}
            onClick={() => setSelectedCart(cart)}
            className="cursor-pointer hover:bg-gray-50"
          >
            <TableCell>{cart._id.slice(-5)}</TableCell>
            <TableCell>{cart.cart_items?.length || 0}</TableCell>
            <TableCell>
              {cart.verified ? (
                <span className="text-green-500 font-medium">Verified</span>
              ) : cart.wants_verification ? (
                <span className="text-yellow-500 font-medium">Pending</span>
              ) : (
                <span className="text-gray-500 font-medium">Not Requested</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
