import { z } from "zod";
import { adminProcedure } from "../../index";
import { adminCategoryService } from "../../services/admin/category.service";

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = createCategorySchema.partial().extend({
  sortOrder: z.number().optional(),
});

export const categoryRouter = {
  list: adminProcedure.handler(async () => {
    return await adminCategoryService.listCategories();
  }),

  getById: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await adminCategoryService.getCategoryById(input.id);
  }),

  create: adminProcedure.input(createCategorySchema).handler(async ({ input }) => {
    return await adminCategoryService.createCategory(input);
  }),

  update: adminProcedure
    .input(z.object({ id: z.string() }).merge(updateCategorySchema))
    .handler(async ({ input }) => {
      const { id, ...data } = input;
      return await adminCategoryService.updateCategory(id, data);
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await adminCategoryService.deleteCategory(input.id);
  }),
};
