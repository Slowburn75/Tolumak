import prisma from "@Tolumak/db";

export class BankAccountService {
    async getActiveBankAccount() {
        return await prisma.bankAccount.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
        });
    }

    async createBankAccount(data: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    }) {
        return await prisma.bankAccount.create({
            data: {
                ...data,
                isActive: true,
            },
        });
    }

    async updateBankAccount(id: string, data: {
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
        isActive?: boolean;
    }) {
        // If setting to active, deactivate others
        if (data.isActive) {
            await prisma.bankAccount.updateMany({
                where: { id: { not: id } },
                data: { isActive: false },
            });
        }

        return await prisma.bankAccount.update({
            where: { id },
            data,
        });
    }

    async listBankAccounts() {
        return await prisma.bankAccount.findMany({
            orderBy: { createdAt: "desc" },
        });
    }

    async deleteBankAccount(id: string) {
        return await prisma.bankAccount.delete({
            where: { id },
        });
    }
}

export const bankAccountService = new BankAccountService();
