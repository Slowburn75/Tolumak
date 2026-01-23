import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminProductService } from "../../../../../src/services/admin/product.service";
import prisma from "@Tolumak/db";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { Prisma } from "@Tolumak/db/prisma/generated";

// Mock prisma
vi.mock("@Tolumak/db", async () => {
  const { mockDeep } = await import("vitest-mock-extended");
  return {
    default: mockDeep(),
  };
});

const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<Prisma.PrismaClient>>;

describe("AdminProductService", () => {
  let service: AdminProductService;

  beforeEach(() => {
    mockReset(prismaMock);
    service = new AdminProductService();
  });

  describe("createProduct", () => {
    it("should create a product successfully", async () => {
      // Arrange
      const input = {
        name: "New Product",
        description: "Desc",
        price: 100,
        stock: 50,
        sku: "SKU-123",
        categoryId: "cat-1",
        status: "ACTIVE" as const,
      };

      prismaMock.product.findUnique.mockResolvedValue(null); // SKU check
      prismaMock.category.findUnique.mockResolvedValue({ id: "cat-1" } as any); // Cat check
      prismaMock.product.create.mockResolvedValue({
        id: "prod-1",
        ...input,
        slug: "new-product",
      } as any);

      // Act
      const result = await service.createProduct(input);

      // Assert
      expect(result.id).toBe("prod-1");
      expect(result.slug).toBe("new-product");
      expect(prismaMock.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sku: "SKU-123",
            name: "New Product",
            category: { connect: { id: "cat-1" } },
          }),
        }),
      );
    });

    it("should throw if SKU exists", async () => {
      const input = {
        name: "New Product",
        description: "Desc",
        price: 100,
        stock: 50,
        sku: "SKU-DUPE",
        categoryId: "cat-1",
      };

      prismaMock.product.findUnique.mockResolvedValue({ id: "existing" } as any); // SKU exists

      // Act & Assert
      await expect(service.createProduct(input)).rejects.toThrow("SKU already exists");
    });
  });
});
