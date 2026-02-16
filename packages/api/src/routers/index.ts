import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { productRouter } from "./product.router";
import { orderRouter } from "./order.router";
import { paymentRouter } from "./payment.router";
import { adminPaymentRouter } from "./admin-payment.router";
import { adminRouter } from "./admin";
import { categoryRouter } from "./category.router";
import { collectionRouter } from "./collection.router";
import { couponRouter } from "./coupon.router";
import { wishlistRouter } from "./wishlist.router";
import { reviewRouter } from "./review.router";
import { addressRouter } from "./address.router";

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
  admin: adminRouter,
  category: categoryRouter,
  collection: collectionRouter,
  coupon: couponRouter,
  wishlist: wishlistRouter,
  review: reviewRouter,
  address: addressRouter,
};


export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
