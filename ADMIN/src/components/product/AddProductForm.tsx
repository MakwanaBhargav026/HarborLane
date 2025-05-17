import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, ArrowLeft } from "lucide-react";
import { createProduct, updateProduct, Product } from "../../api/product";

const AddProductForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isUpdateMode = location.pathname.includes("/update-product");

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    category: "",
    sub_category: "",
    stock_quantity: "",
    barcode: "",
    is_active: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    if (isUpdateMode && location.state?.product) {
      const existingProduct = location.state.product as Product;
      console.log("Loading existing product data:", existingProduct);

      if (existingProduct) {
        const updatedProduct = {
          name: existingProduct.name || "",
          description: existingProduct.description || "",
          imageUrl: existingProduct.imageUrl || "",
          price: existingProduct.price ? existingProduct.price.toString() : "",
          category: existingProduct.category || "",
          sub_category: existingProduct.sub_category || "",
          stock_quantity: existingProduct.stock_quantity
            ? existingProduct.stock_quantity.toString()
            : "",
          barcode: existingProduct.barcode || "",
          is_active:
            existingProduct.is_active !== undefined
              ? existingProduct.is_active
              : true,
        };

        setNewProduct(updatedProduct);
        console.log("Form state updated:", updatedProduct);
      }
    }

    setInitialized(true);
  }, [isUpdateMode, location.state, initialized]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewProduct((prev) => ({ ...prev, is_active: checked }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    if (name === "category") {
      setNewProduct((prev) => ({ ...prev, [name]: value, sub_category: "" }));
    } else {
      setNewProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const productData = {
      name: newProduct.name,
      description: newProduct.description,
      imageUrl: newProduct.imageUrl,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      sub_category: newProduct.sub_category || undefined,
      stock_quantity: parseInt(newProduct.stock_quantity, 10),
      barcode: newProduct.barcode,
      is_active: newProduct.is_active,
    };

    try {
      if (isUpdateMode && location.state?.product?._id) {
        const productId = location.state.product._id;
        await updateProduct(productId, productData);
        console.log("Product updated successfully");
      } else {
        await createProduct({
          ...productData,
          units_sold: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log("Product created successfully");
      }
      navigate("/admin/products");
    } catch (err) {
      console.error("Error submitting product:", err);
      setError("Failed to submit product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "appliances", label: "Appliances" },
    { value: "home & kitchen", label: "Home & Kitchen" },
    { value: "tv, audio & cameras", label: "TV, Audio & Cameras" },
    { value: "beauty & health", label: "Beauty & Health" },
    { value: "industrial supplies", label: "Industrial Supplies" },
    { value: "kids' fashion", label: "Kids' Fashion" },
    { value: "women's shoes", label: "Women's Shoes" },
    { value: "grocery & gourmet foods", label: "Grocery & Gourmet Foods" },
    { value: "electronics", label: "Electronics" },
    { value: "home, kitchen, pets", label: "Home, Kitchen, Pets" },
    { value: "music", label: "Music" },
    { value: "home appliances", label: "Home Appliances" },
    { value: "car & motorbike", label: "Car & Motorbike" },
    { value: "bags & luggage", label: "Bags & Luggage" },
    { value: "men's shoes", label: "Men's Shoes" },
    { value: "pet supplies", label: "Pet Supplies" },
    { value: "stores", label: "Stores" },
    { value: "men's clothing", label: "Men's Clothing" },
    { value: "women's clothing", label: "Women's Clothing" },
    { value: "accessories", label: "Accessories" },
    { value: "toys & baby products", label: "Toys & Baby Products" },
    { value: "sports & fitness", label: "Sports & Fitness" },
    { value: "sports", label: "Sports" },
  ];

  const subCategories: { [key: string]: string[] } = {
    electronics: [
      "Televisions",
      "Wearables",
      "Accessories",
      "Mobile Phones",
      "Laptops",
    ],
    accessories: [
      "Sunglasses",
      "Bags & Luggage",
      "Watches",
      "Handbags & Clutches",
      "Gold & Diamond Jewellery",
      "Jewellery",
      "Fashion & Silver Jewellery",
    ],
    "beauty & health": [
      "Make-up",
      "Diet & Nutrition",
      "Household Supplies",
      "Value Bazaar",
      "Beauty & Grooming",
      "Health & Personal Care",
      "Personal Care Appliances",
      "Luxury Beauty",
    ],
    "home & kitchen": [
      "Home Improvement",
      "Home Storage",
      "Garden & Outdoors",
      "Home Furnishing",
      "Bedroom Linen",
      "Furniture",
      "All Home & Kitchen",
      "Kitchen & Dining",
      "Home Décor",
      "Kitchen Storage & Containers",
      "food",
      "Indoor Lighting",
      "Sewing & Craft Supplies",
    ],
    "industrial supplies": [
      "Lab & Scientific",
      "Industrial & Scientific Supplies",
      "Janitorial & Sanitation Supplies",
      "Test, Measure & Inspect",
    ],
    stores: [
      "Men's Fashion",
      "Fashion Sales & Deals",
      "Sportswear",
      "The Designer Boutique",
      "Amazon Fashion",
      "Women's Fashion",
    ],
    "men's clothing": ["T-shirts & Polos", "Shirts", "Jeans", "Innerwear"],
    "bags & luggage": [
      "Travel Duffles",
      "Backpacks",
      "Wallets",
      "Rucksacks",
      "Suitcases & Trolley Bags",
      "Travel Accessories",
    ],
    "home, kitchen, pets": ["Refurbished & Open Box"],
    "toys & baby products": [
      "Strollers & Prams",
      "Nursing & Feeding",
      "Diapers",
      "Baby Bath, Skin & Grooming",
      "Toys & Games",
      "Baby Products",
      "Toys Gifting Store",
    ],
    "pet supplies": ["Dog supplies", "All Pet Supplies"],
    "women's clothing": [
      "Ethnic Wear",
      "Clothing",
      "Western Wear",
      "Lingerie & Nightwear",
    ],
    "women's shoes": ["Fashion Sandals", "Shoes", "Ballerinas"],
    "home appliances": ["Kitchen", "Lighting", "food", "ring"],
    sports: ["Fitness", "ball", "Footwear"],
    "tv, audio & cameras": [
      "Camera Accessories",
      "Cameras",
      "Speakers",
      "Televisions",
      "Headphones",
      "Home Entertainment Systems",
      "All Electronics",
      "Security Cameras",
    ],
    "sports & fitness": [
      "Camping & Hiking",
      "All Sports, Fitness & Outdoors",
      "Yoga",
      "Fitness Accessories",
      "Running",
      "All Exercise & Fitness",
      "Cycling",
      "Strength Training",
      "Football",
      "Badminton",
      "Cardio Equipment",
      "Cricket",
    ],
    "kids' fashion": [
      "Kids' Fashion",
      "Baby Fashion",
      "Kids' Watches",
      "Kids' Shoes",
      "Kids' Clothing",
      "School Bags",
    ],
    "car & motorbike": [
      "Motorbike Accessories & Parts",
      "Car Electronics",
      "All Car & Motorbike Products",
      "Car Parts",
      "Car Accessories",
      "Car & Bike Care",
    ],
    "men's shoes": ["Sports Shoes", "Casual Shoes", "Formal Shoes"],
    music: ["Musical Instruments & Professional Audio"],
    "grocery & gourmet foods": [
      "Snack Foods",
      "All Grocery & Gourmet Foods",
      "Coffee, Tea & Beverages",
    ],
    appliances: [
      "Refrigerators",
      "Kitchen & Home Appliances",
      "Heating & Cooling Appliances",
      "Air Conditioners",
      "Washing Machines",
      "All Appliances",
    ],
    "": [], // Default empty when no category is selected
  };

  const getCategoryLabel = (value: string) => {
    const category = categories.find((cat) => cat.value === value);
    return category ? category.label : value;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Package className="h-6 w-6 mr-2 text-gray-600" />
          {isUpdateMode ? "Update Product" : "Add New Product"}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/products")}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>

      <Card className="bg-white shadow-md border-gray-100">
        <form onSubmit={handleFormSubmit}>
          <CardContent className="grid gap-6">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700">
                Product Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={newProduct.name}
                onChange={handleFormChange}
                required
                placeholder="Enter product name"
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleFormChange}
                required
                placeholder="Enter product description"
                className="w-full min-h-[100px]"
                disabled={loading}
              />
            </div>

            {/* Image URL */}
            <div className="grid gap-2">
              <Label htmlFor="imageUrl" className="text-gray-700">
                Image URL
              </Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="text"
                value={newProduct.imageUrl}
                onChange={handleFormChange}
                required
                placeholder="Enter image URL"
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-gray-700">
                Price (₹)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={newProduct.price}
                onChange={handleFormChange}
                required
                placeholder="Enter price"
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-gray-700">
                Category
              </Label>
              <Select
                value={newProduct.category}
                onValueChange={handleSelectChange("category")}
                disabled={loading}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select category">
                    {newProduct.category
                      ? getCategoryLabel(newProduct.category)
                      : "Select category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub-Category */}
            <div className="grid gap-2">
              <Label htmlFor="sub_category" className="text-gray-700">
                Sub-Category
              </Label>
              <Select
                value={newProduct.sub_category}
                onValueChange={handleSelectChange("sub_category")}
                disabled={!newProduct.category || loading}
              >
                <SelectTrigger id="sub_category" className="w-full">
                  <SelectValue placeholder="Select sub-category">
                    {newProduct.sub_category || "Select sub-category"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {(subCategories[newProduct.category] || []).map((subCat) => (
                    <SelectItem key={subCat} value={subCat.toLowerCase()}>
                      {subCat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock Quantity */}
            <div className="grid gap-2">
              <Label htmlFor="stock_quantity" className="text-gray-700">
                Stock Quantity
              </Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                value={newProduct.stock_quantity}
                onChange={handleFormChange}
                required
                placeholder="Enter stock quantity"
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Barcode */}
            <div className="grid gap-2">
              <Label htmlFor="barcode" className="text-gray-700">
                Barcode
              </Label>
              <Input
                id="barcode"
                name="barcode"
                type="text"
                value={newProduct.barcode}
                onChange={handleFormChange}
                required
                placeholder="Enter barcode"
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Active Switch */}
            <div className="flex items-center gap-4">
              <Label htmlFor="is_active" className="text-gray-700">
                Active
              </Label>
              <Switch
                id="is_active"
                checked={newProduct.is_active}
                onCheckedChange={handleSwitchChange}
                disabled={loading}
              />
            </div>

            {/* Error message if any */}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading
                ? isUpdateMode
                  ? "Updating..."
                  : "Adding..."
                : isUpdateMode
                ? "Update Product"
                : "Add Product"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddProductForm;
