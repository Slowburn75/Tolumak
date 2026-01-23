"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
// import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
            return params.toString();
        },
        [searchParams],
    );

    const { data: categories } = useQuery(orpc.category.list.queryOptions());

    const currentCategory = searchParams.get("categoryId");

    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-4 text-lg font-semibold">Categories</h3>
                <div className="space-y-2">
                    <Button
                        variant={!currentCategory ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push("/products")}
                    >
                        All Products
                    </Button>
                    {categories?.map((category) => (
                        <Button
                            key={category.id}
                            variant={currentCategory === category.id ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() =>
                                router.push(`/products?${createQueryString("categoryId", category.id)}`)
                            }
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
