import { z } from "zod";
import { publicProcedure } from "../index";
import { categoryService } from "../services/category.service";

export const categoryRouter = {
  list: publicProcedure.handler(async () => {
    return await categoryService.listCategories();
  }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).handler(async ({ input }) => {
    return await categoryService.getCategoryBySlug(input.slug);
  }),
};
