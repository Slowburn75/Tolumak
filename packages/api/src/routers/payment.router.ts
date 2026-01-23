import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { paymentService } from "../services/payment.service";
import { bankAccountService } from "../services/bank-account.service";

export const paymentRouter = {
  getActiveBankAccount: publicProcedure.handler(async () => {
    return await bankAccountService.getActiveBankAccount();
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
