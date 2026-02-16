import { describe, it, expect, vi, beforeEach } from "vitest";
import { productRouter } from "../../../../src/routers/admin/product.router";
import { adminProductService } from "../../../../src/services/admin/product.service";
import { RPCHandler } from "@orpc/server/fetch";

// Mock context
const mockadminContext = {
  session: {
    user: {
      id: "admin-1",
      role: "admin",
      email: "admin@example.com",
      emailVerified: true,
      name: "Admin User",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: { id: "sess-1", createdAt: new Date(), updatedAt: new Date(), userId: "admin-1", expiresAt: new Date(), token: "token" },
  },
  user: {
    id: "admin-1",
    role: "admin",
    email: "admin@example.com",
    emailVerified: true,
    name: "Admin User",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  role: "admin",
};

describe("admin Product Procedure", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(adminProductService, "createProduct");
  });

  describe("create", () => {
    it("should call createProduct service when input is valid and user is admin", async () => {
      // Arrange
      const input = {
        name: "New Product",
        description: "Desc",
        price: 100,
        stock: 50,
        sku: "SKU-123",
        categoryId: "cat-1",
      };

      const mockResult = {
        id: "prod-1",
        ...input,
        slug: "new-product",
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "ACTIVE" as const,
        collectionId: null,
        weight: null,
        attributes: null,
        hasVariants: false,
      };

      vi.mocked(adminProductService.createProduct).mockResolvedValue(mockResult as any);

      // Create a temporary router for testing
      const testRouter = {
        create: productRouter.create,
      };

      const handler = new RPCHandler(testRouter);

      // Act
      const response = await handler.handle(
        new Request("http://localhost/rpc/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json: input }),
        }),
        {
          prefix: "/rpc",
          context: mockadminContext,
        },
      );

      // Assert
      expect(response.matched).toBe(true);

      // Check body
      const body = await response.response?.json();

      expect(response.response?.status).toBe(200);
      expect(adminProductService.createProduct).toHaveBeenCalledWith(input);
      expect(body).toEqual({ json: mockResult });
    });

    it("should return error if input is invalid", async () => {
      const input = {
        name: "",
      };

      const testRouter = {
        create: productRouter.create,
      };
      const handler = new RPCHandler(testRouter);

      const response = await handler.handle(
        new Request("http://localhost/rpc/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Error case also wrapped? Likely yes.
          body: JSON.stringify({ json: input }),
        }),
        {
          prefix: "/rpc",
          context: mockadminContext as any,
        },
      );

      // Expect a validation error status
      expect(response.response?.status).toBe(400);
      expect(adminProductService.createProduct).not.toHaveBeenCalled();
    });
  });
});
