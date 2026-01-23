import prisma from "@Tolumak/db";
import { generateSlug } from "../../utils/helpers";

export class CollectionService {
  async listCollections(params?: { isActive?: boolean; page?: number; limit?: number }) {
    const where: any = {};
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const orderBy = [{ sortOrder: "asc" as const }, { name: "asc" as const }];

    if (params?.page && params?.limit) {
      const skip = (params.page - 1) * params.limit;
      const [collections, total] = await Promise.all([
        prisma.collection.findMany({
          where,
          skip,
          take: params.limit,
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy,
        }),
        prisma.collection.count({ where }),
      ]);

      return {
        collections: collections.map((c) => ({
          ...c,
          productCount: c._count.products,
        })),
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      };
    }

    const collections = await prisma.collection.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy,
    });

    return collections.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));
  }

  async getCollectionById(id: string) {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            status: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    return {
      ...collection,
      productCount: collection._count.products,
    };
  }

  async createCollection(data: {
    name: string;
    description?: string;
    image?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    const slug = generateSlug(data.name);

    // Check slug uniqueness
    const existing = await prisma.collection.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new Error("Collection with this name already exists");
    }

    return await prisma.collection.create({
      data: {
        ...data,
        slug,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async updateCollection(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      image: string;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    const updateData: any = { ...data };

    // Update slug if name changed
    if (data.name) {
      const slug = generateSlug(data.name);

      // Check slug uniqueness
      const existing = await prisma.collection.findUnique({
        where: { slug },
      });

      if (existing && existing.id !== id) {
        throw new Error("Collection with this name already exists");
      }

      updateData.slug = slug;
    }

    return await prisma.collection.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCollection(id: string) {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    await prisma.$transaction(async (tx) => {
      // Set collectionId to null for all products in this collection
      if (collection._count.products > 0) {
        await tx.product.updateMany({
          where: { collectionId: id },
          data: { collectionId: null },
        });
      }

      // Delete collection
      await tx.collection.delete({
        where: { id },
      });
    });

    return true;
  }

  async addProducts(collectionId: string, productIds: string[]) {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    // Validate all products exist
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new Error("One or more products not found");
    }

    // Update products
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { collectionId },
    });

    return products.length;
  }

  async removeProducts(collectionId: string, productIds: string[]) {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    // Update products to remove collection
    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds },
        collectionId,
      },
      data: { collectionId: null },
    });

    return result.count;
  }

  async getCollectionProducts(
    collectionId: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ) {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    const where = { collectionId };

    if (params?.page && params?.limit) {
      const skip = (params.page - 1) * params.limit;
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: params.limit,
          include: {
            category: true,
          },
          orderBy: {
            name: "asc",
          },
        }),
        prisma.product.count({ where }),
      ]);

      return {
        products,
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products;
  }
}

export const collectionService = new CollectionService();
