import { z } from "zod";
import { adminProcedure, publicProcedure } from "../index";
import { productService } from "../services/product.service";

export const productRouter = {
  listProducts: publicProcedure
    .input(
      z
        .object({
          categoryId: z.string().optional(),
          collectionId: z.string().optional(),
          isPublished: z.boolean().optional().default(true),
          search: z.string().optional(),
          sort: z.enum(["price_asc", "price_desc", "newest"]).optional(),
          page: z.number().int().positive().default(1),
          limit: z.number().int().positive().default(20),
        })
        .optional(),
    )
    .handler(async ({ input }) => {
      return await productService.listProducts(input);
    }),

  getProductById: publicProcedure.input(z.string()).handler(async ({ input }) => {
    return await productService.getProductById(input);
  }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).handler(async ({ input }) => {
    return await productService.getProductBySlug(input.slug);
  }),

  createProduct: adminProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        images: z.array(z.string()),
        price: z.number().int(),
        stock: z.number().int(),
        categoryId: z.string(),
        status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional().default("DRAFT"),
      }),
    )
    .handler(async ({ input }) => {
      return await productService.createProduct(input);
    }),

  updateProduct: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          images: z.array(z.string()).optional(),
          price: z.number().int().optional(),
          stock: z.number().int().optional(),
          categoryId: z.string().optional(),
          status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
        }),
      }),
    )
    .handler(async ({ input }) => {
      return await productService.updateProduct(input.id, input.data);
    }),
};
