import { z } from "zod";
import { adminProcedure } from "../../index";
import { customerService } from "../../services/admin/customer.service";

export const customerRouter = {
  list: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["USER", "ADMIN"]).optional(),
        isActive: z.boolean().optional(),
        emailVerified: z.boolean().optional(),
        hasOrders: z.boolean().optional(),
        dateFrom: z
          .string()
          .datetime()
          .transform((s) => new Date(s))
          .optional(),
        dateTo: z
          .string()
          .datetime()
          .transform((s) => new Date(s))
          .optional(),
        sortBy: z
          .enum(["name", "email", "createdAt", "totalSpent", "orderCount"])
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
      }),
    )
    .handler(async ({ input }) => {
      return await customerService.listCustomers(input);
    }),

  getById: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await customerService.getCustomerById(input.id);
  }),

  getStats: adminProcedure
    .input(z.object({ customerId: z.string() }))
    .handler(async ({ input }) => {
      return await customerService.getCustomerStats(input.customerId);
    }),

  getSegments: adminProcedure.handler(async () => {
    return await customerService.getCustomerSegments();
  }),
};
