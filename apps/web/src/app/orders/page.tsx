import { client } from "@/utils/orpc";
import { formatPrice } from "@/utils/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function OrdersPage() {
    let orders: any[] = [];
    try {
        orders = await client.order.listMyOrders();
    } catch (error) {
        console.error("Failed to fetch orders:", error);
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING_PAYMENT":
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
            case "CONFIRMED":
                return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
            case "PROCESSING":
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
            case "SHIPPED":
                return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Shipped</Badge>;
            case "DELIVERED":
                return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
            case "CANCELLED":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="container py-8 md:py-12 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Order History</h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 border rounded-lg bg-card text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="mb-6">You haven't placed any orders yet.</p>
                    <Link href="/products">
                        <Button>Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: any) => (
                        <Link key={order.id} href={`/orders/${order.id}`}>
                            <div className="group border rounded-lg p-6 bg-card hover:border-primary transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-medium">#{order.id.slice(0, 8)}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                                        </span>
                                        <span>{order.items?.length || 0} items</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total Amount</p>
                                        <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
