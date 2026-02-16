"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
    value: number;
    max: number;
    showLabel?: boolean;
    className?: string;
}

export function ProgressBar({ value, max, showLabel = true, className }: ProgressBarProps) {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    const isUnlimited = max === 0 || max === Infinity;

    const getColorScheme = () => {
        if (isUnlimited) return "bg-blue-500";
        if (percentage < 50) return "bg-green-500";
        if (percentage < 80) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden min-w-[60px]">
                <div
                    className={cn("h-full rounded-full transition-all", getColorScheme())}
                    style={{ width: `${isUnlimited ? 30 : percentage}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {value} / {isUnlimited ? "∞" : max}
                </span>
            )}
        </div>
    );
}
