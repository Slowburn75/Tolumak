import prisma from "@Tolumak/db";

export class ReviewService {
    async createReview(data: {
        userId: string;
        productId: string;
        rating: number;
        comment?: string;
    }) {
        // Check if user already reviewed this product? 
        // Usually one review per product per user is a good rule.
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: data.userId,
                productId: data.productId,
            },
        });

        if (existingReview) {
            throw new Error("You have already reviewed this product.");
        }

        return await prisma.review.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });
    }

    async getReviewsByProduct(productId: string) {
        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate aggregate stats
        const totalReviews = reviews.length;
        const averageRating =
            totalReviews > 0
                ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
                : 0;

        return {
            reviews,
            stats: {
                totalReviews,
                averageRating: parseFloat(averageRating.toFixed(1)),
                ratingDistribution: this.calculateDistribution(reviews),
            },
        };
    }

    private calculateDistribution(reviews: { rating: number }[]) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((review) => {
            const rating = review.rating;
            if (rating >= 1 && rating <= 5) {
                distribution[rating as keyof typeof distribution]++;
            }
        });
        return distribution;
    }

    async deleteReview(userId: string, reviewId: string, isAdmin: boolean = false) {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new Error("Review not found");
        }

        if (review.userId !== userId && !isAdmin) {
            throw new Error("unauthorized");
        }

        return await prisma.review.delete({
            where: { id: reviewId },
        });
    }
}

export const reviewService = new ReviewService();
