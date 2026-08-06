import type { ContactInput } from "./schema";

const cellStyle = { padding: "8px 0", color: "#334155", fontSize: "15px", lineHeight: "1.6" } as const;

export function ContactEmail({ contact }: { contact: ContactInput }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: "32px 16px", backgroundColor: "#f1f5f9", fontFamily: "Arial, sans-serif" }}>
        <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: 620, backgroundColor: "#ffffff", borderRadius: 18, padding: 32 }}>
                  <tbody>
                    <tr><td style={{ color: "#2563eb", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Nuevo contacto desde el portafolio</td></tr>
                    <tr><td><h1 style={{ color: "#0f172a", fontSize: 28, margin: "12px 0 20px" }}>{contact.subject || "Nueva conversación"}</h1></td></tr>
                    <tr><td style={cellStyle}><strong>Nombre:</strong> {contact.name}</td></tr>
                    <tr><td style={cellStyle}><strong>Correo:</strong> {contact.email}</td></tr>
                    {contact.company ? <tr><td style={cellStyle}><strong>Empresa:</strong> {contact.company}</td></tr> : null}
                    <tr><td style={{ ...cellStyle, paddingTop: 24, whiteSpace: "pre-wrap" }}>{contact.message}</td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
