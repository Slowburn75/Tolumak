"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string; // unique identifier (usually variantId or productId)
  name: string;
  slug: string;
  price: number;
  image?: string;
  quantity: number;
  maxStock: number;
  productId: string;
  variantId?: string;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migration for legacy items
        const migrated = parsed.map((item: any) => ({
          ...item,
          productId: item.productId || item.id,
        }));
        setItems(migrated);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addItem = (product: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      // Check if item already exists based on ID (which should be unique for product/variant)
      // OR specifically check productId + variantId combination for robustness
      const existing = prev.find((item) => {
        if (product.variantId) {
          return item.productId === product.productId && item.variantId === product.variantId;
        }
        return item.id === product.id;
      });

      if (existing) {
        if (existing.quantity >= product.maxStock) {
          toast.error("Cannot add more of this item (out of stock limit)");
          return prev;
        }
        toast.success("Updated cart quantity");
        return prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      toast.success("Added to cart");
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("Removed from cart");
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item && quantity > item.maxStock) {
        toast.error(`Only ${item.maxStock} available`);
        return prev;
      }
      return prev.map((item) => (item.id === id ? { ...item, quantity } : item));
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
