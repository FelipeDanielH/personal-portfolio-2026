import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((value) => value || undefined);

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80),
  email: z.email("Escribe un correo válido.").trim().max(254),
  company: optionalText(100),
  subject: optionalText(120),
  message: z.string().trim().min(20, "Cuéntame un poco más sobre tu mensaje.").max(3_000),
  website: z.string().trim().max(200).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
