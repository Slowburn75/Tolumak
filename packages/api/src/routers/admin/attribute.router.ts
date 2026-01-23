import { z } from "zod";
import { adminProcedure } from "../../index";
import { attributeService } from "../../services/admin/attribute.service";

const createAttributeSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z_]+$/, "Name must be lowercase with underscores only"),
  displayName: z.string().min(1).max(100),
  values: z.array(z.string().max(50)).optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

const updateAttributeSchema = createAttributeSchema.partial();

export const attributeRouter = {
  list: adminProcedure
    .input(z.object({ isActive: z.boolean().optional() }).optional())
    .handler(async ({ input }) => {
      return await attributeService.listAttributes(input);
    }),

  getById: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await attributeService.getAttributeById(input.id);
  }),

  create: adminProcedure.input(createAttributeSchema).handler(async ({ input }) => {
    return await attributeService.createAttribute(input);
  }),

  update: adminProcedure
    .input(z.object({ id: z.string() }).merge(updateAttributeSchema))
    .handler(async ({ input }) => {
      const { id, ...data } = input;
      return await attributeService.updateAttribute(id, data);
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await attributeService.deleteAttribute(input.id);
  }),

  addValues: adminProcedure
    .input(
      z.object({
        id: z.string(),
        values: z.array(z.string().min(1).max(50)).min(1),
      }),
    )
    .handler(async ({ input }) => {
      return await attributeService.addValues(input.id, input.values);
    }),

  removeValues: adminProcedure
    .input(
      z.object({
        id: z.string(),
        values: z.array(z.string()).min(1),
      }),
    )
    .handler(async ({ input }) => {
      return await attributeService.removeValues(input.id, input.values);
    }),

  getUsage: adminProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    return await attributeService.getAttributeUsage(input.id);
  }),
};
