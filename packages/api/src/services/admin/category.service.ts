import prisma from "@Tolumak/db";

export class AdminCategoryService {
  async listCategories() {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Build hierarchical structure
    const categoryMap = new Map(
      categories.map((c) => [c.id, { ...c, productCount: c._count.products }]),
    );
    const rootCategories: any[] = [];

    categories.forEach((category) => {
      const cat = categoryMap.get(category.id)!;
      if (!category.parentId) {
        rootCategories.push(cat);
      }
    });

    return rootCategories;
  }

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return {
      ...category,
      productCount: category._count.products,
    };
  }

  async createCategory(data: {
    name: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive?: boolean;
  }) {
    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new Error("Category with this name already exists");
    }

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new Error("Parent category not found");
      }
    }

    return await prisma.category.create({
      data: {
        ...data,
        slug,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      image: string;
      parentId: string;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Update slug if name changed
    const updateData: any = { ...data };
    if (data.name) {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Check slug uniqueness
      const existing = await prisma.category.findUnique({
        where: { slug },
      });

      if (existing && existing.id !== id) {
        throw new Error("Category with this name already exists");
      }

      updateData.slug = slug;
    }

    // Validate parent if changed
    if (data.parentId) {
      // Prevent circular reference
      if (data.parentId === id) {
        throw new Error("Category cannot be its own parent");
      }

      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new Error("Parent category not found");
      }

      // Check if new parent is a descendant (would create circular reference)
      const descendants = await this.getDescendants(id);
      if (descendants.includes(data.parentId)) {
        throw new Error("Cannot set a descendant as parent (circular reference)");
      }
    }

    return await prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    if (category._count.products > 0) {
      throw new Error(
        `Cannot delete category with ${category._count.products} products. Please reassign or delete products first.`,
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return true;
  }

  private async getDescendants(categoryId: string): Promise<string[]> {
    const children = await prisma.category.findMany({
      where: { parentId: categoryId },
      select: { id: true },
    });

    const descendants = children.map((c) => c.id);

    for (const child of children) {
      const childDescendants = await this.getDescendants(child.id);
      descendants.push(...childDescendants);
    }

    return descendants;
  }
}

export const adminCategoryService = new AdminCategoryService();
