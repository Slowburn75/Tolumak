"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react"; // I saw lucide-react in package.json

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/utils/format";

// Define a minimal type for product based on what the API returns
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
    e.preventDefault(); // Prevent navigation if clicking the button
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
      maxStock: product.stock,
    });
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <span className="rounded-md bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <CardHeader className="p-4 pb-0">
          <div className="text-sm text-muted-foreground">
            {product.category?.name || "Uncategorized"}
          </div>
          <h3 className="line-clamp-2 font-medium leading-tight">{product.name}</h3>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-lg font-bold text-primary">{formatPrice(product.price)}</div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full gap-2"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <CardHeader className="p-4 pb-0 space-y-2">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-5 w-full bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-9 w-full bg-muted rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
}
