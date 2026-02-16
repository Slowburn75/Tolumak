"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/cart/cart-provider";
import { client, orpc } from "@/utils/orpc";
import { formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = authClient.useSession();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "COD",
    },
  });

  const { data: addresses } = useQuery({
    ...orpc.address.list.queryOptions({ input: undefined }),
    enabled: !!session,
  });

  // Autopopulate with default address
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      if (defaultAddr) {
        setValue("name", defaultAddr.name);
        setValue("phone", defaultAddr.phone);
        setValue("address", defaultAddr.address);
        setValue("city", defaultAddr.city);
        setValue("state", defaultAddr.state);
        setValue("postalCode", defaultAddr.postalCode || "");
      }
    }
  }, [addresses, setValue]);

  const handleAddressSelect = (addrId: string) => {
    if (addrId === "new") {
      setValue("name", "");
      setValue("phone", "");
      setValue("address", "");
      setValue("city", "");
      setValue("state", "");
      setValue("postalCode", "");
      return;
    }
    const addr = addresses?.find(a => a.id === addrId);
    if (addr) {
      setValue("name", addr.name);
      setValue("phone", addr.phone);
      setValue("address", addr.address);
      setValue("city", addr.city);
      setValue("state", addr.state);
      setValue("postalCode", addr.postalCode || "");
    }
  };

  const { data: bankAccount } = useQuery(orpc.payment.getActiveBankAccount.queryOptions({ input: undefined }));

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    setCouponMessage("");
    try {
      const result = await client.coupon.validate({ code: couponCode, subtotal });
      if (result.isValid) {
        setAppliedCoupon(result.coupon);
        setDiscountAmount(result.discountAmount);
        setCouponMessage("Coupon applied successfully!");
      } else {
        setCouponMessage(result.message || "Invalid coupon");
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (e) {
      setCouponMessage("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponMessage("");
    setCouponCode("");
  };

  const { mutateAsync: createOrder } = useMutation({
    mutationFn: async (data: any) => {
      return await client.order.createOrder(data);
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        items: items.map((item) => ({
          productId: item.productId || item.id,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: JSON.stringify({
          name: data.name,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
        }),
        paymentMethod: data.paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      toast.success("Order placed successfully!");
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Shipping Information</h2>

        {session && addresses && addresses.length > 0 && (
          <div className="space-y-2 pb-4">
            <Label htmlFor="saved-address">Select Saved Address</Label>
            <select
              id="saved-address"
              className="w-full p-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-primary"
              onChange={(e) => handleAddressSelect(e.target.value)}
              defaultValue={addresses.find(a => a.isDefault)?.id || addresses[0].id}
            >
              {addresses.map(a => (
                <option key={a.id} value={a.id}>
                  {a.label ? `${a.label}: ` : ""}{a.address}, {a.city}
                </option>
              ))}
              <option value="new">+ Use different address</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...register("phone")} placeholder="+234..." />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
            {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Payment Method</h2>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="cod"
              value="COD"
              {...register("paymentMethod")}
              className="h-4 w-4 border-primary text-primary focus:ring-primary"
            />
            <Label htmlFor="cod">Cash on Delivery</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="bank"
              value="BANK_TRANSFER"
              {...register("paymentMethod")}
              className="h-4 w-4 border-primary text-primary focus:ring-primary"
            />
            <Label htmlFor="bank">Bank Transfer</Label>
          </div>

        </div>

        {watch("paymentMethod") === "BANK_TRANSFER" && bankAccount && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Bank Account Details</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><span className="font-semibold">Bank Name:</span> {bankAccount.bankName}</p>
              <p><span className="font-semibold">Account Name:</span> {bankAccount.accountName}</p>
              <p><span className="font-semibold">Account Number:</span> {bankAccount.accountNumber}</p>
              {bankAccount.instructions && <p className="mt-2 text-xs">{bankAccount.instructions}</p>}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Please transfer the total amount to this account. Your order will be processed after confirmation.
            </p>
          </div>
        )}

        <div className="bg-muted p-6 rounded-lg space-y-4">
          <h3 className="font-semibold">Order Summary</h3>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <Button type="button" variant="ghost" onClick={removeCoupon}>Remove</Button>
                ) : (
                  <Button type="button" variant="secondary" onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode}>
                    Apply
                  </Button>
                )}
              </div>
              {couponMessage && <p className={cn("text-xs mt-1", appliedCoupon ? "text-green-600" : "text-red-500")}>{couponMessage}</p>}
            </div>

            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(Math.max(0, subtotal - discountAmount))}</span>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </div>
    </form>
  );
}
