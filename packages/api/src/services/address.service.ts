import prisma from "@Tolumak/db";

export class AddressService {
    async listAddresses(userId: string) {
        return await prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: "desc" },
        });
    }

    async createAddress(userId: string, data: {
        label?: string | null;
        name: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        postalCode?: string | null;
        isDefault?: boolean;
    }) {
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return await prisma.address.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    async updateAddress(userId: string, id: string, data: Partial<{
        label: string | null;
        name: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        postalCode: string | null;
        isDefault: boolean;
    }>) {
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return await prisma.address.update({
            where: { id, userId },
            data,
        });
    }

    async deleteAddress(userId: string, id: string) {
        return await prisma.address.delete({
            where: { id, userId },
        });
    }

    async setDefaultAddress(userId: string, id: string) {
        await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
        });

        return await prisma.address.update({
            where: { id, userId },
            data: { isDefault: true },
        });
    }

    async getDefaultAddress(userId: string) {
        return await prisma.address.findFirst({
            where: { userId, isDefault: true },
        });
    }
}

export const addressService = new AddressService();
