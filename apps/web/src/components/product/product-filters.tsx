"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low → High", value: "price_asc" },
    { label: "Price: High → Low", value: "price_desc" },
] as const;

export function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            // Reset page when filters change
            params.delete("page");
            return params.toString();
        },
        [searchParams],
    );

    const { data: categories } = useQuery(orpc.category.list.queryOptions());

    const currentCategory = searchParams.get("categoryId");
    const currentSort = searchParams.get("sort");

    return (
        <div className="space-y-8">
            {/* Categories */}
            <div>
                <h3 className="mb-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                    Categories
                </h3>
                <div className="space-y-1">
                    <Button
                        variant={!currentCategory ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm"
                        onClick={() => router.push("/products")}
                    >
                        All Products
                    </Button>
                    {categories?.map((category) => (
                        <Button
                            key={category.id}
                            variant={currentCategory === category.id ? "secondary" : "ghost"}
                            className="w-full justify-start text-sm"
                            onClick={() =>
                                router.push(`/products?${createQueryString("categoryId", category.id)}`)
                            }
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Sort */}
            <div>
                <h3 className="mb-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                    Sort By
                </h3>
                <div className="space-y-1">
                    {SORT_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            variant={currentSort === option.value ? "secondary" : "ghost"}
                            className="w-full justify-start text-sm"
                            onClick={() =>
                                router.push(`/products?${createQueryString("sort", option.value)}`)
                            }
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}

