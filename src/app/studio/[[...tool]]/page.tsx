import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { hasSanityProject } from "@/sanity/env";
import { Studio } from "./studio";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return (
    <Suspense fallback={<main className="studio-setup"><p>Cargando Studio…</p></main>}>
      <DynamicStudio />
    </Suspense>
  );
}

async function DynamicStudio() {
  await connection();

  if (!hasSanityProject) {
    return (
      <main className="studio-setup">
        <h1>Sanity aún no está conectado</h1>
        <p>Configura las variables de `.env.example` y vuelve a abrir esta ruta.</p>
      </main>
    );
  }

  return <Studio />;
}
