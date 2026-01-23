import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderService } from "../../../../src/services/order.service";
import prisma from "@Tolumak/db";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { Prisma } from "@Tolumak/db/prisma/generated";
import { OrderStatus } from "@Tolumak/db/prisma/generated";

// Mock prisma
vi.mock("@Tolumak/db", async () => {
  const { mockDeep } = await import("vitest-mock-extended");
  return {
    default: mockDeep(),
  };
});

const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<Prisma.PrismaClient>>;

describe("OrderService", () => {
  let orderService: OrderService;

  beforeEach(() => {
    mockReset(prismaMock);
    orderService = new OrderService();
  });

  describe("createOrder", () => {
    it("should create an order successfully with correct total and stock update", async () => {
      // Arrange
      const userId = "user-1";
      const items = [{ productId: "prod-1", quantity: 2 }];
      const product = {
        id: "prod-1",
        price: 100,
        stock: 10,
        name: "Test Product",
      };

      prismaMock.product.findMany.mockResolvedValue([product] as any);

      // Mock transaction
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.order.create.mockResolvedValue({
        id: "order-1",
        total: 200,
        status: OrderStatus.PENDING_PAYMENT,
      } as any);

      // Act
      const result = await orderService.createOrder({ userId, items });

      // Assert
      expect(result.total).toBe(200);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ["prod-1"] } },
      });
      expect(prismaMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total: 200,
            subtotal: 200,
            status: OrderStatus.PENDING_PAYMENT,
            items: {
              create: expect.arrayContaining([
                expect.objectContaining({ productId: "prod-1", quantity: 2, price: 100 }),
              ]),
            },
          }),
        }),
      );
      // Verify stock update
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: { stock: { decrement: 2 } },
      });
    });

    it("should throw error if insufficient stock", async () => {
      const userId = "user-1";
      const items = [{ productId: "prod-1", quantity: 20 }];
      const product = {
        id: "prod-1",
        price: 100,
        stock: 10,
        name: "Test Product",
      };

      prismaMock.product.findMany.mockResolvedValue([product] as any);

      // Act & Assert
      await expect(orderService.createOrder({ userId, items })).rejects.toThrow(
        "Insufficient stock for product: Test Product",
      );
    });

    it("should throw error if product not found", async () => {
      const userId = "user-1";
      const items = [{ productId: "prod-1", quantity: 1 }];

      prismaMock.product.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(orderService.createOrder({ userId, items })).rejects.toThrow(
        "One or more products not found",
      );
    });
  });
});
