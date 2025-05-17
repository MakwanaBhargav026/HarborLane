import React from "react";
import { ProductCard } from "./ProductCard";
import { deleteProduct, Product, updateProduct } from "../../api/product";

interface ProductGridViewProps {
  displayedProducts: Product[];
  lastProductElementRef: (node: HTMLDivElement | null) => void;
  onUpdateProductLocally: (id: string, updatedFields: Partial<Product>) => void;
  onDeleteProductLocally: (id: string) => void;
}

export const ProductGridView: React.FC<ProductGridViewProps> = ({
  displayedProducts,
  lastProductElementRef,
  onUpdateProductLocally,
  onDeleteProductLocally,
}) => {
  const handleToggleActive = async (id: string, newIsActive: boolean) => {
    try {
      await updateProduct(id, { is_active: newIsActive });
      onUpdateProductLocally(id, { is_active: newIsActive }); // immediately update local state
    } catch (error) {
      console.error("Error toggling active state", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      onDeleteProductLocally(id);
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {displayedProducts.map((product, index) => {
        const Wrapper =
          index === displayedProducts.length - 1 ? "div" : React.Fragment;
        return (
          <Wrapper
            {...(index === displayedProducts.length - 1
              ? { ref: lastProductElementRef }
              : {})}
            key={product._id}
          >
            <ProductCard
              product={product}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          </Wrapper>
        );
      })}
    </div>
  );
};
