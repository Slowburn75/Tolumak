import prisma from "@Tolumak/db";
import type { Prisma } from "@Tolumak/db/prisma/generated";

export class AdminProductService {
  async listProducts(params: {
    search?: string;
    categoryId?: string;
    status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
    page: number;
    limit: number;
  }) {
    const { search, categoryId, status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }


  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    sku: string;
    categoryId: string;
    images?: string[];
    weight?: number;
    attributes?: Record<string, any>;
    status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
    collectionId?: string;
  }) {
    // Check SKU uniqueness
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      throw new Error("SKU already exists");
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const { categoryId, collectionId, ...rest } = data;

    return await prisma.product.create({
      data: {
        ...rest,
        slug,
        status: data.status || "ACTIVE",
        category: {
          connect: { id: categoryId },
        },
        collection: collectionId ? {
          connect: { id: collectionId }
        } : undefined,
      },
    });
  }

  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      compareAtPrice: number;
      stock: number;
      sku: string;
      categoryId: string;
      images: string[];
      weight: number;
      attributes: Record<string, any>;
      status: "DRAFT" | "ACTIVE" | "ARCHIVED";
      collectionId: string | null;
    }>,
  ) {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Check SKU uniqueness if changed
    if (data.sku && data.sku !== product.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existing) {
        throw new Error("SKU already exists");
      }
    }

    // Validate category if changed
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error("Category not found");
      }
    }

    // Update slug if name changed
    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    // Handle category relation
    if (data.categoryId) {
      updateData.category = {
        connect: { id: data.categoryId },
      };
      delete updateData.categoryId;
    }

    // Handle collection relation
    if (data.collectionId !== undefined) {
      if (data.collectionId === null) {
        updateData.collection = {
          disconnect: true,
        };
      } else {
        updateData.collection = {
          connect: { id: data.collectionId },
        };
      }
      delete updateData.collectionId;
    }

    return await prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Soft delete: set status to ARCHIVED
    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return true;
  }

  async updateStock(id: string, quantity: number, operation: "SET" | "ADD" | "SUBTRACT") {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { stock: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    let newStock: number;

    switch (operation) {
      case "SET":
        newStock = quantity;
        break;
      case "ADD":
        newStock = product.stock + quantity;
        break;
      case "SUBTRACT":
        newStock = product.stock - quantity;
        if (newStock < 0) {
          throw new Error("Insufficient stock");
        }
        break;
    }

    return await prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });
  }

  async getLowStockProducts(threshold: number = 5) {
    return await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        stock: { lt: threshold },
      },
      include: {
        category: true,
      },
      orderBy: {
        stock: "asc",
      },
    });
  }
}

export const adminProductService = new AdminProductService();
