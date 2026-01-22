import prisma from "@Tolumak/db";
import type { Prisma } from "@Tolumak/db/prisma/generated";

export class ProductService {
    async listProducts(filter?: { categoryId?: string; isPublished?: boolean }) {
        const where: Prisma.ProductWhereInput = {};
        if (filter?.categoryId) {
            where.categoryId = filter.categoryId;
        }
        if (filter?.isPublished !== undefined) {
            where.isPublished = filter.isPublished;
        }

        return await prisma.product.findMany({
            where,
            include: {
                category: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async getProductById(id: string) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });

        if (!product) {
            throw new Error("Product not found");
        }

        return product;
    }

    async createProduct(data: {
        name: string;
        slug: string;
        description: string;
        images: string[];
        price: number;
        stock: number;
        categoryId: string;
        isPublished?: boolean;
    }) {
        const { categoryId, ...rest } = data;
        return await prisma.product.create({
            data: {
                ...rest,
                category: {
                    connect: { id: categoryId },
                },
            },
        });
    }

    async updateProduct(id: string, data: {
        name?: string;
        slug?: string;
        description?: string;
        images?: string[];
        price?: number;
        stock?: number;
        categoryId?: string;
        isPublished?: boolean;
    }) {
        const { categoryId, ...rest } = data;
        return await prisma.product.update({
            where: { id },
            data: {
                ...rest,
                ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
            },
        });
    }

    async deleteProduct(id: string) {
        return await prisma.product.delete({
            where: { id },
        });
    }

    async reduceStock(productId: string, quantity: number, tx?: Prisma.TransactionClient) {
        const client = tx || prisma;
        const product = await client.product.findUnique({
            where: { id: productId },
            select: { stock: true, name: true },
        });

        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        if (product.stock < quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}. Requested: ${quantity}, Available: ${product.stock}`);
        }

        return await client.product.update({
            where: { id: productId },
            data: {
                stock: {
                    decrement: quantity,
                },
            },
        });
    }
}

export const productService = new ProductService();
