"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/utils/format";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { WishlistButton } from "../wishlist/wishlist-button";

interface ProductVariant {
    id: string;
    sku?: string;
    price: number;
    stock: number;
    size?: string;
    color?: string | null;
    image?: string;
    isActive?: boolean;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    attributes?: any;
    variants?: ProductVariant[];
}

export function ProductSelector({ product }: { product: Product }) {
    const { addItem } = useCart();

    // Derived state for available options
    const variants = product.variants || [];
    const hasVariants = variants.length > 0;

    // Extract unique colors and sizes
    const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[];
    const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean))) as string[];

    // Selection state
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [isAdded, setIsAdded] = useState(false);

    // Update selected variant when color/size change
    useEffect(() => {
        if (!hasVariants) return;

        let found: ProductVariant | undefined;

        if (colors.length > 0 && sizes.length > 0) {
            // Need both
            if (selectedColor && selectedSize) {
                found = variants.find(v => v.color === selectedColor && v.size === selectedSize);
            }
        } else if (colors.length > 0) {
            // Only color
            if (selectedColor) {
                found = variants.find(v => v.color === selectedColor);
            }
        } else if (sizes.length > 0) {
            // Only size
            if (selectedSize) {
                found = variants.find(v => v.size === selectedSize);
            }
        } else {
            // No options but has variants? Treat as single variant or edge case
            found = variants[0];
        }

        setSelectedVariant(found || null);
    }, [selectedColor, selectedSize, hasVariants, variants, colors.length, sizes.length]);

    // Initialize defaults if only one option
    useEffect(() => {
        if (hasVariants) {
            if (colors.length === 1 && !selectedColor) setSelectedColor(colors[0]);
            if (sizes.length === 1 && !selectedSize) setSelectedSize(sizes[0]);
        }
    }, [hasVariants, colors, sizes, selectedColor, selectedSize]);

    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const currentStock = hasVariants
        ? (selectedVariant ? selectedVariant.stock : 0)
        : product.stock;

    const handleAddToCart = () => {
        if (hasVariants && !selectedVariant) return;

        const itemToAdd = {
            id: selectedVariant ? selectedVariant.id : product.id,
            name: selectedVariant
                ? `${product.name} (${[selectedVariant.size, selectedVariant.color].filter(Boolean).join(" - ")})`
                : product.name,
            slug: product.slug,
            price: currentPrice,
            image: (selectedVariant?.image) || product.images[0],
            maxStock: currentStock,
            productId: product.id,
            variantId: selectedVariant?.id,
            size: selectedVariant?.size,
            color: selectedVariant?.color ?? undefined,
        };

        addItem(itemToAdd);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const attributes = product.attributes as Record<string, any> | undefined;

    // Helper to check if a combination is possible/in-stock
    const isOptionAvailable = (type: 'color' | 'size', value: string) => {
        if (type === 'color') {
            // Check if this color has ANY stock in available sizes
            // If size is selected, check if (color, size) exists
            if (selectedSize) {
                return variants.some(v => v.color === value && v.size === selectedSize && v.stock > 0);
            }
            return variants.some(v => v.color === value && v.stock > 0);
        } else {
            // Check if this size has ANY stock in available colors
            // If color is selected, check if (color, size) exists
            if (selectedColor) {
                return variants.some(v => v.size === value && v.color === selectedColor && v.stock > 0);
            }
            return variants.some(v => v.size === value && v.stock > 0);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</div>
            </div>

            {hasVariants && (
                <div className="space-y-6">
                    {/* Colors */}
                    {colors.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="text-sm font-medium">Color: <span className="text-muted-foreground font-normal">{selectedColor || "Select color"}</span></div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {colors.map((color) => {
                                    const isSelected = selectedColor === color;
                                    const available = isOptionAvailable('color', color);

                                    return (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={cn(
                                                "h-10 w-10 rounded-full border-2 transition-all flex items-center justify-center",
                                                isSelected
                                                    ? "border-primary ring-2 ring-primary ring-offset-2"
                                                    : "border-transparent hover:scale-110",
                                                !available && "opacity-50 cursor-not-allowed"
                                            )}
                                            disabled={!available}
                                            title={color}
                                        >
                                            <span
                                                className="h-8 w-8 rounded-full border border-stone-200 shadow-sm block"
                                                style={{ backgroundColor: color.toLowerCase().replace(/\s+/g, "") }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Sizes */}
                    {sizes.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="text-sm font-medium">Size: <span className="text-muted-foreground font-normal">{selectedSize || "Select size"}</span></div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size) => {
                                    const isSelected = selectedSize === size;
                                    const available = isOptionAvailable('size', size);

                                    return (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={cn(
                                                "min-w-[3rem] px-3 py-2 rounded-md border text-sm font-medium transition-all",
                                                isSelected
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
                                                !available && "opacity-50 cursor-not-allowed decoration-slice bg-muted text-muted-foreground"
                                            )}
                                            disabled={!available}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Render Other Attributes (Specifications) */}
            {attributes && Object.keys(attributes).length > 0 && (
                <div className="space-y-4 border-t pt-6">
                    <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Specifications</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        {Object.entries(attributes).map(([key, value]) => (
                            <div key={key} className="flex flex-col space-y-1">
                                <dt className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</dt>
                                <dd className="text-sm font-medium text-stone-900">{String(value)}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}

            <div className="flex flex-col gap-4 pt-6 border-t">
                {currentStock > 0 ? (
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-green-700">
                            In Stock
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-sm font-medium text-red-700">Out of Stock</span>
                    </div>
                )}

                <div className="flex gap-4">
                    <Button
                        size="lg"
                        className="flex-1 h-12 text-base"
                        onClick={handleAddToCart}
                        disabled={currentStock <= 0 || (hasVariants && !selectedVariant)}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {isAdded
                            ? "Added to Cart"
                            : (hasVariants && !selectedVariant)
                                ? "Select Options"
                                : "Add to Cart"}
                    </Button>
                    <WishlistButton productId={product.id} variant="icon" className="h-12 w-12 border border-input rounded-md hover:bg-accent hover:text-accent-foreground" />
                </div>
            </div>
        </div>
    );
}
