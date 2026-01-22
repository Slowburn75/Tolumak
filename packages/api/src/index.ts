import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

export const protectedProcedure = publicProcedure.use(async ({ context, next }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      user: context.user,
    },
  });
});

export const adminProcedure = protectedProcedure.use(async ({ context, next }) => {
  if (context.role !== "ADMIN") {
    throw new ORPCError("FORBIDDEN", {
      message: "Admin access required",
    });
  }
  return next({
    context: {
      user: context.user,
      role: context.role,
    },
  });
});
