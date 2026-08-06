# Portafolio de Felipe Henríquez

Reconstrucción del portafolio con Next.js 16, React 19, TypeScript estricto, Tailwind CSS v4, Sanity y Resend. `referencia-visual/` conserva el proyecto anterior únicamente como referencia y está excluido del nuevo repositorio.

## Desarrollo

Requisitos: Node.js 24 y pnpm 11.

```bash
corepack enable
pnpm install
copy .env.example .env.local
pnpm dev
```

Sin credenciales de Sanity, la aplicación usa contenido local normalizado. El formulario queda visible, pero responde `503` hasta configurar Resend.

## Arquitectura

- `src/app`: rutas públicas, Metadata API, Studio y endpoints.
- `src/components`: piezas de interfaz reutilizables, sin lógica de CMS.
- `src/content`: DTO de presentación, fallback y selectores puros.
- `src/sanity`: schemas, consultas tipadas, Live Content y adaptación a DTO.
- `src/features/contact`: contrato, seguridad y entrega de correo.
- `scripts/seed.ts`: importación idempotente del contenido inicial.

Los Server Components son el valor por defecto. Solo navegación móvil, tema, filtros, formulario y revelado progresivo cruzan el límite de cliente.

## Sanity

Configura `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `SANITY_DRAFT_SECRET` y `SANITY_STUDIO_PREVIEW_URL`.

```bash
pnpm sanity:typegen
pnpm sanity:seed
```

El Studio vive en `/studio`. El seed usa identificadores deterministas y `createOrReplace`, por lo que puede ejecutarse nuevamente sin duplicar documentos.

## Contacto

Configura `RESEND_API_KEY`, `CONTACT_TO_EMAIL` y `CONTACT_FROM_EMAIL`. El dominio de `CONTACT_FROM_EMAIL` debe estar verificado en Resend. El endpoint acepta únicamente `POST /api/contact`, valida con Zod, comprueba el origen, utiliza honeypot e idempotencia diaria por contenido.

## Calidad

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Despliegue seguro

Crear un proyecto nuevo en Vercel y añadir las variables por entorno. Tras el primer preview, crear una regla WAF limitada a `POST /api/contact`: comenzar con acción `log`, revisar falsos positivos y después aplicar en Preview el límite de 5 solicitudes por IP cada 15 minutos con respuesta `429`. Publicarla en producción solo después de validar el tráfico real.
