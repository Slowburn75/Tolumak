"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { orpc, client } from "@/utils/orpc";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface WishlistButtonProps {
    productId: string;
    variant?: "icon" | "full";
    className?: string;
}

export function WishlistButton({
    productId,
    variant = "icon",
    className,
}: WishlistButtonProps) {
    const { data: session } = authClient.useSession();
    const queryClient = useQueryClient();
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Check initial status
    const { data: checkData } = useQuery({
        ...orpc.wishlist.check.queryOptions({ input: { productId } }),
        enabled: !!session,
    });

    useEffect(() => {
        if (checkData !== undefined) {
            setIsWishlisted(checkData);
        }
    }, [checkData]);

    const { mutateAsync: addToWishlist } = useMutation({
        mutationFn: async () => {
            return await client.wishlist.add({ productId });
        },
        onSuccess: () => {
            setIsWishlisted(true);
            toast.success("Added to wishlist");
            queryClient.invalidateQueries({ queryKey: orpc.wishlist.list.queryKey() });
            queryClient.invalidateQueries({ queryKey: orpc.wishlist.check.queryKey({ input: { productId } }) });
        },
        onError: () => {
            toast.error("Failed to add to wishlist");
            // Revert optimistic update if needed, simplistic approach here
            setIsWishlisted(false);
        },
    });

    const { mutateAsync: removeFromWishlist } = useMutation({
        mutationFn: async () => {
            return await client.wishlist.remove({ productId });
        },
        onSuccess: () => {
            setIsWishlisted(false);
            toast.success("Removed from wishlist");
            queryClient.invalidateQueries({ queryKey: orpc.wishlist.list.queryKey() });
            queryClient.invalidateQueries({ queryKey: orpc.wishlist.check.queryKey({ input: { productId } }) });
        },
        onError: () => {
            toast.error("Failed to remove from wishlist");
            setIsWishlisted(true);
        },
    });

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            toast.error("Please sign in to use wishlist");
            return;
        }

        // Optimistic toggle
        const newState = !isWishlisted;
        setIsWishlisted(newState);

        if (newState) {
            await addToWishlist();
        } else {
            await removeFromWishlist();
        }
    };

    if (variant === "full") {
        return (
            <Button
                variant="outline"
                size="lg"
                className={cn("w-full gap-2", className)}
                onClick={handleToggle}
            >
                <Heart
                    className={cn("h-5 w-5 transition-colors", isWishlisted && "fill-red-500 text-red-500")}
                />
                {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
            </Button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "rounded-full p-2 transition-colors hover:bg-stone-100",
                className
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                className={cn(
                    "h-5 w-5 transition-colors",
                    isWishlisted ? "fill-red-500 text-red-500" : "text-stone-400"
                )}
            />
        </button>
    );
}
