"use client";

import { useEffect } from "react";

interface ProductViewRecorderProps {
    productId: string;
}

export function ProductViewRecorder({ productId }: ProductViewRecorderProps) {
    useEffect(() => {
        try {
            const stored = localStorage.getItem("recentlyViewed");
            let viewed: string[] = stored ? JSON.parse(stored) : [];

            // Remove if already exists (to move to top)
            viewed = viewed.filter((id) => id !== productId);

            // Add to front
            viewed.unshift(productId);

            // Limit to 10
            viewed = viewed.slice(0, 10);

            localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
        } catch (e) {
            console.error("Failed to update recently viewed", e);
        }
    }, [productId]);

    return null;
}
