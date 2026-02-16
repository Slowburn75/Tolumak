import prisma from "@Tolumak/db";
import type { Prisma } from "@Tolumak/db/prisma/generated";

export class ProductService {
  async listProducts(params?: {
    categoryId?: string;
    isPublished?: boolean;
    search?: string;
    collectionId?: string;
    sort?: "price_asc" | "price_desc" | "newest";
    page?: number;
    limit?: number;
    ids?: string[];
  }) {
    const where: Prisma.ProductWhereInput = {};

    if (params?.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params?.collectionId) {
      where.collectionId = params.collectionId;
    }

    if (params?.isPublished !== undefined) {
      where.status = params.isPublished ? "ACTIVE" : "DRAFT";
    } else {
      where.status = "ACTIVE"; // Default to only showing active products
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params?.ids && params.ids.length > 0) {
      where.id = { in: params.ids };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      params?.sort === "price_asc"
        ? { price: "asc" }
        : params?.sort === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" };

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          collection: true,
          variants: {
            select: { id: true, price: true } // Minimal fetch to show "From $X" if needed
          }
        },
        orderBy,
        skip,
        take: limit,
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

  async listRelated(productId: string, limit = 4) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!product) return [];

    return await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        status: "ACTIVE",
      },
      take: limit,
      include: {
        category: true,
        collection: true,
        variants: {
          select: { id: true, price: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        collection: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        collection: true,
        variants: {
          where: { isActive: true },
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
    slug: string;
    description: string;
    images: string[];
    price: number;
    stock: number;
    categoryId: string;
    status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  }) {
    const { categoryId, ...rest } = data;
    return await prisma.product.create({
      data: {
        ...rest,
        status: data.status || "ACTIVE",
        category: {
          connect: { id: categoryId },
        },
      },
    });
  }

  async updateProduct(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      images?: string[];
      price?: number;
      stock?: number;
      categoryId?: string;
      status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
    },
  ) {
    const { categoryId, ...rest } = data;
    return await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
    });
  }

  async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  async reduceStock(productId: string, quantity: number, variantId?: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;

    if (variantId) {
      const variant = await client.productVariant.findUnique({
        where: { id: variantId },
        select: { stock: true, size: true, color: true },
      });

      if (!variant) {
        throw new Error(`Variant ${variantId} not found`);
      }

      if (variant.stock < quantity) {
        throw new Error(
          `Insufficient stock for variant ${variant.size || ""} ${variant.color || ""}. Requested: ${quantity}, Available: ${variant.stock}`,
        );
      }

      return await client.productVariant.update({
        where: { id: variantId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });
    }

    const product = await client.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true },
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    if (product.stock < quantity) {
      throw new Error(
        `Insufficient stock for product: ${product.name}. Requested: ${quantity}, Available: ${product.stock}`,
      );
    }

    return await client.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }
}

export const productService = new ProductService();
