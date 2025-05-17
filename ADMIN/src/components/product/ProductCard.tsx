import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  MoreHorizontal,
  Eye,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Tag,
} from "lucide-react";
import { Product } from "../../api/product";
import { useNavigate } from "react-router-dom";

const defaultImage = "https://portal.adia.com.au/nologo.png";

interface ProductCardProps {
  product: Product;
  onToggleActive: (id: string, newIsActive: boolean) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onToggleActive,
  onDelete,
}) => {
  const navigate = useNavigate();
  return (
    <Card className="relative h-full flex flex-col overflow-hidden rounded-lg shadow-md border-gray-100 bg-white">
      <div
        className="absolute top-2 right-2 w-3 h-3 rounded-full shadow-sm"
        style={{ backgroundColor: product.is_active ? "#10b981" : "#ef4444" }}
      ></div>

      <div className="relative h-40 overflow-hidden bg-white">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="object-contain w-full h-full p-2"
          onError={(e) => (e.currentTarget.src = defaultImage)}
        />
      </div>

      <CardHeader className="pb-0 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-800 truncate max-w-xs">
            {product.name}
          </CardTitle>
          <p className="font-semibold text-lg text-gray-900">
            ₹{product.price.toFixed(2)}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {product.category}
          {product.sub_category && ` • ${product.sub_category}`}
        </p>
      </CardHeader>

      <CardContent className="py-2 px-3 flex-grow">
        <p className="text-xs text-gray-600 line-clamp-1 mb-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500 flex items-center">
            <Tag className="h-3 w-3 mr-1 opacity-70" />
            <span className="truncate max-w-xs">{product.barcode}</span>
          </div>
          <div
            className={`text-xs px-2 py-0.5 rounded-full ${
              product.stock_quantity > 10
                ? "bg-green-100 text-green-800"
                : product.stock_quantity > 0
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.stock_quantity > 0
              ? `${product.stock_quantity} in stock`
              : "Out of stock"}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-2 px-3 flex justify-end items-center border-t border-gray-100 bg-gray-50">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7 text-gray-700 hover:bg-gray-200"
            onClick={() =>
              navigate("/admin/update-product", {
                state: { product },
              })
            }
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-gray-700 hover:bg-gray-200 rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">


              <DropdownMenuItem
                className="text-xs cursor-pointer"
                onClick={() => product._id && onToggleActive(product._id, !product.is_active)}
              >
                {product.is_active ? (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-2 opacity-70" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 opacity-70" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-xs text-red-600 cursor-pointer"
                onClick={() => {
                  if (
                    confirm("Are you sure you want to delete this product?")
                  ) {
                    product._id && onDelete(product._id);
                  }
                }}
              >
                <Trash2 className="h-3 w-3 mr-2 opacity-70" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};
