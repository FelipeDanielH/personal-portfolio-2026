import { Resend } from "resend";
import { createElement } from "react";
import { ContactEmail } from "./email-template";
import type { ContactInput } from "./schema";
import { createContactIdempotencyKey } from "./security";

export function isEmailDeliveryConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.CONTACT_TO_EMAIL?.trim() &&
      process.env.CONTACT_FROM_EMAIL?.trim(),
  );
}

export async function sendContact(contact: ContactInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    return { ok: false as const, reason: "not_configured" as const };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send(
    {
      from,
      to: [to],
      replyTo: contact.email,
      subject: `[Portafolio] ${contact.subject || `Mensaje de ${contact.name}`}`,
      react: createElement(ContactEmail, { contact }),
    },
    { idempotencyKey: createContactIdempotencyKey(contact) },
  );

  return error
    ? { ok: false as const, reason: "provider_error" as const }
    : { ok: true as const, id: data?.id };
}
