import prisma from "@Tolumak/db";
import type { Prisma } from "@Tolumak/db/prisma/generated";

export class CustomerService {
  async listCustomers(params: {
    search?: string;
    role?: "USER" | "admin";
    isActive?: boolean;
    emailVerified?: boolean;
    hasOrders?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: "name" | "email" | "createdAt" | "totalSpent" | "orderCount";
    sortOrder?: "asc" | "desc";
    page: number;
    limit: number;
  }) {
    const where: Prisma.UserWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { phone: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.role) {
      where.role = params.role;
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params.emailVerified !== undefined) {
      where.emailVerified = params.emailVerified;
    }

    if (params.hasOrders) {
      where.orders = { some: {} };
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = params.dateFrom;
      if (params.dateTo) where.createdAt.lte = params.dateTo;
    }

    const skip = (params.page - 1) * params.limit;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          _count: {
            select: { orders: true },
          },
          orders: {
            where: { status: "CONFIRMED" },
            select: { total: true, createdAt: true },
          },
        },
        orderBy: this.getSortOrder(params.sortBy, params.sortOrder),
      }),
      prisma.user.count({ where }),
    ]);

    const customersWithStats = customers.map((customer) => {
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
      const lastOrderDate =
        customer.orders.length > 0
          ? customer.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]!
            .createdAt
          : null;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
        isActive: customer.isActive,
        emailVerified: customer.emailVerified,
        createdAt: customer.createdAt,
        orderCount: customer._count.orders,
        totalSpent,
        lastOrderDate,
      };
    });

    return {
      customers: customersWithStats,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  private getSortOrder(sortBy?: string, sortOrder?: string): Prisma.UserOrderByWithRelationInput {
    const order = sortOrder === "asc" ? "asc" : "desc";

    switch (sortBy) {
      case "name":
        return { name: order };
      case "email":
        return { email: order };
      case "createdAt":
      default:
        return { createdAt: order };
    }
  }

  async getCustomerById(id: string) {
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            payment: true,
            items: {
              include: {
                product: {
                  select: { name: true, images: true },
                },
              },
            },
          },
        },
        couponUsages: {
          include: {
            coupon: {
              select: { code: true },
            },
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.role !== "USER") {
      throw new Error("Not a customer account");
    }

    const stats = await this.getCustomerStats(id);

    return {
      ...customer,
      statistics: stats,
    };
  }

  async getCustomerStats(customerId: string) {
    const orders = await prisma.order.findMany({
      where: { userId: customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                categoryId: true,
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const confirmedOrders = orders.filter((o) => o.status === "CONFIRMED");
    const totalSpent = confirmedOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = confirmedOrders.length > 0 ? totalSpent / confirmedOrders.length : 0;

    const orderDates = confirmedOrders
      .map((o) => o.createdAt)
      .sort((a, b) => a.getTime() - b.getTime());
    const firstOrderDate = orderDates[0] || null;
    const lastOrderDate = orderDates[orderDates.length - 1] || null;

    let orderFrequency = 0;
    if (orderDates.length > 1) {
      const daysBetween =
        (lastOrderDate!.getTime() - firstOrderDate!.getTime()) / (1000 * 60 * 60 * 24);
      orderFrequency = daysBetween / (orderDates.length - 1);
    }

    const categoryCount = new Map<string, number>();
    const productCount = new Map<string, { name: string; count: number }>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const catId = item.product.categoryId;
        categoryCount.set(catId, (categoryCount.get(catId) || 0) + 1);

        const existing = productCount.get(item.productId);
        if (existing) {
          existing.count += item.quantity;
        } else {
          productCount.set(item.productId, { name: item.product.name, count: item.quantity });
        }
      });
    });

    const favoriteCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const favoriteProducts = Array.from(productCount.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([id, data]) => ({ id, name: data.name, quantity: data.count }));

    const couponsUsed = await prisma.couponUsage.count({
      where: { userId: customerId },
    });

    const totalSavings = await prisma.couponUsage.aggregate({
      where: { userId: customerId },
      _sum: { discountAmount: true },
    });

    return {
      totalOrders: orders.length,
      totalSpent,
      averageOrderValue: Math.floor(averageOrderValue),
      lifetimeValue: totalSpent,
      orderFrequency: Math.floor(orderFrequency),
      favoriteCategories,
      favoriteProducts,
      lastOrderDate,
      firstOrderDate,
      couponsUsed,
      totalSavings: totalSavings._sum.discountAmount || 0,
    };
  }

  async getCustomerSegments() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const [newCustomers, activeCustomers, inactiveCustomers, atRiskCustomers] = await Promise.all([
      prisma.user.count({
        where: {
          role: "USER",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.user.count({
        where: {
          role: "USER",
          orders: {
            some: {
              createdAt: { gte: ninetyDaysAgo },
            },
          },
        },
      }),
      prisma.user.count({
        where: {
          role: "USER",
          orders: {
            none: {
              createdAt: { gte: oneEightyDaysAgo },
            },
          },
        },
      }),
      prisma.user.count({
        where: {
          role: "USER",
          orders: {
            none: {
              createdAt: { gte: ninetyDaysAgo },
            },
            some: {
              createdAt: { gte: oneEightyDaysAgo },
            },
          },
        },
      }),
    ]);

    return {
      newCustomers,
      activeCustomers,
      inactiveCustomers,
      atRiskCustomers,
    };
  }
}

export const customerService = new CustomerService();
