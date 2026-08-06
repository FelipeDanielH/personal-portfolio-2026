import { contactSchema } from "@/features/contact/schema";
import { sendContact } from "@/features/contact/send-contact";
import { isTrustedOrigin } from "@/features/contact/security";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return Response.json({ ok: false, code: "forbidden_origin" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, code: "invalid_input" }, { status: 422 });
  }

  const result = contactSchema.safeParse(payload);
  if (!result.success) {
    return Response.json(
      { ok: false, code: "invalid_input", fields: result.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  if (result.data.website) {
    return Response.json({ ok: true }, { status: 202 });
  }

  try {
    const delivery = await sendContact(result.data);
    if (!delivery.ok) {
      return Response.json({ ok: false, code: "delivery_unavailable" }, { status: 503 });
    }
    return Response.json({ ok: true }, { status: 202 });
  } catch {
    return Response.json({ ok: false, code: "delivery_unavailable" }, { status: 503 });
  }
}
