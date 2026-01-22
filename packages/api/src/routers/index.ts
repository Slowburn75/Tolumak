import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { productRouter } from "./product.router";
import { orderRouter } from "./order.router";
import { paymentRouter } from "./payment.router";
import { adminPaymentRouter } from "./admin-payment.router";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  product: productRouter,
  order: orderRouter,
  payment: paymentRouter,
  adminPayment: adminPaymentRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
