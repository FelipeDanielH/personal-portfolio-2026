# Portafolio de Felipe Henríquez

Reconstrucción del portafolio con Next.js 16, React 19, TypeScript estricto, Tailwind CSS v4, Payload y Resend. `referencia-visual/` conserva el proyecto anterior únicamente como referencia y está excluido del nuevo repositorio.

## Desarrollo

Requisitos: Node.js 24 y pnpm 11.

```bash
corepack enable
pnpm install
copy .env.example .env.local
pnpm dev
```

El formulario queda visible, pero responde `503` hasta configurar Resend.

## Arquitectura

- `src/app`: rutas públicas, Payload Admin, Metadata API y endpoints.
- `src/components`: piezas de interfaz reutilizables, sin lógica de CMS.
- `src/content`: DTO de presentación y selectores puros.
- `src/payload`: collections, global, acceso y campos compartidos de Payload.
- `src/features/contact`: contrato, seguridad y entrega de correo.
- `scripts/seed-payload.ts`: importación idempotente del contenido inicial.

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

La web pública lee contenido publicado mediante Payload Local API, sin HTTP interno, y lo transforma al DTO estable de `src/content/types.ts`. La lectura se cachea durante 60 segundos mediante Cache Components, por lo que una publicación aparece sin redeploy tras ese intervalo. Los errores de Payload son visibles: no existe fallback silencioso.

`pnpm payload:seed` usa exclusivamente `src/content/fallback.ts` como fuente, busca cada documento por su `key` estable y crea o actualiza sin eliminar contenido ajeno. `pnpm payload:validate-content` comprueba que el DTO publicado coincide exactamente con esa fuente.

La colección `media` usa Supabase Storage mediante su endpoint S3 compatible. Neon conserva únicamente metadata y relaciones; los binarios se envían server-side desde Payload al bucket público. Configura las seis variables `SUPABASE_STORAGE_*` de `.env.example`; `SUPABASE_STORAGE_PUBLIC_URL` debe apuntar a la raíz pública del bucket. No existe fallback al filesystem ni upload directo desde el navegador.

## Blog Markdown

En `/admin` → **Artículos**, escribe título, extracto y Markdown. El slug se genera del título al guardar si está vacío y se puede editar. **Insertar Media** abre el selector nativo de Payload, que permite seleccionar una imagen o crear una nueva en el storage existente; inserta `![alt](URL pública)` en la posición del cursor. La imagen destacada es una relación independiente.

`contentMarkdown` se guarda como una cadena PostgreSQL (columna `varchar` sin límite SQL), nunca como HTML, Rich Text o MDX. Los tags son un array de strings normalizados, no una Collection. Posts conserva hasta 10 versiones con autosave cada 15 segundos. `publishedAt` se establece en la primera publicación y no cambia al editar.

Las rutas `/blog` y `/blog/[slug]` leen únicamente contenido publicado mediante Local API con control de acceso explícito. Los DTO separan Payload de la UI. `react-markdown` + `remark-gfm` renderizan en servidor: HTML/JSX deshabilitado, enlaces con protocolos permitidos e imágenes restringidas a la URL pública del bucket configurado. El Markdown guarda URLs, no relaciones: antes de borrar Media, revisa sus referencias dentro de los artículos.

Los slugs inexistentes y borradores usan `notFound()` y `noindex`. Salvedad de Next.js con streaming/PPR: el navegador puede recibir HTTP 200 si ya se enviaron las cabeceras; las respuestas no transmitidas por streaming reciben HTTP 404. No se añadió un middleware ni otra consulta de existencia para alterar la arquitectura aprobada.

Cache Components usa las etiquetas `posts` y `post:<slug>`, revalidación temporal de 30 segundos y expiración de 60 segundos. Una publicación o cambio no requiere Git ni redeploy, pero puede tardar ese intervalo en reflejarse en una nueva consulta. Cada artículo incluye canonical, Open Graph y JSON-LD BlogPosting; el sitemap incluye solo publicaciones.

La migración incremental `20260904_222234_markdown_posts` agrega Posts, tags, versiones, índices y relaciones con Media. Las migraciones anteriores permanecen intactas. En una base cuyo esquema se creó con `push`, `migrate:status` puede indicar `No` aunque las tablas existan: no apliques las migraciones a ciegas sobre esa base. En una base gestionada por migraciones, se aplican manualmente con `pnpm payload:migrate`, nunca automáticamente desde Vercel.

`pnpm payload:validate-blog` valida el flujo con datos temporales contra la branch de desarrollo configurada y un servidor local en el puerto 3108 (`BLOG_TEST_BASE_URL` permite otro puerto local). Limpia los documentos que crea. `scripts/validate-blog-migration.ts` prueba up/down/up en una transacción revertida y debe ejecutarse únicamente sobre el esquema previo a Posts.

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

El repositorio ya está vinculado al proyecto Vercel `felipe-portfolio-next`; añade las variables por entorno. Tras el primer preview, crear una regla WAF limitada a `POST /api/contact`: comenzar con acción `log`, revisar falsos positivos y después aplicar en Preview el límite de 5 solicitudes por IP cada 15 minutos con respuesta `429`. Publicarla en producción solo después de validar el tráfico real.
