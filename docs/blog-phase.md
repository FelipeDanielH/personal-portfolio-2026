# Fase blog Markdown — validación de desarrollo

## Alcance implementado

Se conservaron Payload, Neon, Supabase y la landing. No hubo despliegue, push Git, acceso a producción ni migraciones automáticas.

- `posts`: title, slug único/indexado y editable, excerpt, contentMarkdown, featuredImage → Media, tags string[], publishedAt inicial inmutable, updatedAt y `_status` nativos. Máximo 10 versiones; autosave cada 15 segundos.
- Markdown canónico en `posts.content_markdown`, `varchar` PostgreSQL sin límite SQL (validación editorial: 200.000 caracteres). No HTML, MDX ni Rich Text como formato canónico. Payload representa el array de strings mediante su tabla hija estándar `posts_texts`.
- Textarea con selección de cursor e **Insertar Media**: drawer nativo para elegir o subir imágenes; inserta la URL pública y el alt escapado. La subida conserva el adapter server-side aprobado.
- Lectura: Payload Local API → repository → mapper/DTO → componentes de servidor. Acceso público explícito con `overrideAccess: false`, `draft: false` y filtro publicado. Sin HTTP interno público.
- Render: react-markdown + remark-gfm, `skipHtml`, URLs seguras, enlaces con `noopener noreferrer`, imágenes solo en el bucket público configurado y renderizadas con next/image.
- `/blog`: publicaciones por fecha descendente. `/blog/[slug]`: artículo publicado o `notFound()`.
- Cache Components: tags `posts` y `post:<slug>`, revalidación 30 s, expiración 60 s. Sin webhooks.
- Metadata por artículo: título, excerpt, canonical, Open Graph/Twitter, featured image, JSON-LD BlogPosting y sitemap publicado.

## Verificación funcional

Ejecutada con Chromium sobre el build optimizado servido únicamente en localhost:3108, contra los servicios de desarrollo configurados.

1. Creación de post draft: oculto en listado, artículo, Local API anónima y REST. Escritura REST anónima rechazada con 403; lectura REST del draft con 404.
2. Login de administrador temporal, edición real en Admin, selección de Media existente y creación/subida de otra imagen desde el drawer: correcto.
3. Inserción de ambas imágenes en Markdown y publicación desde Admin: correcto. `publishedAt` se asignó.
4. Listado y artículo visibles tras la actualización de cache: correcto. Se verificaron encabezados, listas, enlaces, código, tabla GFM, ausencia de script ejecutable, ambas imágenes cargadas desde Supabase, canonical, BlogPosting y sitemap.
5. Cambio de texto publicado sin rebuild ni redeploy: visible. `publishedAt` conservado. Un draft posterior no reemplazó la versión pública.
6. Limpieza: eliminados post, imágenes y administrador temporales. Auditoría posterior: `posts: []`, `media: []`, `users: []` para los marcadores exclusivos de esta fase, incluidos intentos anteriores.

## Migración

`20260904_222234_markdown_posts.ts` y snapshot JSON: tablas Posts, tags y versiones; enums, índices, claves foráneas a Media y relación de bloqueo de documentos. No modifica las migraciones anteriores.

Se verificó `up → down → up` en una transacción de desarrollo revertida, antes de sincronizar Posts con push. Se corrigió el down generado: eliminar la FK de documentos bloqueados antes de `DROP TABLE ... CASCADE`.

`pnpm payload:migrate:status` finalizó correctamente y mostró **Ran: No** para las tres migraciones. La base de desarrollo usa push y contiene las tablas; esto no equivale a haber registrado migraciones. No ejecutar el historial a ciegas sobre ella. Aplicación posterior manual en una base gestionada por migraciones: `pnpm payload:migrate`. No hay automatización en Vercel.

## Calidad

- `pnpm lint`: correcto, sin warnings ESLint.
- `pnpm typecheck`: correcto.
- `pnpm test`: 26 pruebas correctas, 7 archivos.
- `pnpm build`: correcto; `/blog` y `/blog/[slug]` con render parcial.
- `pnpm test:e2e -- --reporter=line`: 27 correctas, 1 omitida de la suite existente (caso de navegación móvil en escritorio).
- `pnpm payload:validate-blog`: correcto en ejecución final completa.
- `pnpm payload:migrate:status`: correcto; estado explicado arriba.
- `git diff --check`: correcto. Git advierte conversión LF/CRLF en Windows, no errores de whitespace.

También ejecutados: instalación de dependencias exactas, generación de tipos/import map y creación de migración. La validación de la migración está en `scripts/validate-blog-migration.ts`; solo debe ejecutarse sobre el esquema previo a Posts.

## Problemas encontrados y límites

- Corregidos límites Suspense requeridos por Cache Components para el listado y `usePathname` del menú en la nueva ruta dinámica. Sin rediseñar el header.
- Corregida identidad inestable del filtro del drawer, que causaba recargas repetidas. La revisión de React y Next.js se limitó a estos límites de render y al editor añadido.
- Una sesión de desarrollo fue invalidada por HMR de Turbopack durante cambios del editor. La prueba final se realizó sobre un build local estable.
- **Salvedad del criterio 404:** Next.js devuelve la página no encontrada y `noindex`, pero una respuesta ya transmitida con streaming puede conservar HTTP 200. Verificado: navegador 200/noindex; Twitterbot sin streaming 404/noindex. No se garantiza HTTP 404 para todos los clientes con esta estrategia PPR. Resolver esa exigencia estricta requiere decidir un cambio de estrategia de render, fuera de la reconstrucción de contexto solicitada.
- Avisos existentes: semántica futura de SSL de pg-connection-string y ausencia de adapter de email de Payload. No se modificaron credenciales ni integraciones para silenciarlos.
- Las imágenes inline son URLs dentro del Markdown, no FKs: borrar Media puede romper referencias editoriales. Revisarlas antes de eliminar archivos.

## Archivos de la fase

- Configuración: `package.json`, `pnpm-lock.yaml`, `payload.config.ts`.
- CMS: `src/payload/collections/Posts.ts`, `src/payload/admin/MarkdownField.tsx`, `src/payload/blog/{repository,mapper}.ts`, `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`, `src/app/(payload)/custom.css`.
- Blog: `src/features/blog/{types,editorial,urls,data}.ts`, `src/features/blog/{markdown,post-card}.tsx`, `src/app/(website)/blog/page.tsx`, `src/app/(website)/blog/[slug]/page.tsx`, `src/app/(website)/blog/styles.css`.
- Integración mínima: `src/components/navigation.ts`, `src/components/site-header.tsx`, `src/lib/site.ts`, `src/app/sitemap.ts`.
- Migración: `migrations/20260904_222234_markdown_posts.{ts,json}`, `migrations/index.ts`.
- Pruebas: `src/features/blog/blog.test.tsx`, `src/payload/schema.test.ts`, `tests/e2e/blog.spec.ts`, `scripts/validate-blog.ts`, `scripts/validate-blog-migration.ts`.
- Documentación: `README.md`, `docs/blog-phase.md`.

## Seguimiento posterior

Resolver/aceptar expresamente la salvedad HTTP 404, revisar el flujo editorial con contenido definitivo y preparar una estrategia de migraciones para el entorno objetivo.
