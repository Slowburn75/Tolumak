import { z } from "zod";
import { adminProcedure } from "../../index";
import { collectionService } from "../../services/admin/collection.service";

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

const updateCollectionSchema = createCollectionSchema.partial();

export const collectionRouter = {
  list: adminProcedure
    .input(
      z
        .object({
          isActive: z.boolean().optional(),
          page: z.number().int().positive().optional(),
          limit: z.number().int().positive().max(100).optional(),
        })
        .optional(),
    )
    .handler(async ({ input }) => {
      return await collectionService.listCollections(input);
    }),

  getById: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await collectionService.getCollectionById(input.id);
  }),

  create: adminProcedure.input(createCollectionSchema).handler(async ({ input }) => {
    return await collectionService.createCollection(input);
  }),

  update: adminProcedure
    .input(z.object({ id: z.string() }).merge(updateCollectionSchema))
    .handler(async ({ input }) => {
      const { id, ...data } = input;
      return await collectionService.updateCollection(id, data);
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await collectionService.deleteCollection(input.id);
  }),

  addProducts: adminProcedure
    .input(
      z.object({
        collectionId: z.string(),
        productIds: z.array(z.string()).min(1),
      }),
    )
    .handler(async ({ input }) => {
      return await collectionService.addProducts(input.collectionId, input.productIds);
    }),

  removeProducts: adminProcedure
    .input(
      z.object({
        collectionId: z.string(),
        productIds: z.array(z.string()).min(1),
      }),
    )
    .handler(async ({ input }) => {
      return await collectionService.removeProducts(input.collectionId, input.productIds);
    }),

  getProducts: adminProcedure
    .input(
      z.object({
        collectionId: z.string(),
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().max(100).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { collectionId, ...params } = input;
      return await collectionService.getCollectionProducts(collectionId, params);
    }),
};
