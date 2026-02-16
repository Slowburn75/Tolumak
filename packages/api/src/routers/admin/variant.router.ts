import { z } from "zod";
import { adminProcedure } from "../../index";
import { variantService } from "../../services/admin/variant.service";

const createVariantSchema = z.object({
    productId: z.string(),
    sku: z.string().min(1),
    size: z.string().min(1),
    color: z.string().optional(),
    price: z.number().positive().int(),
    compareAtPrice: z.number().positive().int().optional(),
    stock: z.number().nonnegative().int().optional().default(0),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0),
});

const bulkCreateVariantSchema = z.object({
    productId: z.string(),
    variants: z.array(
        z.object({
            sku: z.string().min(1),
            size: z.string().min(1),
            color: z.string().optional(),
            price: z.number().positive().int(),
            compareAtPrice: z.number().positive().int().optional(),
            stock: z.number().nonnegative().int().optional().default(0),
            isActive: z.boolean().optional().default(true),
            sortOrder: z.number().int().optional(),
        })
    ).min(1),
});

const updateVariantSchema = z.object({
    sku: z.string().min(1).optional(),
    size: z.string().min(1).optional(),
    color: z.string().optional(),
    price: z.number().positive().int().optional(),
    compareAtPrice: z.number().positive().int().optional(),
    stock: z.number().nonnegative().int().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
});

export const variantRouter = {
    list: adminProcedure
        .input(z.object({ productId: z.string() }))
        .handler(async ({ input }) => {
            return await variantService.getProductVariants(input.productId);
        }),

    getById: adminProcedure
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            return await variantService.getVariantById(input.id);
        }),

    create: adminProcedure
        .input(createVariantSchema)
        .handler(async ({ input }) => {
            return await variantService.createVariant(input);
        }),

    bulkCreate: adminProcedure
        .input(bulkCreateVariantSchema)
        .handler(async ({ input }) => {
            return await variantService.bulkCreateVariants(input.productId, input.variants);
        }),

    update: adminProcedure
        .input(z.object({ id: z.string() }).merge(updateVariantSchema))
        .handler(async ({ input }) => {
            const { id, ...data } = input;
            return await variantService.updateVariant(id, data);
        }),

    delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            return await variantService.deleteVariant(input.id);
        }),

    updateStock: adminProcedure
        .input(
            z.object({
                id: z.string(),
                quantity: z.number().int(),
                operation: z.enum(["SET", "ADD", "SUBTRACT"]),
            })
        )
        .handler(async ({ input }) => {
            return await variantService.updateVariantStock(input.id, input.quantity, input.operation);
        }),
};
