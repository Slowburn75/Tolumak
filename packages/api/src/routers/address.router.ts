import { z } from "zod";
import { protectedProcedure } from "../index";
import { addressService } from "../services/address.service";

export const addressRouter = {
    list: protectedProcedure.handler(async ({ context }) => {
        return await addressService.listAddresses(context.user.id);
    }),

    create: protectedProcedure
        .input(
            z.object({
                label: z.string().optional().nullable(),
                name: z.string(),
                phone: z.string(),
                address: z.string(),
                city: z.string(),
                state: z.string(),
                postalCode: z.string().optional().nullable(),
                isDefault: z.boolean().optional().default(false),
            })
        )
        .handler(async ({ context, input }) => {
            return await addressService.createAddress(context.user.id, input);
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    label: z.string().optional().nullable(),
                    name: z.string().optional(),
                    phone: z.string().optional(),
                    address: z.string().optional(),
                    city: z.string().optional(),
                    state: z.string().optional(),
                    postalCode: z.string().optional().nullable(),
                    isDefault: z.boolean().optional(),
                }),
            })
        )
        .handler(async ({ context, input }) => {
            return await addressService.updateAddress(context.user.id, input.id, input.data);
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .handler(async ({ context, input }) => {
            return await addressService.deleteAddress(context.user.id, input.id);
        }),

    setDefault: protectedProcedure
        .input(z.object({ id: z.string() }))
        .handler(async ({ context, input }) => {
            return await addressService.setDefaultAddress(context.user.id, input.id);
        }),
};
