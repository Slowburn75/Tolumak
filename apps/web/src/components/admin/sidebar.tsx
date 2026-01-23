"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Tag,
    Settings,
    Image as ImageIcon,
    CreditCard,
    Ticket,
    // BarChart3,
    Layers,
} from "lucide-react";

const routes = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Products",
        icon: Package,
        href: "/dashboard/products",
        color: "text-violet-500",
    },
    {
        label: "Orders",
        icon: ShoppingCart,
        href: "/dashboard/orders",
        color: "text-pink-700",
    },
    {
        label: "Categories",
        icon: Layers,
        href: "/dashboard/categories",
        color: "text-orange-700",
    },
    {
        label: "Collections",
        icon: ImageIcon,
        href: "/dashboard/collections",
        color: "text-emerald-500",
    },
    {
        label: "Coupons",
        icon: Ticket,
        href: "/dashboard/coupons",
        color: "text-green-700",
    },
    {
        label: "Payments",
        icon: CreditCard,
        href: "/dashboard/payments",
        color: "text-yellow-600",
    },
    {
        label: "Customers",
        icon: Users,
        href: "/dashboard/customers",
        color: "text-indigo-500",
    },
    {
        label: "Attributes",
        icon: Tag,
        href: "/dashboard/attributes",
        color: "text-cyan-500",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">Tolumak Admin</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
