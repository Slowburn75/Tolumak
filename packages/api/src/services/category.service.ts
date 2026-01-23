import prisma from "@Tolumak/db";

export class CategoryService {
  async listCategories() {
    return await prisma.category.findMany({
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async getCategoryBySlug(slug: string) {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
      },
    });
  }
}

export const categoryService = new CategoryService();
