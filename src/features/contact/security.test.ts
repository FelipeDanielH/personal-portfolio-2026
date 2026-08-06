import { describe, expect, it } from "vitest";
import type { ContactInput } from "./schema";
import { createContactIdempotencyKey, isTrustedOrigin } from "./security";

const input: ContactInput = {
  name: "Ada Lovelace",
  email: "Ada@example.com",
  company: undefined,
  subject: undefined,
  message: "Quiero conversar sobre un producto digital nuevo.",
  website: "",
};

describe("contact security", () => {
  it("solo admite el origen propio", () => {
    expect(isTrustedOrigin(new Request("https://portfolio.dev/api/contact", {
      headers: { origin: "https://portfolio.dev" },
    }))).toBe(true);
    expect(isTrustedOrigin(new Request("https://portfolio.dev/api/contact", {
      headers: { origin: "https://attacker.dev" },
    }))).toBe(false);
    expect(isTrustedOrigin(new Request("https://portfolio.dev/api/contact"))).toBe(false);
  });

  it("crea una clave estable por contenido y día", () => {
    const first = createContactIdempotencyKey(input, new Date("2026-08-05T10:00:00Z"));
    const repeated = createContactIdempotencyKey(input, new Date("2026-08-05T23:00:00Z"));
    const changed = createContactIdempotencyKey({ ...input, message: `${input.message} Gracias.` }, new Date("2026-08-05T10:00:00Z"));

    expect(first).toBe(repeated);
    expect(first).not.toBe(changed);
    expect(first).toMatch(/^portfolio-contact\/[a-f0-9]{40}$/);
  });
});
