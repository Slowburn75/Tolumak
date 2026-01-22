import prisma from "@Tolumak/db";
import { productService } from "./product.service";
import { bankAccountService } from "./bank-account.service";

export class PaymentService {
    async createPayment(data: {
        orderId: string;
        method: "COD" | "BANK_TRANSFER";
        userId: string;
    }) {
        const order = await prisma.order.findUnique({
            where: { id: data.orderId },
            include: { items: true },
        });

        if (!order) throw new Error("Order not found");
        if (order.userId !== data.userId) throw new Error("Unauthorized");

        const payment = await prisma.$transaction(async (tx) => {
            const newPayment = await tx.payment.create({
                data: {
                    orderId: data.orderId,
                    amount: order.total,
                    method: data.method,
                    status: data.method === "COD" ? "CONFIRMED" : "PENDING",
                },
            });

            if (data.method === "COD") {
                // Reduce stock immediately for COD
                for (const item of order.items) {
                    await productService.reduceStock(item.productId, item.quantity, tx);
                }

                // Update order status
                await tx.order.update({
                    where: { id: data.orderId },
                    data: { status: "CONFIRMED" },
                });
            }

            return newPayment;
        });

        const activeBank = data.method === "BANK_TRANSFER"
            ? await bankAccountService.getActiveBankAccount()
            : null;

        return {
            payment,
            bankAccount: activeBank,
        };
    }

    async uploadPaymentProof(data: {
        paymentId: string;
        proofImageUrl: string;
        userId: string;
    }) {
        const payment = await prisma.payment.findUnique({
            where: { id: data.paymentId },
            include: { order: true },
        });

        if (!payment) throw new Error("Payment not found");
        if (payment.order.userId !== data.userId) throw new Error("Unauthorized");
        if (payment.status === "CONFIRMED") throw new Error("Payment already confirmed");

        return await prisma.payment.update({
            where: { id: data.paymentId },
            data: {
                proofImageUrl: data.proofImageUrl,
                status: "AWAITING_CONFIRMATION",
            },
        });
    }

    async confirmPayment(paymentId: string, adminId: string) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: { include: { items: true } } },
        });

        if (!payment) throw new Error("Payment not found");
        if (payment.status === "CONFIRMED") throw new Error("Payment already confirmed");

        return await prisma.$transaction(async (tx) => {
            // 1. Confirm payment
            const confirmedPayment = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: "CONFIRMED",
                    confirmedBy: adminId,
                    confirmedAt: new Date(),
                },
            });

            // 2. Reduce stock
            for (const item of payment.order.items) {
                await productService.reduceStock(item.productId, item.quantity, tx);
            }

            // 3. Update order status
            await tx.order.update({
                where: { id: payment.orderId },
                data: { status: "CONFIRMED" },
            });

            return confirmedPayment;
        });
    }

    async rejectPayment(paymentId: string, adminId: string, reason: string) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment) throw new Error("Payment not found");
        if (payment.status === "CONFIRMED") throw new Error("Cannot reject confirmed payment");

        return await prisma.$transaction(async (tx) => {
            const rejectedPayment = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: "REJECTED",
                    rejectionReason: reason,
                },
            });

            await tx.order.update({
                where: { id: payment.orderId },
                data: { status: "CANCELLED" },
            });

            return rejectedPayment;
        });
    }

    async listPendingPayments() {
        return await prisma.payment.findMany({
            where: { status: "AWAITING_CONFIRMATION" },
            include: { order: true, admin: true },
            orderBy: { createdAt: "asc" },
        });
    }

    async listUserPayments(userId: string) {
        return await prisma.payment.findMany({
            where: { order: { userId } },
            include: { order: true },
            orderBy: { createdAt: "desc" },
        });
    }
}

export const paymentService = new PaymentService();
