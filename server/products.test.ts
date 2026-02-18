import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "multiservicesyamane@gmail.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("products procedures", () => {
  it("allows public access to list products", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("allows public access to get product by id", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.getById({ id: 1 });

    expect(result).toBeDefined();
    if (result) {
      expect(result.id).toBe(1);
      expect(result.name).toBeDefined();
      expect(result.price).toBeDefined();
    }
  });

  it("requires admin role to create product", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.products.create({
        name: "Test Product",
        price: "1000",
        categoryId: 1,
      })
    ).rejects.toThrow();
  });

  it("allows admin to create product", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Test Product Admin",
      description: "Test description",
      price: "1500",
      unit: "kg",
      categoryId: 1,
      badge: "Test",
    });

    expect(result.success).toBe(true);
  });
});

describe("categories procedures", () => {
  it("allows public access to list categories", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("allows public access to get category by slug", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.getBySlug({ slug: "produits-de-mil" });

    expect(result).toBeDefined();
    if (result) {
      expect(result.slug).toBe("produits-de-mil");
      expect(result.name).toBeDefined();
    }
  });

  it("requires admin role to create category", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.categories.create({
        name: "Test Category",
        slug: "test-category",
      })
    ).rejects.toThrow();
  });
});

describe("orders procedures", () => {
  it("allows public to create order", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.create({
      productId: 1,
      productName: "Test Product",
      productPrice: "1000",
      quantity: 2,
      deliveryLocation: "Dakar",
      customerPhone: "+221771234567",
    });

    expect(result.success).toBe(true);
  });

  it("requires admin role to list orders", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.orders.list()).rejects.toThrow();
  });

  it("allows admin to list orders", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin to get order stats", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.stats();

    expect(result).toBeDefined();
    expect(result.total).toBeDefined();
    expect(result.pending).toBeDefined();
    // MySQL returns aggregates as strings, convert if needed
    expect(Number(result.total)).toBeGreaterThanOrEqual(0);
    expect(Number(result.pending)).toBeGreaterThanOrEqual(0);
  });
});
