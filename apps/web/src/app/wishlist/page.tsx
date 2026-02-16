"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/format";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

export default function WishlistPage() {
    const router = useRouter();
    const { data: session, isPending: isAuthPending } = authClient.useSession();

    useEffect(() => {
        if (!isAuthPending && !session) {
            router.push("/login?redirect=/wishlist");
        }
    }, [session, isAuthPending, router]);

    const { data: wishlistItems, isLoading } = useQuery({
        ...orpc.wishlist.list.queryOptions(),
        enabled: !!session,
    });

    if (isAuthPending || isLoading) {
        return (
            <div className="container py-24 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="container px-4 py-12 md:py-20">
            {/* Header */}
            <div className="mb-12 text-center space-y-4">
                <h1 className="text-3xl font-light italic font-serif text-stone-900">
                    My Wishlist
                </h1>
                <div className="w-16 h-[1px] bg-stone-300 mx-auto" />
                <p className="text-stone-500 text-sm font-light">
                    {wishlistItems?.length || 0} items saved for later
                </p>
            </div>

            {!wishlistItems || wishlistItems.length === 0 ? (
                <div className="text-center py-16 space-y-6 max-w-md mx-auto">
                    <Heart className="h-12 w-12 text-stone-200 mx-auto" />
                    <h3 className="text-lg font-medium text-stone-700">
                        Your wishlist is empty
                    </h3>
                    <p className="text-sm text-stone-400">
                        Save items you love here. Review them anytime and easily move them to the bag.
                    </p>
                    <Link href="/products">
                        <Button className="mt-4 rounded-none uppercase tracking-widest text-xs px-8 py-5 w-full">
                            Start Shopping
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="group relative">
                            {/* Image */}
                            <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-4">
                                <Link href={`/products/${item.product.slug}`}>
                                    <Image
                                        src={item.product.images[0] || "/placeholder.jpg"}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </Link>
                                <div className="absolute top-2 right-2">
                                    <WishlistButton
                                        productId={item.product.id}
                                        className="bg-white/80 backdrop-blur-sm hover:bg-white"
                                    />
                                </div>
                                {item.product.stock <= 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-stone-900/70 text-white text-[10px] uppercase font-bold py-2 text-center backdrop-blur-sm">
                                        Out of Stock
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase tracking-widest text-stone-500">
                                    {item.product.category.name}
                                </div>
                                <Link href={`/products/${item.product.slug}`}>
                                    <h3 className="font-medium text-stone-900 hover:text-stone-600 transition-colors truncate">
                                        {item.product.name}
                                    </h3>
                                </Link>
                                <div className="text-sm text-stone-700">
                                    {formatPrice(item.product.price)}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4">
                                <Link href={`/products/${item.product.slug}`}>
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-none text-xs uppercase tracking-wider"
                                    >
                                        View Product
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
