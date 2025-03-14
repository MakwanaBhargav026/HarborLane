import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CartItem } from "@/api/cart";

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  return (
    <Card className="mb-3">
      <CardHeader>
        <CardTitle>Product: {item.product_name}</CardTitle>
        <CardDescription>Product ID: {item.product_id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <div>
            <p className="text-sm">Quantity</p>
            <p className="font-medium">{item.quantity}</p>
          </div>
          <div>
            <p className="text-sm">Price</p>
            <p className="font-medium">${item.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm">Subtotal</p>
            <p className="font-medium">
              ${(item.quantity * item.price).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
