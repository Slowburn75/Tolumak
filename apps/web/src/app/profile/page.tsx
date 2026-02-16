"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { formatPrice } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Package, User, ChevronRight, MapPin } from "lucide-react";
import { AddressManager } from "@/components/profile/address-manager";
import { toast } from "sonner";

function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
        CONFIRMED: "bg-blue-100 text-blue-800",
        PROCESSING: "bg-indigo-100 text-indigo-800",
        SHIPPED: "bg-purple-100 text-purple-800",
        DELIVERED: "bg-green-100 text-green-800",
        CANCELLED: "bg-red-100 text-red-800",
        REFUNDED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
}

export default function ProfilePage() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("profile");

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login?redirect=/profile");
        }
    }, [session, isPending, router]);

    const { data: ordersData } = useQuery({
        ...orpc.order.listMyOrders.queryOptions(),
        enabled: !!session,
    });

    if (isPending) {
        return (
            <div className="container py-24 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="container px-4 py-12 md:py-20 max-w-5xl">
            {/* Header */}
            <div className="mb-12 space-y-2">
                <h1 className="text-3xl font-light italic font-serif text-stone-900">My Account</h1>
                <p className="text-sm text-stone-500 font-light">
                    Welcome back, {session.user.name}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mb-10 border-b border-stone-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-2 pb-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${activeTab === "profile"
                        ? "text-stone-900 border-b-2 border-stone-900"
                        : "text-stone-400 hover:text-stone-600"
                        }`}
                >
                    <User className="h-4 w-4" />
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab("addresses")}
                    className={`flex items-center gap-2 pb-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${activeTab === "addresses"
                        ? "text-stone-900 border-b-2 border-stone-900"
                        : "text-stone-400 hover:text-stone-600"
                        }`}
                >
                    <MapPin className="h-4 w-4" />
                    Addresses
                </button>
                <button
                    onClick={() => setActiveTab("orders")}
                    className={`flex items-center gap-2 pb-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${activeTab === "orders"
                        ? "text-stone-900 border-b-2 border-stone-900"
                        : "text-stone-400 hover:text-stone-600"
                        }`}
                >
                    <Package className="h-4 w-4" />
                    Orders
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                            Full Name
                        </Label>
                        <Input value={session.user.name} disabled className="bg-stone-50" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                            Email Address
                        </Label>
                        <Input value={session.user.email} disabled className="bg-stone-50" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                            Member Since
                        </Label>
                        <Input
                            value={new Date(session.user.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                            disabled
                            className="bg-stone-50"
                        />
                    </div>
                </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <AddressManager />
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
                <div className="space-y-4">
                    {!ordersData || ordersData.length === 0 ? (
                        <div className="text-center py-16 space-y-4">
                            <Package className="h-12 w-12 text-stone-300 mx-auto" />
                            <h3 className="text-lg font-medium text-stone-700">No orders yet</h3>
                            <p className="text-sm text-stone-400">
                                Start shopping to see your orders here.
                            </p>
                            <Link href="/products">
                                <Button className="mt-4 rounded-none uppercase tracking-widest text-xs px-8 py-5">
                                    Browse Products
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        ordersData.map((order: any) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="group flex items-center justify-between border border-stone-100 p-6 hover:border-stone-300 transition-colors"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-stone-900">
                                            Order #{order.id.slice(0, 8)}
                                        </span>
                                        <span
                                            className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${getStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            {order.status.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-stone-400">
                                        <span>
                                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <span>{order.items?.length || 0} item(s)</span>
                                        <span className="font-bold text-stone-700">
                                            {formatPrice(order.total)}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
