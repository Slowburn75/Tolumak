import prisma from "@Tolumak/db";

export class MetricService {
  async recordMetric(type: string, value: number, metadata?: any) {
    return await prisma.systemMetric.create({
      data: {
        metricType: type as any,
        value,
        metadata,
      },
    });
  }

  async getDailyMetrics(type: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.systemMetric.findMany({
      where: {
        metricType: type as any,
        recordedAt: {
          gte: startDate,
        },
      },
      orderBy: {
        recordedAt: "asc",
      },
    });
  }

  async generateDailyMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [revenue, orders, signups] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: "CONFIRMED",
          confirmedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: { amount: true },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    const metrics = [];

    if (revenue._sum.amount) {
      metrics.push(await this.recordMetric("DAILY_REVENUE", revenue._sum.amount));
    }

    metrics.push(
      await this.recordMetric("DAILY_ORDERS", orders),
      await this.recordMetric("DAILY_SIGNUPS", signups),
    );

    return metrics.length;
  }

  async getMetricsSummary(period: "7d" | "30d" | "90d") {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [revenue, orders, signups] = await Promise.all([
      prisma.systemMetric.aggregate({
        where: {
          metricType: "DAILY_REVENUE",
          recordedAt: { gte: startDate },
        },
        _sum: { value: true },
        _avg: { value: true },
      }),
      prisma.systemMetric.aggregate({
        where: {
          metricType: "DAILY_ORDERS",
          recordedAt: { gte: startDate },
        },
        _sum: { value: true },
        _avg: { value: true },
      }),
      prisma.systemMetric.aggregate({
        where: {
          metricType: "DAILY_SIGNUPS",
          recordedAt: { gte: startDate },
        },
        _sum: { value: true },
      }),
    ]);

    return {
      period,
      days,
      totalRevenue: revenue._sum.value?.toNumber() || 0,
      averageDailyRevenue: revenue._avg.value?.toNumber() || 0,
      totalOrders: orders._sum.value?.toNumber() || 0,
      averageDailyOrders: orders._avg.value?.toNumber() || 0,
      totalSignups: signups._sum.value?.toNumber() || 0,
    };
  }
}

export const metricService = new MetricService();
