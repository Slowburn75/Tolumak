import prisma from "@Tolumak/db";

export class CollectionService {
  async listCollections(limit?: number) {
    return await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: {
        sortOrder: "asc",
      },
      take: limit,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async getCollectionBySlug(slug: string) {
    return await prisma.collection.findUnique({
      where: { slug },
    });
  }
}

export const collectionService = new CollectionService();
