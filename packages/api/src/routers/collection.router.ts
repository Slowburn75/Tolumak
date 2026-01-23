import { z } from "zod";
import { publicProcedure } from "../index";
import { collectionService } from "../services/collection.service";

export const collectionRouter = {
  list: publicProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .handler(async ({ input }) => {
      return await collectionService.listCollections(input?.limit);
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).handler(async ({ input }) => {
    return await collectionService.getCollectionBySlug(input.slug);
  }),
};
