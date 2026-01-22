import prisma from "@Tolumak/db";
import type { Prisma } from "@Tolumak/db/prisma/generated";

export class OrderService {
    async createOrder(data: {
        userId: string;
        items: { productId: string; quantity: number }[];
        shippingAddress?: string;
    }) {
        // 1. Fetch products to get current prices
        const products = await prisma.product.findMany({
            where: {
                id: { in: data.items.map((i) => i.productId) },
            },
        });

        if (products.length !== data.items.length) {
            throw new Error("One or more products not found");
        }

        // 2. Calculate total and prepare order items
        let total = 0;
        const orderItems: Prisma.OrderItemCreateManyOrderInput[] = [];

        for (const item of data.items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product) continue;

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }

            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
            });
        }

        // 3. Create order in a transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create the order
            const newOrder = await tx.order.create({
                data: {
                    userId: data.userId,
                    total,
                    status: "PENDING",
                    shippingAddress: data.shippingAddress,
                    items: {
                        create: orderItems,
                    },
                },
                include: {
                    items: true,
                },
            });

            // Update stock for each product
            for (const item of data.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
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

    async updateOrderStatus(id: string, status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED") {
        return await prisma.order.update({
            where: { id },
            data: { status },
        });
    }
}

export const orderService = new OrderService();
