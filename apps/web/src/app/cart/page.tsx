"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/utils/format";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart, isLoading } = useCart();
  const router = useRouter();

  if (isLoading) {
    return <div className="container py-24 text-center">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 space-y-4">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
        <Link href="/products">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart ({items.length} items)</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border rounded-lg p-4 bg-card">
              <div className="relative h-24 w-24 overflow-hidden rounded-md border bg-muted shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                    No img
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="font-medium">
                      <Link href={`/products/${item.slug}`} className="hover:underline">
                        {item.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-primary font-bold mt-1">{formatPrice(item.price)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="ml-auto font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearCart} className="text-sm">
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="h-fit space-y-4 rounded-lg border bg-muted/30 p-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Including VAT where applicable</p>
          </div>

          <Button className="w-full mt-6" size="lg" onClick={() => router.push("/checkout")}>
            Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
