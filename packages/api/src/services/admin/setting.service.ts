import prisma from "@Tolumak/db";

const CRITICAL_SETTINGS = ["site_name", "currency", "payment_methods"];

export class SettingService {
  async getAllSettings() {
    const settings = await prisma.setting.findMany();

    const grouped: Record<string, any[]> = {
      GENERAL: [],
      PAYMENT: [],
      SHIPPING: [],
      TAX: [],
      EMAIL: [],
      ADVANCED: [],
    };

    settings.forEach((setting) => {
      grouped[setting.category].push(setting);
    });

    return grouped;
  }

  async getSetting(key: string) {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new Error(`Setting '${key}' not found`);
    }

    return setting;
  }

  async getSettingValue<T = any>(key: string, defaultValue?: T): Promise<T> {
    try {
      const setting = await this.getSetting(key);
      return setting.value as T;
    } catch {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Setting '${key}' not found and no default provided`);
    }
  }

  async updateSetting(key: string, value: any, adminId: string) {
    this.validateSettingValue(key, value);

    return await prisma.setting.upsert({
      where: { key },
      update: {
        value,
        updatedBy: adminId,
      },
      create: {
        key,
        value,
        category: this.inferCategory(key),
        updatedBy: adminId,
      },
    });
  }

  async updateMultipleSettings(settings: { key: string; value: any }[], adminId: string) {
    settings.forEach((s) => this.validateSettingValue(s.key, s.value));

    return await prisma.$transaction(
      settings.map((s) =>
        prisma.setting.upsert({
          where: { key: s.key },
          update: { value: s.value, updatedBy: adminId },
          create: {
            key: s.key,
            value: s.value,
            category: this.inferCategory(s.key),
            updatedBy: adminId,
          },
        }),
      ),
    );
  }

  async deleteSetting(key: string) {
    if (CRITICAL_SETTINGS.includes(key)) {
      throw new Error(`Cannot delete critical setting '${key}'`);
    }

    await prisma.setting.delete({
      where: { key },
    });

    return true;
  }

  async initializeDefaultSettings() {
    const defaults = [
      { key: "site_name", value: { value: "My Store" }, category: "GENERAL", isPublic: true },
      {
        key: "currency",
        value: { value: "NGN", symbol: "₦" },
        category: "GENERAL",
        isPublic: true,
      },
      { key: "tax_rate", value: { value: 7.5 }, category: "TAX", isPublic: false },
      { key: "shipping_fee", value: { value: 200000 }, category: "SHIPPING", isPublic: true },
      {
        key: "bank_account",
        value: { bankName: "", accountNumber: "", accountName: "" },
        category: "PAYMENT",
        isPublic: false,
      },
      {
        key: "payment_methods",
        value: { cod: true, bank_transfer: true },
        category: "PAYMENT",
        isPublic: true,
      },
      { key: "order_auto_cancel_days", value: { value: 7 }, category: "ADVANCED", isPublic: false },
      { key: "low_stock_threshold", value: { value: 5 }, category: "ADVANCED", isPublic: false },
      {
        key: "email_notifications",
        value: { orderConfirm: true, orderShipped: true, lowStock: true },
        category: "EMAIL",
        isPublic: false,
      },
      {
        key: "maintenance_mode",
        value: { enabled: false, message: "" },
        category: "ADVANCED",
        isPublic: false,
      },
    ];

    let created = 0;
    for (const setting of defaults) {
      const existing = await prisma.setting.findUnique({
        where: { key: setting.key },
      });

      if (!existing) {
        await prisma.setting.create({
          data: setting as any,
        });
        created++;
      }
    }

    return created;
  }

  validateSettingValue(key: string, value: any): boolean {
    switch (key) {
      case "tax_rate":
        if (typeof value.value !== "number" || value.value < 0 || value.value > 100) {
          throw new Error("Tax rate must be a number between 0 and 100");
        }
        break;
      case "shipping_fee":
        if (typeof value.value !== "number" || value.value < 0) {
          throw new Error("Shipping fee must be a positive number");
        }
        break;
      case "bank_account":
        if (!value.bankName || !value.accountNumber || !value.accountName) {
          throw new Error("Bank account must have bankName, accountNumber, and accountName");
        }
        break;
    }
    return true;
  }

  async getPublicSettings() {
    return await prisma.setting.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
      },
    });
  }

  private inferCategory(key: string): any {
    if (key.includes("tax")) return "TAX";
    if (key.includes("shipping")) return "SHIPPING";
    if (key.includes("payment") || key.includes("bank")) return "PAYMENT";
    if (key.includes("email")) return "EMAIL";
    return "GENERAL";
  }
}

export const settingService = new SettingService();
