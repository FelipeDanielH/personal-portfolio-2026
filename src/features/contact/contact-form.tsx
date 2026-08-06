"use client";

import { ArrowUpRight, LoaderCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export function ContactForm({ email }: { email: string }) {
  const [state, setState] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("delivery_failed");

      form.reset();
      setState("success");
      setMessage("Mensaje enviado. Gracias por escribirme; te responderé pronto.");
    } catch {
      setState("error");
      setMessage("No pude enviar el mensaje ahora. Puedes escribirme directamente por correo.");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label>
          <span>Nombre</span>
          <input name="name" type="text" autoComplete="name" required minLength={2} maxLength={80} />
        </label>
        <label>
          <span>Correo</span>
          <input name="email" type="email" autoComplete="email" required maxLength={254} />
        </label>
      </div>
      <div className="form-grid">
        <label>
          <span>Empresa <small>(opcional)</small></span>
          <input name="company" type="text" autoComplete="organization" maxLength={100} />
        </label>
        <label>
          <span>Asunto <small>(opcional)</small></span>
          <input name="subject" type="text" maxLength={120} />
        </label>
      </div>
      <label>
        <span>Mensaje</span>
        <textarea name="message" required minLength={20} maxLength={3000} rows={6} />
      </label>
      <label className="honeypot" aria-hidden="true">
        <span>Sitio web</span>
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="form-footer">
        <button className="button button-primary" type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? <LoaderCircle className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
          {state === "submitting" ? "Enviando…" : "Enviar mensaje"}
        </button>
        <a className="text-link" href={`mailto:${email}`}>Usar correo <ArrowUpRight aria-hidden="true" /></a>
      </div>
      <p className={`form-status ${state}`} aria-live="polite">{message}</p>
    </form>
  );
}
