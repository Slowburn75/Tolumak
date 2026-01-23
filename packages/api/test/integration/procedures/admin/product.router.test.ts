import { describe, it, expect, vi, beforeEach } from "vitest";
import { productRouter } from "../../../../src/routers/admin/product.router";
import { adminProductService } from "../../../../src/services/admin/product.service";
import { RPCHandler } from "@orpc/server/fetch";

// Mock context
const mockAdminContext = {
  user: { id: "admin-1", role: "admin", email: "admin@example.com" },
  role: "ADMIN",
};

describe("Admin Product Procedure", () => {
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

      const mockResult = { id: "prod-1", ...input, slug: "new-product" };

      vi.mocked(adminProductService.createProduct).mockResolvedValue(mockResult);

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
          context: mockAdminContext,
        },
      );

      // Assert
      expect(response.matched).toBe(true);

      // Check body
      const body = await response.response.json();

      if (response.response.status !== 200) {
        console.error("Request Failed with status:", response.response.status);
        // console.error("Response Body keys:", Object.keys(body || {}));
        console.error("Response Body:", JSON.stringify(body, null, 2));
      }

      expect(response.response.status).toBe(200);
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
          context: mockAdminContext,
        },
      );

      // Expect a validation error status
      expect(response.response.status).toBe(400);
      expect(adminProductService.createProduct).not.toHaveBeenCalled();
    });
  });
});
