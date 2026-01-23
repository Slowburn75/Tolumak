import { z } from "zod";
import { adminProcedure } from "../../index";
import { adminOrderService } from "../../services/admin/order.service";

export const orderRouter = {
  list: adminProcedure
    .input(
      z.object({
        status: z
          .enum([
            "PENDING_PAYMENT",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
            "REFUNDED",
          ])
          .optional(),
        customerId: z.string().optional(),
        dateFrom: z.string().datetime().optional(),
        dateTo: z.string().datetime().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .handler(async ({ input }) => {
      return await adminOrderService.listOrders(input);
    }),

  getById: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await adminOrderService.getOrderById(input.id);
  }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "PENDING_PAYMENT",
          "CONFIRMED",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
          "REFUNDED",
        ]),
        notes: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      return await adminOrderService.updateOrderStatus(
        input.id,
        input.status,
        context.user.id,
        input.notes,
      );
    }),

  addTracking: adminProcedure
    .input(
      z.object({
        id: z.string(),
        trackingNumber: z.string().min(1),
      }),
    )
    .handler(async ({ input, context }) => {
      return await adminOrderService.addTrackingNumber(
        input.id,
        input.trackingNumber,
        context.user.id,
      );
    }),

  addNotes: adminProcedure
    .input(
      z.object({
        id: z.string(),
        notes: z.string().min(1),
      }),
    )
    .handler(async ({ input }) => {
      return await adminOrderService.addAdminNotes(input.id, input.notes);
    }),
};
