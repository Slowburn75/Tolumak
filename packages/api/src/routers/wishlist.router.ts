import { z } from "zod";
import { protectedProcedure } from "../index";
import { wishlistService } from "../services/wishlist.service";

export const wishlistRouter = {
    list: protectedProcedure.handler(async ({ context }) => {
        return await wishlistService.getWishlist(context.user.id);
    }),

    add: protectedProcedure
        .input(z.object({ productId: z.string() }))
        .handler(async ({ context, input }) => {
            return await wishlistService.addToWishlist(context.user.id, input.productId);
        }),

    remove: protectedProcedure
        .input(z.object({ productId: z.string() }))
        .handler(async ({ context, input }) => {
            return await wishlistService.removeFromWishlist(context.user.id, input.productId);
        }),

    check: protectedProcedure
        .input(z.object({ productId: z.string() }))
        .handler(async ({ context, input }) => {
            return await wishlistService.checkIsInWishlist(context.user.id, input.productId);
        }),
};
