"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useState } from "react";

export function AddToCartButton({ product }: { product: any }) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
      maxStock: product.stock,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Button
      size="lg"
      className="w-full md:max-w-xs"
      onClick={handleAddToCart}
      disabled={product.stock <= 0}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {isAdded ? "Added to Cart" : "Add to Cart"}
    </Button>
  );
}
