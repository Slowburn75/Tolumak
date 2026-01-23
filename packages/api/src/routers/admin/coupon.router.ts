import { z } from "zod";
import { adminProcedure } from "../../index";
import { couponService } from "../../services/admin/coupon.service";

const createCouponSchema = z
  .object({
    code: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric"),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.number().positive().int(),
    minOrderAmount: z.number().positive().int().optional(),
    maxDiscount: z.number().positive().int().optional(),
    usageLimit: z.number().positive().int().optional(),
    perUserLimit: z.number().positive().int().optional(),
    validFrom: z
      .string()
      .datetime()
      .transform((str) => new Date(str)),
    validUntil: z
      .string()
      .datetime()
      .transform((str) => new Date(str)),
    isActive: z.boolean().optional().default(true),
    description: z.string().max(200).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "PERCENTAGE" && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage value cannot exceed 100",
      path: ["value"],
    },
  );

const updateCouponSchema = z.object({
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional(),
  value: z.number().positive().int().optional(),
  minOrderAmount: z.number().positive().int().optional(),
  maxDiscount: z.number().positive().int().optional(),
  usageLimit: z.number().positive().int().optional(),
  perUserLimit: z.number().positive().int().optional(),
  validFrom: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
  validUntil: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(200).optional(),
});

const validateCouponSchema = z.object({
  code: z.string(),
  orderSubtotal: z.number().positive().int(),
});

export const couponRouter = {
  list: adminProcedure
    .input(
      z
        .object({
          status: z.enum(["active", "expired", "upcoming", "all"]).optional(),
          search: z.string().optional(),
          page: z.number().int().positive().default(1),
          limit: z.number().int().positive().max(100).default(20),
        })
        .optional(),
    )
    .handler(async ({ input }) => {
      return await couponService.listCoupons(input);
    }),

  getById: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await couponService.getCouponById(input.id);
  }),

  getByCode: adminProcedure.input(z.object({ code: z.string() })).handler(async ({ input }) => {
    return await couponService.getCouponByCode(input.code);
  }),

  create: adminProcedure.input(createCouponSchema).handler(async ({ input }) => {
    return await couponService.createCoupon(input);
  }),

  update: adminProcedure
    .input(z.object({ id: z.string() }).merge(updateCouponSchema))
    .handler(async ({ input }) => {
      const { id, ...data } = input;
      return await couponService.updateCoupon(id, data);
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await couponService.deleteCoupon(input.id);
  }),

  validateCoupon: adminProcedure.input(validateCouponSchema).handler(async ({ input, context }) => {
    return await couponService.validateCoupon(input.code, context.user.id, input.orderSubtotal);
  }),

  getStats: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await couponService.getCouponStats(input.id);
  }),

  deactivate: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await couponService.updateCoupon(input.id, { isActive: false });
  }),

  activate: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await couponService.updateCoupon(input.id, { isActive: true });
  }),
};
