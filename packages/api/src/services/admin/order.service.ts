import prisma from "@Tolumak/db";
import type { Prisma } from "@Tolumak/db/prisma/generated";

export class AdminOrderService {
  async listOrders(params: {
    status?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { status, customerId, dateFrom, dateTo, search, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status as any;
    }

    if (customerId) {
      where.userId = customerId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          payment: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        statusHistory: {
          include: {
            admin: {
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
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  async updateOrderStatus(
    id: string,
    status:
      | "PENDING_PAYMENT"
      | "CONFIRMED"
      | "PROCESSING"
      | "SHIPPED"
      | "DELIVERED"
      | "CANCELLED"
      | "REFUNDED",
    adminId: string,
    notes?: string,
  ) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return await prisma.$transaction(async (tx) => {
      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          changedBy: adminId,
          notes,
        },
      });

      // If cancelling or refunding, restore product stock
      if (
        (status === "CANCELLED" || status === "REFUNDED") &&
        order.status !== "CANCELLED" &&
        order.status !== "REFUNDED"
      ) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Update order status
      return await tx.order.update({
        where: { id },
        data: { status },
      });
    });
  }

  async addTrackingNumber(id: string, trackingNumber: string, adminId: string) {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return await prisma.$transaction(async (tx) => {
      // Update tracking number
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          trackingNumber,
          status:
            order.status === "CONFIRMED" || order.status === "PROCESSING"
              ? "SHIPPED"
              : order.status,
        },
      });

      // Create status history if status changed
      if (updatedOrder.status === "SHIPPED" && order.status !== "SHIPPED") {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: "SHIPPED",
            changedBy: adminId,
            notes: `Tracking number added: ${trackingNumber}`,
          },
        });
      }

      return updatedOrder;
    });
  }

  async addAdminNotes(id: string, notes: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { adminNotes: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const timestamp = new Date().toISOString();
    const newNotes = order.adminNotes
      ? `${order.adminNotes}\n\n[${timestamp}] ${notes}`
      : `[${timestamp}] ${notes}`;

    return await prisma.order.update({
      where: { id },
      data: { adminNotes: newNotes },
    });
  }

  async getOrderStats(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      subtotal,
      discountAmount: order.discountAmount,
      shippingFee: order.shippingFee,
      total: order.total,
    };
  }
}

export const adminOrderService = new AdminOrderService();
