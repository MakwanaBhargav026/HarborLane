import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartItem } from "@/api/cart";

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  // Default image
  const defaultImage = "https://portal.adia.com.au/nologo.png";
  console.log("CartItemCard received item:", item);

  return (
    <Card className="mb-3 flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={item.imageUrl || defaultImage}
            alt={item.product_name}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        <div>
          <CardTitle>{item.product_name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <div>
            <p className="text-sm">Quantity</p>
            <p className="font-medium">{item.quantity}</p>
          </div>
          <div>
            <p className="text-sm">Price</p>
            <p className="font-medium">₹{item.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm">Subtotal</p>
            <p className="font-medium">
              ₹{(item.quantity * item.price).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
