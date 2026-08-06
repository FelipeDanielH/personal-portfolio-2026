import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="status-page shell">
      <p className="eyebrow">Error 404</p>
      <h1>Esta página no existe.</h1>
      <p>Quizás cambió de lugar o el enlace está incompleto.</p>
      <Link className="button button-primary" href="/">Volver al inicio</Link>
    </main>
  );
}
