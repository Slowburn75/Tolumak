import prisma from "@Tolumak/db";
import type { Prisma } from "@Tolumak/db/prisma/generated";

export class ActivityLogService {
  async logActivity(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await prisma.activityLog.create({
      data: data as any,
    });
  }

  async getActivityLogs(params: {
    userId?: string;
    action?: string;
    entity?: string;
    entityId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    limit: number;
  }) {
    const where: Prisma.ActivityLogWhereInput = {};

    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action as any;
    if (params.entity) where.entity = params.entity;
    if (params.entityId) where.entityId = params.entityId;

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = params.dateFrom;
      if (params.dateTo) where.createdAt.lte = params.dateTo;
    }

    const skip = (params.page - 1) * params.limit;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async getEntityHistory(entity: string, entityId: string) {
    return await prisma.activityLog.findMany({
      where: {
        entity,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async cleanupOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        action: {
          notIn: ["LOGIN", "PAYMENT_CONFIRM", "PAYMENT_REJECT"],
        },
      },
    });

    return result.count;
  }
}

export const activityLogService = new ActivityLogService();
