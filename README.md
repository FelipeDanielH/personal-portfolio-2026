# Portafolio de Felipe Henríquez

Reconstrucción del portafolio con Next.js 16, React 19, TypeScript estricto, Tailwind CSS v4, Payload, Sanity (temporal) y Resend. `referencia-visual/` conserva el proyecto anterior únicamente como referencia y está excluido del nuevo repositorio.

## Desarrollo

Requisitos: Node.js 24 y pnpm 11.

```bash
corepack enable
pnpm install
copy .env.example .env.local
pnpm dev
```

Sin credenciales de Sanity, la aplicación pública usa contenido local normalizado. El formulario queda visible, pero responde `503` hasta configurar Resend.

## Arquitectura

- `src/app`: rutas públicas, Payload Admin, Metadata API, Studio temporal y endpoints.
- `src/components`: piezas de interfaz reutilizables, sin lógica de CMS.
- `src/content`: DTO de presentación, fallback y selectores puros.
- `src/payload`: collections, global, acceso y campos compartidos de Payload.
- `src/sanity`: schemas, consultas tipadas, Live Content y adaptación a DTO.
- `src/features/contact`: contrato, seguridad y entrega de correo.
- `scripts/seed.ts`: importación idempotente del contenido inicial.

Los Server Components son el valor por defecto. Solo navegación móvil, tema, filtros, formulario y revelado progresivo cruzan el límite de cliente.

## Payload

Payload está integrado en la misma aplicación y usa PostgreSQL mediante `DATABASE_URL`. Para Neon, usa la URL pooled de una branch de desarrollo distinta de producción. Configura también un `PAYLOAD_SECRET` aleatorio de al menos 32 caracteres y abre `/admin`; el primer acceso permite crear el usuario inicial y los siguientes requieren autenticación.

```bash
pnpm payload:types
pnpm payload:importmap
pnpm payload:seed
pnpm payload:validate-content
pnpm payload:migrate:create
pnpm payload:migrate:status
pnpm payload:migrate
```

En desarrollo, Payload sincroniza el esquema de la branch configurada mediante el modo `push` de Drizzle. En producción, `push` queda deshabilitado y las migraciones solo se aplican al ejecutar explícitamente `pnpm payload:migrate`; el despliegue no las ejecuta automáticamente.

La web pública lee contenido publicado mediante Payload Local API, sin HTTP interno, y lo transforma al DTO estable de `src/content/types.ts`. La lectura se cachea durante 60 segundos mediante Cache Components, por lo que una publicación aparece sin redeploy tras ese intervalo. Los errores de Payload son visibles: no existe fallback silencioso a Sanity ni al contenido local.

`pnpm payload:seed` usa exclusivamente `src/content/fallback.ts` como fuente, busca cada documento por su `key` estable y crea o actualiza sin eliminar contenido ajeno. `pnpm payload:validate-content` comprueba que el DTO publicado coincide exactamente con esa fuente.

La colección `media` usa Supabase Storage mediante su endpoint S3 compatible. Neon conserva únicamente metadata y relaciones; los binarios se envían server-side desde Payload al bucket público. Configura las seis variables `SUPABASE_STORAGE_*` de `.env.example`; `SUPABASE_STORAGE_PUBLIC_URL` debe apuntar a la raíz pública del bucket. No existe fallback al filesystem ni upload directo desde el navegador.

Sanity y su Studio permanecen temporalmente en el repositorio como rollback, pero ya no forman parte de la lectura de la web pública.

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
