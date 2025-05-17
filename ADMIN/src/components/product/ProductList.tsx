import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Filter, Download, Package, RefreshCw } from "lucide-react";
import { fetchProducts, Product } from "../../api/product";
import { FiltersSection } from "./FiltersSection";
import { ViewTabs } from "./ViewTabs";
import { ProductGridView } from "./ProductGridView";

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeView, setActiveView] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | HTMLTableRowElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchProductList = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProductList();
  }, []);

  useEffect(() => {
    let result = [...products];
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (category !== "all") {
      result = result.filter((product) => product.category === category);
    }
    if (activeView === "active") {
      result = result.filter((product) => product.is_active);
    } else if (activeView === "inactive") {
      result = result.filter((product) => !product.is_active);
    }
    result.sort((a, b) => {
      let valueA, valueB;
      switch (sortBy) {
        case "price":
          valueA = a.price;
          valueB = b.price;
          break;
        case "stock":
          valueA = a.stock_quantity;
          valueB = b.stock_quantity;
          break;
        case "popularity":
          valueA = a.units_sold;
          valueB = b.units_sold;
          break;
        case "updated":
          valueA = new Date(a.updated_at).getTime();
          valueB = new Date(b.updated_at).getTime();
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredProducts(result);
    setPage(1);
    setHasMore(true);
  }, [products, searchTerm, category, sortBy, sortOrder, activeView]);

  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * itemsPerPage;
    const newDisplayedProducts = filteredProducts.slice(startIndex, endIndex);
    setDisplayedProducts(newDisplayedProducts);
    if (endIndex >= filteredProducts.length) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [filteredProducts, page]);

  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );
  const toggleSortOrder = () =>
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-[calc(100vh-90px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  const handleUpdateProductLocally = (
    id: string,
    updatedFields: Partial<Product>
  ) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === id ? { ...product, ...updatedFields } : product
      )
    );
    setFilteredProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === id ? { ...product, ...updatedFields } : product
      )
    );
    setDisplayedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === id ? { ...product, ...updatedFields } : product
      )
    );
  };

  const handleDeleteProductLocally = (id: string) => {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product._id !== id)
    );
    setFilteredProducts((prevProducts) =>
      prevProducts.filter((product) => product._id !== id)
    );
    setDisplayedProducts((prevProducts) =>
      prevProducts.filter((product) => product._id !== id)
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Inventory</h1>
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => navigate("/admin/add-product")}
            className="cursor-pointer"
          >
            <Package className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <FiltersSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          category={category}
          setCategory={setCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          toggleSortOrder={toggleSortOrder}
          categories={categories}
        />
        <ViewTabs activeView={activeView} setActiveView={setActiveView} />
      </div>

      <div className="mb-4 text-sm text-gray-500 flex justify-between items-center">
        <span>
          Showing {displayedProducts.length} of {filteredProducts.length}{" "}
          products
        </span>
        {hasMore && displayedProducts.length > 0 && (
          <span className="text-xs text-gray-400">Scroll to load more</span>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <ProductGridView
          displayedProducts={displayedProducts}
          lastProductElementRef={lastProductElementRef}
          onUpdateProductLocally={handleUpdateProductLocally}
          onDeleteProductLocally={handleDeleteProductLocally}
        />
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No products found</h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your search or filter criteria
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setCategory("all");
              setActiveView("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {hasMore && displayedProducts.length > 0 && (
        <div className="flex justify-center my-6">
          <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ProductList;
