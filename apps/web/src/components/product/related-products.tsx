"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { ProductCard } from "./product-card";

interface RelatedProductsProps {
    productId: string;
}

export function RelatedProducts({ productId }: RelatedProductsProps) {
    const { data: products, isLoading } = useQuery(
        orpc.product.listRelated.queryOptions({ input: { productId, limit: 4 } })
    );

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-4 animate-pulse">
                        <div className="h-[300px] bg-stone-100 w-full" />
                        <div className="space-y-2">
                            <div className="h-4 bg-stone-100 w-3/4" />
                            <div className="h-4 bg-stone-100 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-light italic font-serif text-stone-900 text-center">
                You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
