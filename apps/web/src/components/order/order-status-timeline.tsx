"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Truck, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_STEPS = [
    { status: "PENDING_PAYMENT", label: "Order Placed", icon: Clock },
    { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
    { status: "PROCESSING", label: "Processing", icon: Package },
    { status: "SHIPPED", label: "Shipped", icon: Truck },
    { status: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

export function OrderStatusTimeline({ orderId, initialOrder }: { orderId: string; initialOrder: any }) {
    const { data: order } = useQuery(
        orpc.order.getOrderById.queryOptions({
            input: orderId,
            initialData: initialOrder,
            refetchInterval: 10000, // Poll every 10s
        })
    );

    if (!order) return null;

    const currentStatus = order.status;
    const history = order.statusHistory || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Status: {currentStatus.replace("_", " ")}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-border before:content-['']">
                    {history.map((item: any, index: number) => {
                        const date = new Date(item.createdAt);
                        return (
                            <div key={item.id} className="relative flex items-start gap-4">
                                <div className="absolute left-0 mt-1 flex h-10 w-10 -translate-x-[50%] items-center justify-center rounded-full bg-background border ring-4 ring-background">
                                    <div className="h-3 w-3 rounded-full bg-primary" />
                                </div>
                                <div className="ml-8 space-y-1">
                                    <p className="font-medium leading-none">{item.status.replace("_", " ")}</p>
                                    <p className="text-sm text-muted-foreground">{format(date, "PPP p")}</p>
                                    {item.notes && <p className="text-sm text-gray-500 mt-1">{item.notes}</p>}
                                </div>
                            </div>
                        );
                    })}

                    {history.length === 0 && (
                        <div className="relative flex items-start gap-4">
                            <div className="absolute left-0 mt-1 flex h-10 w-10 -translate-x-[50%] items-center justify-center rounded-full bg-background border ring-4 ring-background">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="ml-8">
                                <p className="font-medium">Order Placed</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "PPP p")}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
