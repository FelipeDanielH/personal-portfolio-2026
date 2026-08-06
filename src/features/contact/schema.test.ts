import { describe, expect, it } from "vitest";
import { contactSchema } from "./schema";

const validInput = {
  name: "  Ada Lovelace  ",
  email: "ada@example.com",
  company: "  Analytical Engines  ",
  subject: "  Proyecto web  ",
  message: "  Me gustaría conversar sobre una plataforma nueva.  ",
  website: "",
};

describe("contactSchema", () => {
  it("normaliza espacios y conserva solo los campos del contrato", () => {
    expect(contactSchema.parse({ ...validInput, ignored: "value" })).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: "Analytical Engines",
      subject: "Proyecto web",
      message: "Me gustaría conversar sobre una plataforma nueva.",
      website: "",
    });
  });

  it("rechaza correo inválido y mensajes demasiado cortos", () => {
    const result = contactSchema.safeParse({ ...validInput, email: "ada", message: "muy corto" });
    expect(result.success).toBe(false);
  });

  it("normaliza campos opcionales vacíos", () => {
    const parsed = contactSchema.parse({ ...validInput, company: " ", subject: " " });
    expect(parsed.company).toBeUndefined();
    expect(parsed.subject).toBeUndefined();
  });
});
