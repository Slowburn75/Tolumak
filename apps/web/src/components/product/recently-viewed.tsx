"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { ProductCard } from "./product-card";

export function RecentlyViewed() {
    const [viewedIds, setViewedIds] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem("recentlyViewed");
            if (stored) {
                setViewedIds(JSON.parse(stored));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const { data, isLoading } = useQuery({
        ...orpc.product.listProducts.queryOptions({
            ids: viewedIds,
            limit: 4,
        }),
        enabled: mounted && viewedIds.length > 0,
    });

    if (!mounted || viewedIds.length === 0) return null;

    if (isLoading) return null; // Don't show loading state for this secondary feature

    if (!data?.products || data.products.length === 0) return null;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-light italic font-serif text-stone-900 text-center">
                Recently Viewed
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {data.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
