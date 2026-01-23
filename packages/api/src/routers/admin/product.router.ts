import { z } from "zod";
import { adminProcedure } from "../../index";
import { adminProductService } from "../../services/admin/product.service";

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().nonnegative(),
  sku: z.string(),
  categoryId: z.string(),
  images: z.array(z.string()).optional(),
  weight: z.number().optional(),
  attributes: z.record(z.string(), z.any()).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});

const updateProductSchema = createProductSchema.partial();

export const productRouter = {
  list: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        categoryId: z.string().optional(),
        status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .handler(async ({ input }) => {
      return await adminProductService.listProducts(input);
    }),

  getById: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await adminProductService.getProductById(input.id);
  }),

  create: adminProcedure.input(createProductSchema).handler(async ({ input }) => {
    return await adminProductService.createProduct(input);
  }),

  update: adminProcedure
    .input(z.object({ id: z.string() }).merge(updateProductSchema))
    .handler(async ({ input }) => {
      const { id, ...data } = input;
      return await adminProductService.updateProduct(id, data);
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await adminProductService.deleteProduct(input.id);
  }),

  updateStock: adminProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number(),
        operation: z.enum(["SET", "ADD", "SUBTRACT"]),
      }),
    )
    .handler(async ({ input }) => {
      return await adminProductService.updateStock(input.id, input.quantity, input.operation);
    }),

  getLowStock: adminProcedure
    .input(z.object({ threshold: z.number().default(5) }).optional())
    .handler(async ({ input }) => {
      return await adminProductService.getLowStockProducts(input?.threshold);
    }),
};
