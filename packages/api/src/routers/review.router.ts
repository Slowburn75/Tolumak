import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { reviewService } from "../services/review.service";

export const reviewRouter = {
    list: publicProcedure
        .input(z.object({ productId: z.string() }))
        .handler(async ({ input }) => {
            return await reviewService.getReviewsByProduct(input.productId);
        }),

    create: protectedProcedure
        .input(
            z.object({
                productId: z.string(),
                rating: z.number().min(1).max(5),
                comment: z.string().optional(),
            })
        )
        .handler(async ({ context, input }) => {
            return await reviewService.createReview({
                userId: context.user.id,
                productId: input.productId,
                rating: input.rating,
                comment: input.comment,
            });
        }),

    delete: protectedProcedure
        .input(z.object({ reviewId: z.string() }))
        .handler(async ({ context, input }) => {
            // Admin check logic could be here or inside service.
            const isAdmin = (context.user as any).role === "ADMIN";
            return await reviewService.deleteReview(context.user.id, input.reviewId, isAdmin);
        }),
};
