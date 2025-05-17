import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeCheck } from "lucide-react";

interface Product {
  barcode: string;
  category: string;
  imageUrl: string;
  name: string;
  price: number;
  units_sold: number;
}

const TopProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("This Month");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const DEFAULT_IMAGE = "https://portal.adia.com.au/nologo.png";

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch(
          "https://harborlane-1.onrender.com/top-products"
        );
        const data = await response.json();

        if (data.success) {
          // Show all products from the response
          setProducts(data.products);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  const handleImageError = (barcode: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [barcode]: true,
    }));
  };

  // Calculate total units sold
  const totalUnitsSold = products.reduce(
    (total, product) => total + product.units_sold,
    0
  );

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Top Selling Products
          </CardTitle>
          <span className="text-sm text-gray-500">{timeframe}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-76">
          {" "}
          {/* Make table scrollable with max height */}
          <Table className="w-full">
            <TableHeader className="sticky top-0 bg-white z-10">
              {" "}
              {/* Sticky header */}
              <TableRow>
                <TableHead className="w-20">Image</TableHead>
                <TableHead className="w-[250px]">Product</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 12 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="w-16 h-16 rounded-md" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                    </TableRow>
                  ))
                : products.map((product, index) => (
                    <TableRow
                      key={product.barcode}
                      className={index === 0 ? "bg-blue-50" : ""}
                    >
                      {/* Square Image with error handling */}
                      <TableCell>
                        <img
                          src={
                            imageErrors[product.barcode]
                              ? DEFAULT_IMAGE
                              : product.imageUrl || DEFAULT_IMAGE
                          }
                          alt={product.name}
                          className="w-16 h-16 rounded-md object-cover border border-gray-200"
                          onError={() => handleImageError(product.barcode)}
                        />
                      </TableCell>

                      {/* Product Name + Price + Category */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className="truncate w-[200px] font-medium">
                            {product.name}
                          </div>
                          {index === 0 && (
                            <BadgeCheck className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 font-semibold">
                          ₹{product.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {product.category}
                        </div>
                      </TableCell>

                      {/* Units Sold (Right-aligned) */}
                      <TableCell className="text-right font-semibold">
                        {product.units_sold.toLocaleString()}
                      </TableCell>

                      {/* Percentage of Total */}
                      <TableCell className="text-right text-gray-600">
                        {totalUnitsSold > 0
                          ? `${(
                              (product.units_sold / totalUnitsSold) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-right">
          Showing all {products.length} products
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductsList;
