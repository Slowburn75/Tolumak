"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { client, orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2, Truck, CreditCard, User, Package, MapPin } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/utils/format";
import { toast } from "sonner";
import { useState } from "react";

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();
    const [trackingNumber, setTrackingNumber] = useState("");

    const { data: order, isLoading } = useQuery(
        orpc.admin.orders.getById.queryOptions({ input: { id } })
    );

    const { mutateAsync: updateStatus, isPending: isUpdating } = useMutation({
        mutationFn: (status: any) =>
            client.admin.orders.updateStatus({ id, status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.orders.getById.queryKey({ input: { id } }) });
            toast.success("Order status updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update status");
        },
    });

    const { mutateAsync: addTracking, isPending: isAddingTracking } = useMutation({
        mutationFn: () =>
            client.admin.orders.addTracking({ id, trackingNumber }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.orders.getById.queryKey({ input: { id } }) });
            toast.success("Tracking number added");
            setTrackingNumber("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add tracking");
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground">Order not found</p>
                <Link href="/dashboard/orders">
                    <Button variant="outline">Back to Orders</Button>
                </Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING_PAYMENT": return "warning";
            case "CONFIRMED": return "default";
            case "PROCESSING": return "secondary";
            case "SHIPPED": return "info";
            case "DELIVERED": return "success";
            case "CANCELLED": return "destructive";
            default: return "secondary";
        }
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        });

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/orders">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Order #{order.id.slice(0, 8)}</h1>
                            <Badge variant="outline">{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt.toString())}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={order.status}
                        onValueChange={(val) => updateStatus(val)}
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" /> Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {item.product.images?.[0] && (
                                                        <img
                                                            src={item.product.images[0]}
                                                            alt=""
                                                            className="h-10 w-10 rounded-md object-cover border"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-sm">{item.product.name}</p>
                                                        {(item.variant?.size || item.variant?.color) && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {item.variant.size} {item.variant.color && `• ${item.variant.color}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatPrice(item.price)}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatPrice(item.price * item.quantity)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-6 flex flex-col gap-2 border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(order.subtotal || order.total)}</span>
                                </div>
                                {/* Assuming tax/shipping are calculated or part of total. For now showing Total */}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" /> Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <p className="font-medium">{order.user?.name || "Guest"}</p>
                                <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                                {order.user?.phone && <p className="text-sm text-muted-foreground">{order.user.phone}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" /> Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground space-y-1">
                                {(() => {
                                    let address: any = order.shippingAddress;
                                    try {
                                        if (typeof address === "string") {
                                            address = JSON.parse(address);
                                        }
                                    } catch (e) {
                                        // If parsing fails, treat as object or fallback string
                                    }

                                    if (!address) return <p>No shipping address provided</p>;
                                    return (
                                        <>
                                            <p>{address.line1 || address.address1 || address.address}</p>
                                            {address.line2 && <p>{address.line2}</p>}
                                            <p>
                                                {[address.city, address.state, address.postalCode || address.zip]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </p>
                                            <p>{address.country}</p>
                                            {address.phone && <p>Phone: {address.phone}</p>}
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" /> Fulfillment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.trackingNumber ? (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Tracking Number</Label>
                                    <p className="font-mono text-sm">{order.trackingNumber}</p>
                                    <Button variant="link" className="p-0 h-auto text-xs" asChild>
                                        <a href="#" target="_blank">Track Shipment</a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Add Tracking Number</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            placeholder="Tracking #"
                                            className="h-8"
                                        />
                                        <Button size="sm" onClick={() => addTracking()} disabled={!trackingNumber || isAddingTracking}>
                                            {isAddingTracking ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}
