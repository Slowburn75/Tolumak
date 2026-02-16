import { z } from "zod";
import { protectedProcedure } from "../index";
import { orderService } from "../services/order.service";

export const orderRouter = {
  createOrder: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            variantId: z.string().optional(),
            quantity: z.number().int().min(1),
          }),
        ),
        shippingAddress: z.string().optional(),
        paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
        couponCode: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      return await orderService.createOrder({
        userId: context.user.id,
        items: input.items,
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        couponCode: input.couponCode,
      });
    }),

  listMyOrders: protectedProcedure.handler(async ({ context }) => {
    return await orderService.listUserOrders(context.user.id);
  }),

  getOrderById: protectedProcedure.input(z.string()).handler(async ({ input, context }) => {
    const order = await orderService.getOrderById(input);

    // Authorization check (user can only see their own orders, or admin can see all)
    if (order.userId !== context.user.id && (context.user as any).role !== "admin") {
      throw new Error("Unauthorized access to this order");
    }

    return order;
  }),
};
