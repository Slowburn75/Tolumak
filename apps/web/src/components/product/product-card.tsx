"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/utils/format";

interface ProductProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category?: { name: string };
  stock: number;
}

export function ProductCard({ product }: { product: ProductProps }) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
      maxStock: product.stock,
    });
  };

  return (
    <Link href={`/products/${product.slug}`} className="block w-full h-full">
      <div className="group relative overflow-hidden flex flex-col h-full w-full bg-background transition-all hover:shadow-xl border border-stone-100">

        {/* IMAGE */}
        <div className="relative flex-1 aspect-[3/4] w-full bg-muted">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

          {/* OUT OF STOCK */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur">
              <span className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-white">
                Out of Stock
              </span>
            </div>
          )}

          {/* ADD TO CART */}
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="bg-white text-black hover:bg-gray-100"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* INFO */}
        <div className="p-6 bg-white space-y-3">
          <div className="space-y-1">
            <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold">
              {product.category?.name || "Uncategorized"}
            </p>
            <h3 className="text-sm font-medium text-stone-900 line-clamp-1">
              {product.name}
            </h3>
          </div>

          <div className="pt-2 border-t border-stone-50 flex items-baseline justify-between">
            <span className="text-base font-light tracking-tight text-stone-900">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">
              Detail
            </span>
          </div>
        </div>
      </div>

    </Link>
  );
}
