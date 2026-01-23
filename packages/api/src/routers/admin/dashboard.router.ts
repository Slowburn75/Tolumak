import { z } from "zod";
import { adminProcedure } from "../../index";
import { dashboardService } from "../../services/admin/dashboard.service";

export const dashboardRouter = {
  getOverview: adminProcedure.handler(async () => {
    return await dashboardService.getOverview();
  }),

  getRecentOrders: adminProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .handler(async ({ input }) => {
      return await dashboardService.getRecentOrders(input?.limit);
    }),

  getTopProducts: adminProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .handler(async ({ input }) => {
      return await dashboardService.getTopProducts(input?.limit);
    }),

  getSalesChart: adminProcedure
    .input(z.object({ period: z.enum(["7d", "30d", "12m"]) }))
    .handler(async ({ input }) => {
      return await dashboardService.getSalesChart(input.period);
    }),
};
