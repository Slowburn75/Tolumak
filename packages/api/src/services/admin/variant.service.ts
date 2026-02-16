import prisma from "@Tolumak/db";

export class VariantService {
    async getProductVariants(productId: string) {
        return await prisma.productVariant.findMany({
            where: { productId },
            orderBy: { sortOrder: "asc" },
        });
    }

    async getVariantById(id: string) {
        const variant = await prisma.productVariant.findUnique({
            where: { id },
        });

        if (!variant) {
            throw new Error("Variant not found");
        }

        return variant;
    }

    async createVariant(data: {
        productId: string;
        sku: string;
        size: string;
        color?: string;
        price: number;
        compareAtPrice?: number;
        stock?: number;
        isActive?: boolean;
        sortOrder?: number;
    }) {
        // Check SKU uniqueness
        const existing = await prisma.productVariant.findUnique({
            where: { sku: data.sku },
        });

        if (existing) {
            throw new Error("SKU already exists");
        }

        // Validate product exists
        const product = await prisma.product.findUnique({
            where: { id: data.productId },
        });

        if (!product) {
            throw new Error("Product not found");
        }

        return await prisma.productVariant.create({
            data: {
                productId: data.productId,
                sku: data.sku,
                size: data.size,
                color: data.color,
                price: data.price,
                compareAtPrice: data.compareAtPrice,
                stock: data.stock ?? 0,
                isActive: data.isActive ?? true,
                sortOrder: data.sortOrder ?? 0,
            },
        });
    }

    async bulkCreateVariants(
        productId: string,
        variants: Array<{
            sku: string;
            size: string;
            color?: string;
            price: number;
            compareAtPrice?: number;
            stock?: number;
            isActive?: boolean;
            sortOrder?: number;
        }>
    ) {
        // Validate product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new Error("Product not found");
        }

        // Check all SKUs are unique
        const skus = variants.map((v) => v.sku);
        const existingSkus = await prisma.productVariant.findMany({
            where: { sku: { in: skus } },
            select: { sku: true },
        });

        if (existingSkus.length > 0) {
            throw new Error(`SKUs already exist: ${existingSkus.map((s) => s.sku).join(", ")}`);
        }

        // Create all variants in a transaction
        return await prisma.$transaction(
            variants.map((variant, index) =>
                prisma.productVariant.create({
                    data: {
                        productId,
                        sku: variant.sku,
                        size: variant.size,
                        color: variant.color,
                        price: variant.price,
                        compareAtPrice: variant.compareAtPrice,
                        stock: variant.stock ?? 0,
                        isActive: variant.isActive ?? true,
                        sortOrder: variant.sortOrder ?? index,
                    },
                })
            )
        );
    }

    async updateVariant(
        id: string,
        data: Partial<{
            sku: string;
            size: string;
            color: string;
            price: number;
            compareAtPrice: number;
            stock: number;
            isActive: boolean;
            sortOrder: number;
        }>
    ) {
        const variant = await prisma.productVariant.findUnique({
            where: { id },
        });

        if (!variant) {
            throw new Error("Variant not found");
        }

        // Check SKU uniqueness if changed
        if (data.sku && data.sku !== variant.sku) {
            const existing = await prisma.productVariant.findUnique({
                where: { sku: data.sku },
            });

            if (existing) {
                throw new Error("SKU already exists");
            }
        }

        return await prisma.productVariant.update({
            where: { id },
            data,
        });
    }

    async deleteVariant(id: string) {
        const variant = await prisma.productVariant.findUnique({
            where: { id },
        });

        if (!variant) {
            throw new Error("Variant not found");
        }

        await prisma.productVariant.delete({
            where: { id },
        });

        return true;
    }

    async updateVariantStock(id: string, quantity: number, operation: "SET" | "ADD" | "SUBTRACT") {
        const variant = await prisma.productVariant.findUnique({
            where: { id },
            select: { stock: true },
        });

        if (!variant) {
            throw new Error("Variant not found");
        }

        let newStock: number;

        switch (operation) {
            case "SET":
                newStock = quantity;
                break;
            case "ADD":
                newStock = variant.stock + quantity;
                break;
            case "SUBTRACT":
                newStock = variant.stock - quantity;
                if (newStock < 0) {
                    throw new Error("Insufficient stock");
                }
                break;
        }

        return await prisma.productVariant.update({
            where: { id },
            data: { stock: newStock },
        });
    }

    async getTotalVariantStock(productId: string) {
        const result = await prisma.productVariant.aggregate({
            where: { productId, isActive: true },
            _sum: { stock: true },
        });

        return result._sum.stock ?? 0;
    }
}

export const variantService = new VariantService();
