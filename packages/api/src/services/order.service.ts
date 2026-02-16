import prisma from "@Tolumak/db";
import type { Prisma } from "@Tolumak/db/prisma/generated";
import { OrderStatus } from "@Tolumak/db/prisma/generated";

export class OrderService {
  async createOrder(data: {
    userId: string;
    items: { productId: string; variantId?: string; quantity: number }[];
    shippingAddress?: string;
    paymentMethod: "COD" | "BANK_TRANSFER";
    couponCode?: string;
  }) {
    // 1. Fetch products
    // 1. Fetch products with variants
    const products = await prisma.product.findMany({
      where: {
        id: { in: data.items.map((i) => i.productId) },
      },
      include: {
        variants: true,
      },
    });

    if (products.length === 0 && data.items.length > 0) {
      throw new Error("Products not found");
    }

    // 2. Calculate total and validation
    let subtotal = 0;
    const orderItems: Prisma.OrderItemCreateManyOrderInput[] = [];

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      let price = product.price;
      let stock = product.stock;

      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) throw new Error(`Variant not found for product: ${product.name}`);
        price = variant.price;
        stock = variant.stock;
      }

      if (stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name} ${item.variantId ? '(Variant)' : ''}`);
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: price,
      });
    }

    // 3. Handle Coupon
    let discountAmount = 0;
    let couponId: string | undefined;

    if (data.couponCode) {
      // Dynamically import to avoid circular dependency if possible, or iterate
      // Here we assume couponService is available. 
      // We can just query directly or use the service if imported.
      // Ill use direct Prisma for simplicity/robustness within transaction later, 
      // but for validation need logic. I will Import couponService at top level.
      const { couponService } = await import("../services/admin/coupon.service");
      const validation = await couponService.validateCoupon(data.couponCode, data.userId, subtotal);

      if (!validation.isValid) {
        throw new Error(`Invalid coupon: ${validation.message}`);
      }
      discountAmount = validation.discountAmount || 0;
      couponId = validation.coupon?.id;
    }

    const total = Math.max(0, subtotal - discountAmount);

    // 4. Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: data.userId,
          total,
          subtotal,
          discountAmount,
          status: OrderStatus.PENDING_PAYMENT,
          shippingAddress: data.shippingAddress, // JSON string matches schema? Schema is String? Line 9 said string.
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Create Payment
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: total,
          method: data.paymentMethod,
          status: "PENDING", // Initial status
        }
      });

      // Update coupon usage
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            couponId,
            userId: data.userId,
            orderId: newOrder.id,
            discountAmount,
          }
        });
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } }
        });
      }

      // Update stock
      // We use the productService to ensure consistent logic and error handling
      // Note: We need to import productService. Since we are inside a method, 
      // we can import it at top level if no circular dependency, or dynamically.
      // Given the file structure, static import should be fine as product.service doesn't import order.service.
      const { productService } = await import("../services/product.service");

      for (const item of data.items) {
        await productService.reduceStock(item.productId, item.quantity, item.variantId, tx);
      }

      return newOrder;
    });

    return order;
  }

  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  async listUserOrders(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    return await prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}

export const orderService = new OrderService();
