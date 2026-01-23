import { z } from "zod";
import { adminProcedure, publicProcedure } from "../../index";
import { settingService } from "../../services/admin/setting.service";

export const settingRouter = {
  getAll: adminProcedure.handler(async () => {
    return await settingService.getAllSettings();
  }),

  get: adminProcedure.input(z.object({ key: z.string() })).handler(async ({ input }) => {
    return await settingService.getSetting(input.key);
  }),

  update: adminProcedure
    .input(
      z.object({
        key: z.string().min(1),
        value: z.any(),
      }),
    )
    .handler(async ({ input, context }) => {
      return await settingService.updateSetting(input.key, input.value, context.user.id);
    }),

  updateMultiple: adminProcedure
    .input(
      z.object({
        settings: z
          .array(
            z.object({
              key: z.string(),
              value: z.any(),
            }),
          )
          .min(1),
      }),
    )
    .handler(async ({ input, context }) => {
      return await settingService.updateMultipleSettings(input.settings, context.user.id);
    }),

  delete: adminProcedure.input(z.object({ key: z.string() })).handler(async ({ input }) => {
    return await settingService.deleteSetting(input.key);
  }),

  initialize: adminProcedure.handler(async () => {
    return await settingService.initializeDefaultSettings();
  }),

  getPublic: publicProcedure.handler(async () => {
    return await settingService.getPublicSettings();
  }),
};
