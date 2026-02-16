import prisma from "@Tolumak/db";

export class WishlistService {
    async addToWishlist(userId: string, productId: string) {
        // Check if improved: UPSERT would be better to avoid unique constraint errors if double-clicked
        // allowing "add" on already added item to just succeed is fine.
        // However, Prisma doesn't have a "do nothing" on conflict for create, so upsert or catch is needed.
        // Let's use upsert.

        return await prisma.wishlist.upsert({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
            update: {}, // No updates needed, just ensure it exists
            create: {
                userId,
                productId,
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: true,
                        price: true,
                        category: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async removeFromWishlist(userId: string, productId: string) {
        try {
            await prisma.wishlist.delete({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
            return true;
        } catch (e) {
            // If record doesn't exist, just return false or ignore
            return false;
        }
    }

    async getWishlist(userId: string) {
        return await prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: true,
                        price: true,
                        stock: true,
                        category: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async checkIsInWishlist(userId: string, productId: string) {
        const item = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        return !!item;
    }
}

export const wishlistService = new WishlistService();
