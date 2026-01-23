"use client";

import { useCart } from "@/components/cart/cart-provider";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  const { data: session, isPending } = authClient.useSession();
  const { items } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/checkout");
    }
  }, [session, isPending, router]);

  if (isPending)
    return (
      <div className="p-8 text-center bg-muted/20 min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!session) return null;

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12 max-w-4xl">
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Back
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
