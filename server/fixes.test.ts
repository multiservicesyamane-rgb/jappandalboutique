import { describe, it, expect } from "vitest";
import { DAKAR_DELIVERY_ZONES, getDeliveryFee } from "../shared/deliveryZones";

describe("Delivery Zones", () => {
  it("should have at least 40 communes de Dakar", () => {
    expect(DAKAR_DELIVERY_ZONES.length).toBeGreaterThanOrEqual(40);
  });

  it("should have valid delivery fees (1000-4000 FCFA)", () => {
    DAKAR_DELIVERY_ZONES.forEach((zone) => {
      expect(zone.deliveryFee).toBeGreaterThanOrEqual(1000);
      expect(zone.deliveryFee).toBeLessThanOrEqual(4000);
    });
  });

  it("should have unique IDs for each zone", () => {
    const ids = DAKAR_DELIVERY_ZONES.map((z) => z.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should return correct delivery fee for Plateau (1000 FCFA)", () => {
    const fee = getDeliveryFee("plateau");
    expect(fee).toBe(1000);
  });

  it("should return correct delivery fee for Almadies (2000 FCFA)", () => {
    const fee = getDeliveryFee("almadies");
    expect(fee).toBe(2000);
  });

  it("should return correct delivery fee for Pikine (2500 FCFA)", () => {
    const fee = getDeliveryFee("pikine");
    expect(fee).toBe(2500);
  });

  it("should return correct delivery fee for Rufisque (3500 FCFA)", () => {
    const fee = getDeliveryFee("rufisque");
    expect(fee).toBe(3500);
  });

  it("should return correct delivery fee for Bargny (4000 FCFA)", () => {
    const fee = getDeliveryFee("bargny");
    expect(fee).toBe(4000);
  });

  it("should return 0 for unknown zone", () => {
    const fee = getDeliveryFee("unknown-zone");
    expect(fee).toBe(0);
  });

  it("should include key communes: Plateau, Medina, Almadies, Pikine, Guediawaye, Rufisque", () => {
    const names = DAKAR_DELIVERY_ZONES.map((z) => z.name.toLowerCase());
    expect(names).toContain("plateau");
    expect(names).toContain("médina");
    expect(names).toContain("almadies");
    expect(names).toContain("pikine");
    expect(names).toContain("guédiawaye");
    expect(names).toContain("rufisque");
  });
});

describe("Payment Router", () => {
  it("should have PAYTECH_API_KEY environment variable set", () => {
    // In test environment, we just verify the env var exists
    const apiKey = process.env.PAYTECH_API_KEY;
    expect(apiKey).toBeDefined();
    expect(typeof apiKey).toBe("string");
    expect(apiKey!.length).toBeGreaterThan(10);
  });

  it("should have PAYTECH_SECRET_KEY environment variable set", () => {
    const secretKey = process.env.PAYTECH_SECRET_KEY;
    expect(secretKey).toBeDefined();
    expect(typeof secretKey).toBe("string");
    expect(secretKey!.length).toBeGreaterThan(10);
  });
});
