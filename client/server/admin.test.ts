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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("customers procedures", () => {
  it("requires admin role to list customers", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.customers.list()).rejects.toThrow("Admin access required");
  });

  it("allows admin to list customers", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customers.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin to create customer", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customers.create({
      name: "Test Customer",
      phone: "+221 77 123 45 67",
      email: "test@example.com",
    });

    expect(result.success).toBe(true);
  });
});

describe("settings procedures", () => {
  it("requires admin role to list settings", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.settings.list()).rejects.toThrow("Admin access required");
  });

  it("allows admin to list settings", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin to upsert setting", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.upsert({
      key: "test_setting",
      value: "test_value",
      description: "Test setting",
    });

    expect(result.success).toBe(true);
  });
});

describe("banners procedures", () => {
  it("allows public access to active banners", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.banners.active();
    expect(Array.isArray(result)).toBe(true);
  });

  it("requires admin role to list all banners", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.banners.list()).rejects.toThrow("Admin access required");
  });

  it("allows admin to create banner", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.banners.create({
      title: "Test Banner",
      description: "Test description",
    });

    expect(result.success).toBe(true);
  });
});

describe("statistics procedures", () => {
  it("requires admin role to view dashboard stats", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.statistics.dashboard()).rejects.toThrow("Admin access required");
  });

  it("allows admin to view dashboard stats", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.statistics.dashboard();
    expect(result).toBeDefined();
    expect(result.totalProducts).toBeDefined();
    expect(result.totalCategories).toBeDefined();
    expect(result.totalCustomers).toBeDefined();
    expect(result.totalOrders).toBeDefined();
  });

  it("allows admin to view popular products", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.statistics.popularProducts({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin to view recent orders", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.statistics.recentOrders({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
  });
});
