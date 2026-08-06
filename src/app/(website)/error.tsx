"use client";

export default function WebsiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="status-page shell">
      <p className="eyebrow">No pudimos cargar el contenido</p>
      <h1>Algo no salió como esperábamos.</h1>
      <p>El sitio sigue disponible. Puedes intentar nuevamente en unos segundos.</p>
      <button type="button" className="button button-primary" onClick={reset}>Reintentar</button>
    </main>
  );
}
