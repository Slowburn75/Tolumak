"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
    return (
        <div
            className={cn(
                "rounded-lg border bg-card p-6 shadow-sm",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold">{value}</p>
                {trend && (
                    <span
                        className={cn(
                            "text-xs font-medium",
                            trend.isPositive ? "text-green-600" : "text-red-600"
                        )}
                    >
                        {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                    </span>
                )}
            </div>
        </div>
    );
}
