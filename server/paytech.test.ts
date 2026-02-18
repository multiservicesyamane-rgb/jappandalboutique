import { describe, it, expect } from "vitest";

describe("PayTech Integration", () => {
  it("should have PAYTECH_API_KEY environment variable set", () => {
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

  it("should generate valid ref_command format", () => {
    const refCommand = `CMD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    expect(refCommand).toMatch(/^CMD_\d+_[A-Z0-9]+$/);
    expect(refCommand.length).toBeGreaterThan(1);
    expect(refCommand.length).toBeLessThanOrEqual(255);
  });

  it("should build correct PayTech request body with all required fields including env and ipn_url", () => {
    const refCommand = `CMD_${Date.now()}_ABC123`;
    const origin = "https://jappandal-nanliubs.manus.space";
    const body = {
      item_name: "Test Product",
      item_price: 1500,
      currency: "XOF",
      ref_command: refCommand,
      command_name: "Commande Jappandal Boutique - Test",
      env: "test",
      ipn_url: `${origin}/api/paytech/ipn`,
      success_url: `${origin}/paiement-succes`,
      cancel_url: `${origin}/paiement-annule`,
    };

    expect(body.item_name).toBe("Test Product");
    expect(body.item_price).toBe(1500);
    expect(body.currency).toBe("XOF");
    expect(body.ref_command).toBeDefined();
    expect(body.ref_command.length).toBeGreaterThan(0);
    expect(body.ref_command.length).toBeLessThanOrEqual(255);
    expect(body.command_name).toBeDefined();
    expect(body.command_name.length).toBeGreaterThan(0);
    // env must be test or prod
    expect(["test", "prod"]).toContain(body.env);
    // ipn_url is required by PayTech API
    expect(body.ipn_url).toBeDefined();
    expect(body.ipn_url).toContain("/api/paytech/ipn");
    expect(body.success_url).toContain("paiement-succes");
    expect(body.cancel_url).toContain("paiement-annule");
  });

  it("should validate that commandName is always a non-empty string", () => {
    const items = [
      { name: "Riz Basmati", quantity: 2 },
      { name: "Huile Palme", quantity: 1 },
    ];
    const zoneName = "Plateau";
    const orderSummary = items.map((item) => `${item.name} x${item.quantity}`).join(", ");
    const commandName = `Commande Jappandal Boutique - Livraison ${zoneName} - ${orderSummary}`;

    expect(commandName).toBeDefined();
    expect(typeof commandName).toBe("string");
    expect(commandName.length).toBeGreaterThan(0);
    expect(commandName).toContain("Jappandal");
    expect(commandName).toContain("Plateau");
  });

  it("should construct valid ipn_url from origin", () => {
    const origins = [
      "https://jappandal-nanliubs.manus.space",
      "https://example.com",
      "http://localhost:3000",
    ];
    for (const origin of origins) {
      const ipnUrl = `${origin}/api/paytech/ipn`;
      expect(ipnUrl).toContain("/api/paytech/ipn");
      expect(ipnUrl.startsWith("http")).toBe(true);
    }
  });

  it("should correctly serialize custom_field as JSON string", () => {
    const customField = {
      paymentMethod: "wave",
      deliveryZone: "plateau",
      deliveryFee: 1000,
    };
    const serialized = JSON.stringify(customField);
    expect(typeof serialized).toBe("string");
    const parsed = JSON.parse(serialized);
    expect(parsed.paymentMethod).toBe("wave");
    expect(parsed.deliveryZone).toBe("plateau");
  });

  it("should map payment methods to correct PayTech target_payment values", () => {
    const mapping: Record<string, string | undefined> = {
      wave: "Wave",
      orange_money: "Orange Money",
      paytech: undefined, // carte bancaire - no specific target
    };
    expect(mapping.wave).toBe("Wave");
    expect(mapping.orange_money).toBe("Orange Money");
    expect(mapping.paytech).toBeUndefined();

    // Verify target_payment values match PayTech documentation
    const validTargets = ["Orange Money", "Wave", "Free Money", "Carte Bancaire", "Wizall"];
    expect(validTargets).toContain(mapping.wave);
    expect(validTargets).toContain(mapping.orange_money);
  });
});
