import { z } from "zod";
import { adminProcedure } from "../index";
import { paymentService } from "../services/payment.service";
import { bankAccountService } from "../services/bank-account.service";

export const adminPaymentRouter = {
  // Payment Management
  listPendingPayments: adminProcedure.handler(async () => {
    return await paymentService.listPendingPayments();
  }),

  confirmPayment: adminProcedure.input(z.string()).handler(async ({ input, context }) => {
    return await paymentService.confirmPayment(input, context.user.id);
  }),

  rejectPayment: adminProcedure
    .input(
      z.object({
        paymentId: z.string(),
        reason: z.string().min(1),
      }),
    )
    .handler(async ({ input, context }) => {
      return await paymentService.rejectPayment(input.paymentId, context.user.id, input.reason);
    }),

  // Bank Account Management
  listBankAccounts: adminProcedure.handler(async () => {
    return await bankAccountService.listBankAccounts();
  }),

  createBankAccount: adminProcedure
    .input(
      z.object({
        bankName: z.string().min(1),
        accountNumber: z.string().min(1),
        accountName: z.string().min(1),
      }),
    )
    .handler(async ({ input }) => {
      return await bankAccountService.createBankAccount(input);
    }),

  updateBankAccount: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          bankName: z.string().optional(),
          accountNumber: z.string().optional(),
          accountName: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      }),
    )
    .handler(async ({ input }) => {
      return await bankAccountService.updateBankAccount(input.id, input.data);
    }),

  deleteBankAccount: adminProcedure.input(z.string()).handler(async ({ input }) => {
    return await bankAccountService.deleteBankAccount(input);
  }),
};
