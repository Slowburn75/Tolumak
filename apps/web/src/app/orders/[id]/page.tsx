import { client } from "@/utils/orpc";
import { formatPrice } from "@/utils/format";
import { OrderStatusTimeline } from "@/components/order/order-status-timeline";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let order;
  try {
    order = await client.order.getOrderById(id);
    if (!order) {
      console.warn(`Order #${id} not found in database`);
      notFound();
    }
  } catch (error) {
    console.error(`Error fetching order #${id}:`, error);
    notFound();
  }

  // Parse shipping address
  let shippingAddress: any = {};
  if (order.shippingAddress) {
    if (typeof order.shippingAddress === "string") {
      try {
        shippingAddress = JSON.parse(order.shippingAddress);
      } catch (e) {
        shippingAddress = { address: order.shippingAddress };
      }
    } else {
      // It's already an object (Prisma JSON)
      shippingAddress = order.shippingAddress;
    }
  }

  // Final check for name/address if it was a simple string fallback
  if (!shippingAddress.name && typeof order.shippingAddress === 'string' && !shippingAddress.address) {
    shippingAddress = { address: order.shippingAddress };
  }

  return (
    <div className="container py-8 md:py-12 max-w-5xl">
      <div className="mb-6">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="pl-0 gap-2">
            <ChevronLeft className="w-4 h-4" /> Continue Shopping
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>

          {/* Status Timeline */}
          <OrderStatusTimeline orderId={id} initialOrder={order} />

          {/* Items */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="font-semibold mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded border bg-muted">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No Img</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary */}
          <div className="border rounded-lg p-6 bg-muted/30 space-y-4 sticky top-6">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg pt-4 border-t">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="pt-6 border-t space-y-4">
              <div>
                <h3 className="font-medium mb-1">Shipping Address</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{shippingAddress.name}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{[shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(", ")}</p>
                  <p>{shippingAddress.phone}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-1">Payment Method</h3>
                <p className="text-sm text-muted-foreground">
                  {order.payment?.method?.replace("_", " ") || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
