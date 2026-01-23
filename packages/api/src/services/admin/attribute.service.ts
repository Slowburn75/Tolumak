import prisma from "@Tolumak/db";
import { Prisma } from "@Tolumak/db/prisma/generated";

export class AttributeService {
  async listAttributes(params?: { isActive?: boolean }) {
    const where: any = {};
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return await prisma.attribute.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async getAttributeById(id: string) {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new Error("Attribute not found");
    }

    return attribute;
  }

  async createAttribute(data: {
    name: string;
    displayName: string;
    values?: string[];
    isActive?: boolean;
    sortOrder?: number;
  }) {
    // Normalize name (lowercase, no spaces)
    const normalizedName = data.name.toLowerCase().replace(/\s+/g, "_");

    // Check uniqueness (case-insensitive)
    const existing = await prisma.attribute.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      throw new Error("Attribute with this name already exists");
    }

    return await prisma.attribute.create({
      data: {
        name: normalizedName,
        displayName: data.displayName,
        values: data.values || [],
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async updateAttribute(
    id: string,
    data: Partial<{
      name: string;
      displayName: string;
      values: string[];
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new Error("Attribute not found");
    }

    const updateData: any = { ...data };

    // Normalize and validate name if changed
    if (data.name) {
      const normalizedName = data.name.toLowerCase().replace(/\s+/g, "_");

      // Check uniqueness
      const existing = await prisma.attribute.findFirst({
        where: {
          name: {
            equals: normalizedName,
            mode: "insensitive",
          },
          id: { not: id },
        },
      });

      if (existing) {
        throw new Error("Attribute with this name already exists");
      }

      updateData.name = normalizedName;
    }

    return await prisma.attribute.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteAttribute(id: string) {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new Error("Attribute not found");
    }

    // Check if attribute is used in products
    const productsWithAttribute = await prisma.product.findMany({
      where: {
        attributes: {
          path: [attribute.name],
          not: Prisma.DbNull,
        },
      },
      select: { id: true },
    });

    if (productsWithAttribute.length > 0) {
      throw new Error(
        `Cannot delete attribute used in ${productsWithAttribute.length} product(s). Please remove it from products first.`,
      );
    }

    await prisma.attribute.delete({
      where: { id },
    });

    return true;
  }

  async addValues(id: string, values: string[]) {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new Error("Attribute not found");
    }

    // Merge and deduplicate values (case-insensitive)
    const existingLower = attribute.values.map((v) => v.toLowerCase());
    const newValues = values.filter((v) => !existingLower.includes(v.toLowerCase()));

    const updatedValues = [...attribute.values, ...newValues];

    return await prisma.attribute.update({
      where: { id },
      data: { values: updatedValues },
    });
  }

  async removeValues(id: string, values: string[]) {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new Error("Attribute not found");
    }

    // Remove specified values (case-insensitive)
    const valuesToRemoveLower = values.map((v) => v.toLowerCase());
    const updatedValues = attribute.values.filter(
      (v) => !valuesToRemoveLower.includes(v.toLowerCase()),
    );

    return await prisma.attribute.update({
      where: { id },
      data: { values: updatedValues },
    });
  }

  async getAttributeUsage(id: string) {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new Error("Attribute not found");
    }

    // Find products using this attribute
    const products = await prisma.product.findMany({
      where: {
        attributes: {
          path: [attribute.name],
          not: Prisma.DbNull,
        },
      },
      select: { id: true, name: true },
      take: 10, // Sample of products
    });

    return {
      count: products.length,
      sampleProducts: products,
    };
  }
}

export const attributeService = new AttributeService();
