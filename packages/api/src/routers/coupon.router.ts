import { z } from "zod";
import { protectedProcedure } from "../index";
import { couponService } from "../services/admin/coupon.service";

export const couponRouter = {
    validate: protectedProcedure // Or public? Validating might require user context for per-user limit. Yes user required per validateCoupon signature.
        .input(
            z.object({
                code: z.string(),
                subtotal: z.number(),
            }),
        )
        .handler(async ({ input, context }) => {
            return await couponService.validateCoupon(input.code, context.user.id, input.subtotal);
        }),
};
