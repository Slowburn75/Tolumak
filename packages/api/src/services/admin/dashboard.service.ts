import prisma from "@Tolumak/db";

export class DashboardService {
  async getOverview() {
    const [totalRevenue, orderCounts, totalCustomers, totalProducts, lowStockCount] =
      await Promise.all([
        // Total revenue from confirmed payments
        prisma.payment.aggregate({
          where: { status: "CONFIRMED" },
          _sum: { amount: true },
        }),

        // Order counts by status
        prisma.order.groupBy({
          by: ["status"],
          _count: true,
        }),

        // Total customers (users with role USER who have orders)
        prisma.user.count({
          where: {
            role: "USER",
            orders: { some: {} },
          },
        }),

        // Total active products
        prisma.product.count({
          where: { status: "ACTIVE" },
        }),

        // Low stock count
        prisma.product.count({
          where: {
            status: "ACTIVE",
            stock: { lt: 5 },
          },
        }),
      ]);

    const ordersByStatus = orderCounts.reduce(
      (acc, item) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalOrders: ordersByStatus,
      totalCustomers,
      totalProducts,
      lowStockCount,
    };
  }

  async getRecentOrders(limit: number = 10) {
    return await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: {
          select: {
            status: true,
          },
        },
      },
    });
  }

  async getTopProducts(limit: number = 5) {
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit,
    });

    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
      },
    });

    return topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        ...product,
        totalQuantitySold: item._sum.quantity || 0,
        totalRevenue: item._sum.price || 0,
      };
    });
  }

  async getSalesChart(period: "7d" | "30d" | "12m") {
    const now = new Date();
    let startDate: Date;
    let groupBy: "day" | "month";

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "12m":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = "month";
        break;
    }

    const payments = await prisma.payment.findMany({
      where: {
        status: "CONFIRMED",
        confirmedAt: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        confirmedAt: true,
      },
    });

    const salesByDate = new Map<string, number>();

    payments.forEach((payment) => {
      if (!payment.confirmedAt) return;

      const date =
        groupBy === "day"
          ? payment.confirmedAt.toISOString().split("T")[0]
          : `${payment.confirmedAt.getFullYear()}-${String(payment.confirmedAt.getMonth() + 1).padStart(2, "0")}`;

      salesByDate.set(date, (salesByDate.get(date) || 0) + payment.amount);
    });

    return Array.from(salesByDate.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const dashboardService = new DashboardService();
