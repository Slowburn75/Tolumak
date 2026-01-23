import { z } from "zod";
import { adminProcedure } from "../../index";
import { activityLogService } from "../../services/admin/activity-log.service";
import { metricService } from "../../services/admin/metric.service";

export const activityRouter = {
  list: adminProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        action: z.string().optional(),
        entity: z.string().optional(),
        entityId: z.string().optional(),
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
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
      }),
    )
    .handler(async ({ input }) => {
      return await activityLogService.getActivityLogs(input);
    }),

  getEntityHistory: adminProcedure
    .input(
      z.object({
        entity: z.string(),
        entityId: z.string(),
      }),
    )
    .handler(async ({ input }) => {
      return await activityLogService.getEntityHistory(input.entity, input.entityId);
    }),
};

export const metricRouter = {
  getDaily: adminProcedure
    .input(
      z.object({
        type: z.string(),
        days: z.number().int().positive().max(365).default(30),
      }),
    )
    .handler(async ({ input }) => {
      return await metricService.getDailyMetrics(input.type, input.days);
    }),

  getSummary: adminProcedure
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
      }),
    )
    .handler(async ({ input }) => {
      return await metricService.getMetricsSummary(input.period);
    }),

  generate: adminProcedure.handler(async () => {
    return await metricService.generateDailyMetrics();
  }),
};
