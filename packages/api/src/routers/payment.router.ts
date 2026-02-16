import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { paymentService } from "../services/payment.service";
import { settingService } from "../services/admin/setting.service";

export const paymentRouter = {
  getActiveBankAccount: publicProcedure.handler(async () => {
    try {
      const isEnabled = await settingService.getSettingValue<boolean>("payment_bank_transfer_enabled", true);

      if (!isEnabled) return null;

      const [bankName, accountNumber, accountName] = await Promise.all([
        settingService.getSettingValue<string>("bank_name", ""),
        settingService.getSettingValue<string>("bank_account_number", ""),
        settingService.getSettingValue<string>("bank_account_name", ""),
      ]);

      if (bankName && accountNumber && accountName) {
        return {
          bankName,
          accountNumber,
          accountName,
          instructions: "Please make the transfer and upload proof of payment.",
        };
      }
    } catch (e) {
      console.error("Failed to fetch bank account details:", e);
    }
    return null;
  }),

  createPayment: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        method: z.enum(["COD", "BANK_TRANSFER"]),
      }),
    )
    .handler(async ({ input, context }) => {
      return await paymentService.createPayment({
        ...input,
        userId: context.user.id,
      });
    }),

  uploadProof: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        proofImageUrl: z.string().url(),
      }),
    )
    .handler(async ({ input, context }) => {
      return await paymentService.uploadPaymentProof({
        ...input,
        userId: context.user.id,
      });
    }),

  myPayments: protectedProcedure.handler(async ({ context }) => {
    return await paymentService.listUserPayments(context.user.id);
  }),
};
