import prisma from "@Tolumak/db";
import { calculateDiscount, validateCouponCode } from "../../utils/helpers";
import type { Prisma } from "@Tolumak/db/prisma/generated";

export class CouponService {
  async listCoupons(params?: {
    status?: "active" | "expired" | "upcoming" | "all";
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.CouponWhereInput = {};
    const now = new Date();

    // Status filter
    if (params?.status && params.status !== "all") {
      switch (params.status) {
        case "active":
          where.isActive = true;
          where.validFrom = { lte: now };
          where.validUntil = { gte: now };
          break;
        case "expired":
          where.validUntil = { lt: now };
          break;
        case "upcoming":
          where.validFrom = { gt: now };
          break;
      }
    }

    // Search filter
    if (params?.search) {
      where.OR = [
        { code: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    return {
      coupons,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCouponById(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            order: {
              select: {
                id: true,
                total: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    const remainingUses = coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : null;

    return {
      ...coupon,
      remainingUses,
    };
  }

  async getCouponByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    return coupon;
  }

  async createCoupon(data: {
    code: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    validFrom: Date;
    validUntil: Date;
    isActive?: boolean;
    description?: string;
  }) {
    // Normalize code
    const normalizedCode = data.code.toUpperCase().trim();

    // Validate code format
    if (!validateCouponCode(normalizedCode)) {
      throw new Error("Invalid coupon code format. Must be 3-20 alphanumeric characters.");
    }

    // Check uniqueness
    const existing = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      throw new Error("Coupon code already exists");
    }

    // Validate date range
    if (data.validFrom >= data.validUntil) {
      throw new Error("Valid from date must be before valid until date");
    }

    // Validate value
    if (data.value <= 0) {
      throw new Error("Value must be greater than 0");
    }

    if (data.type === "PERCENTAGE" && data.value > 100) {
      throw new Error("Percentage value cannot exceed 100");
    }

    return await prisma.coupon.create({
      data: {
        code: normalizedCode,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        isActive: data.isActive ?? true,
        description: data.description,
      },
    });
  }

  async updateCoupon(
    id: string,
    data: Partial<{
      type: "PERCENTAGE" | "FIXED_AMOUNT";
      value: number;
      minOrderAmount: number;
      maxDiscount: number;
      usageLimit: number;
      perUserLimit: number;
      validFrom: Date;
      validUntil: Date;
      isActive: boolean;
      description: string;
    }>,
  ) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    // Cannot update if coupon has been used (except isActive toggle)
    if (coupon.usageCount > 0) {
      const allowedFields = ["isActive"];
      const attemptedFields = Object.keys(data);
      const disallowedFields = attemptedFields.filter((f) => !allowedFields.includes(f));

      if (disallowedFields.length > 0) {
        throw new Error("Cannot update coupon that has been used. Only isActive can be toggled.");
      }
    }

    // Validate date range if dates changed
    const validFrom = data.validFrom || coupon.validFrom;
    const validUntil = data.validUntil || coupon.validUntil;

    if (validFrom >= validUntil) {
      throw new Error("Valid from date must be before valid until date");
    }

    // Validate value if changed
    if (data.value !== undefined) {
      if (data.value <= 0) {
        throw new Error("Value must be greater than 0");
      }

      const type = data.type || coupon.type;
      if (type === "PERCENTAGE" && data.value > 100) {
        throw new Error("Percentage value cannot exceed 100");
      }
    }

    return await prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async deleteCoupon(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    // Soft delete: set isActive to false
    await prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });

    return true;
  }

  async validateCoupon(code: string, userId: string, orderSubtotal: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        message: "Coupon not found",
      };
    }

    // Check if active
    if (!coupon.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        message: "Coupon is not active",
      };
    }

    // Check date validity
    const now = new Date();
    if (now < coupon.validFrom) {
      return {
        isValid: false,
        discountAmount: 0,
        message: "Coupon is not yet valid",
      };
    }

    if (now > coupon.validUntil) {
      return {
        isValid: false,
        discountAmount: 0,
        message: "Coupon has expired",
      };
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderSubtotal < coupon.minOrderAmount) {
      return {
        isValid: false,
        discountAmount: 0,
        message: `Minimum order amount of ${coupon.minOrderAmount / 100} required`,
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        message: "Coupon usage limit reached",
      };
    }

    // Check per-user limit
    if (coupon.perUserLimit) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId,
        },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        return {
          isValid: false,
          discountAmount: 0,
          message: "You have reached the usage limit for this coupon",
        };
      }
    }

    // Calculate discount
    const discountAmount = calculateDiscount(
      coupon.type,
      coupon.value,
      orderSubtotal,
      coupon.maxDiscount ?? undefined,
    );

    return {
      isValid: true,
      discountAmount,
      coupon,
    };
  }

  async applyCoupon(couponId: string, userId: string, orderId: string, discountAmount: number) {
    return await prisma.$transaction(async (tx) => {
      // Create usage record
      const usage = await tx.couponUsage.create({
        data: {
          couponId,
          userId,
          orderId,
          discountAmount,
        },
      });

      // Increment usage count
      await tx.coupon.update({
        where: { id: couponId },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });

      return usage;
    });
  }

  async getCouponStats(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    const totalUses = coupon.usages.length;
    const uniqueUsers = new Set(coupon.usages.map((u) => u.userId)).size;
    const totalDiscount = coupon.usages.reduce((sum, u) => sum + u.discountAmount, 0);
    const averageDiscount = totalUses > 0 ? totalDiscount / totalUses : 0;

    // Top users
    const userUsageMap = new Map<string, { user: any; count: number; totalDiscount: number }>();

    coupon.usages.forEach((usage) => {
      const existing = userUsageMap.get(usage.userId);
      if (existing) {
        existing.count++;
        existing.totalDiscount += usage.discountAmount;
      } else {
        userUsageMap.set(usage.userId, {
          user: usage.user,
          count: 1,
          totalDiscount: usage.discountAmount,
        });
      }
    });

    const topUsers = Array.from(userUsageMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalUses,
      uniqueUsers,
      totalDiscount,
      averageDiscount: Math.floor(averageDiscount),
      topUsers,
    };
  }
}

export const couponService = new CouponService();
