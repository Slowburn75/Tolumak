"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    max?: number;
    size?: number;
    onRatingChange?: (rating: number) => void;
    readOnly?: boolean;
    className?: string;
}

export function StarRating({
    rating,
    max = 5,
    size = 16,
    onRatingChange,
    readOnly = false,
    className,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const stars = useMemo(() => {
        return Array.from({ length: max }, (_, i) => i + 1);
    }, [max]);

    const handleMouseEnter = (starValue: number) => {
        if (!readOnly && onRatingChange) {
            setHoverRating(starValue);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly && onRatingChange) {
            setHoverRating(null);
        }
    };

    const handleClick = (starValue: number) => {
        if (!readOnly && onRatingChange) {
            onRatingChange(starValue);
        }
    };

    return (
        <div className={cn("flex items-center space-x-1", className)}>
            {stars.map((starValue) => {
                const isFilled = (hoverRating ?? rating) >= starValue;

                return (
                    <button
                        key={starValue}
                        type="button"
                        className={cn(
                            "focus:outline-none transition-transform",
                            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
                        )}
                        onClick={() => handleClick(starValue)}
                        onMouseEnter={() => handleMouseEnter(starValue)}
                        onMouseLeave={handleMouseLeave}
                        disabled={readOnly}
                        aria-label={`Rate ${starValue} out of ${max}`}
                    >
                        <Star
                            size={size}
                            className={cn(
                                "transition-colors",
                                isFilled
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-stone-100 text-stone-300"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
