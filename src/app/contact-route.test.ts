import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendContact } = vi.hoisted(() => ({ sendContact: vi.fn() }));

vi.mock("@/features/contact/send-contact", () => ({ sendContact }));

import { POST } from "./(website)/api/contact/route";

const payload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Quiero conversar sobre una plataforma web para mi equipo.",
  website: "",
};

function request(body: unknown, origin = "https://portfolio.dev") {
  return new Request("https://portfolio.dev/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => sendContact.mockReset());

  it("responde 202 cuando Resend acepta la notificación", async () => {
    sendContact.mockResolvedValue({ ok: true, id: "email-id" });
    const response = await POST(request(payload));
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ ok: true });
    expect(sendContact).toHaveBeenCalledWith(expect.objectContaining({ email: payload.email }));
  });

  it("acepta silenciosamente el honeypot sin enviar correo", async () => {
    const response = await POST(request({ ...payload, website: "https://bot.invalid" }));
    expect(response.status).toBe(202);
    expect(sendContact).not.toHaveBeenCalled();
  });

  it("rechaza origen y entrada inválidos", async () => {
    expect((await POST(request(payload, "https://attacker.dev"))).status).toBe(403);
    expect((await POST(request({ ...payload, message: "corto" }))).status).toBe(422);
  });

  it("expone indisponibilidad de correo sin filtrar detalles", async () => {
    sendContact.mockResolvedValue({ ok: false });
    const response = await POST(request(payload));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, code: "delivery_unavailable" });
  });
});
