# Arquitectura, configuración y operación

Esta es la guía de reconstrucción y operación de Development, Preview y Production. El código, `package.json`, las migraciones y la configuración de los proveedores prevalecen si el repositorio evoluciona.

Para recorridos concretos como editar contenido, hacer un cambio visual, añadir una sección o corregir un bug, consulta el [Manual de uso y onboarding del portafolio](portfolio-onboarding.md).

## Índice

1. [Arquitectura final](#1-arquitectura-final)
2. [Entornos](#2-entornos)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Setup desde cero](#4-setup-desde-cero)
5. [Migraciones](#5-migraciones)
6. [Seed](#6-seed)
7. [Scripts operativos](#7-scripts-operativos)
8. [Deployment](#8-deployment)
9. [Payload Admin](#9-payload-admin)
10. [Media](#10-media)
11. [Blog](#11-blog)
12. [Contacto y Resend](#12-contacto-y-resend)
13. [SEO y dominios](#13-seo-y-dominios)
14. [Checklist de deploy](#14-checklist-de-deploy)
15. [Troubleshooting](#15-troubleshooting)

## 1. Arquitectura final

```text
Next.js 16
  -> Payload Local API
  -> Neon PostgreSQL

Payload Media
  -> @payloadcms/storage-s3
  -> Supabase Storage S3-compatible

Formulario de contacto
  -> Next.js Route Handler
  -> Resend
```

### Responsabilidades

- **Next.js:** rutas públicas, Server Components, Cache Components/PPR, metadata, sitemap, robots, Route Handler de contacto y montaje de Payload Admin.
- **Payload:** schemas, Admin `/admin`, autenticación de usuarios editoriales, access control, drafts/versiones, Local API, migraciones y coordinación de Media.
- **Neon:** documentos, usuarios, sesiones, versiones, metadata de Media, relaciones y registro de migraciones. No guarda los bytes de los archivos.
- **Supabase Storage:** objetos originales y tamaños derivados de Media. El acceso de escritura/borrado usa el endpoint S3; las lecturas públicas usan la URL del bucket público.
- **Vercel:** build y runtime de Next.js. Las variables se asignan con scope Development/Preview/Production. Vercel no ejecuta migraciones ni seed automáticamente.
- **Resend:** entrega los mensajes enviados a `POST /api/contact`. No es el adapter de email interno de Payload.

La web pública lee Payload con Local API. No debe hacer HTTP interno a su propia REST API. Las lecturas públicas usan `overrideAccess: false`, `draft: false` y filtros publicados cuando corresponde.

## 2. Entornos

### Development

- Archivo: `.env.local`.
- Base: Neon DEV, separada de Preview y Production.
- Storage: bucket DEV separado.
- Inicio normal: `pnpm dev`.
- `NODE_ENV` no es `production`, por lo que la configuración actual permite `push` de Drizzle para iteración local.

Development puede tener un schema sincronizado por `push` aunque `payload migrate:status` muestre migraciones sin ejecutar. No apliques el historial sobre esa base sin comprobar cómo fue creada.

### Preview

- Archivo operativo local: `.env.preview.local`.
- Base: Neon Preview independiente.
- Storage: bucket público `portfolio-preview`.
- Runtime: Vercel Preview con variables de scope Preview.
- Operación: comandos `pnpm preview:*`.

Los comandos Preview cargan exclusivamente `.env.preview.local`, limpian variables heredadas de aplicación, fuerzan `NODE_ENV=production` y por ello mantienen `push=false`.

`preview:env:check` necesita también `.env.local` para comparar identidades. El runner bloquea si faltan las ocho variables necesarias para Payload; el check reporta cuántas de las 12 variables end-to-end están presentes, pero actualmente no falla solo porque falte una variable de contacto o `NEXT_PUBLIC_SITE_URL`.

### Production

- Archivo operativo local: `.env.production.local`.
- Base: Neon Production independiente.
- Storage: bucket público `portfolio-production`.
- Runtime: Vercel Production, siguiendo `main`.
- Operación: comandos `pnpm production:*`.

Usa la conexión **direct** de Neon Production en `.env.production.local` para operaciones administrativas locales como migraciones. Vercel Production usa la conexión **pooled** para el runtime. No copies una URL de un entorno a otro.

`production:env:check` carga `.env.local` y `.env.preview.local` únicamente para demostrar que las identidades difieren; por eso los tres archivos deben existir al ejecutar ese check. Los comandos `production:migrate:*`, `production:seed` y `production:validate-content` cargan exclusivamente `.env.production.local`.

### Regla común

La aplicación solo conoce nombres como `DATABASE_URL`, `PAYLOAD_SECRET` o `SUPABASE_STORAGE_BUCKET`. No existen `DATABASE_URL_DEV` ni `DATABASE_URL_PREVIEW` en el código. El aislamiento ocurre al cargar el archivo correcto o mediante scopes de Vercel.

`.env.local`, `.env.preview.local` y `.env.production.local` están ignorados por Git. Nunca deben versionarse.

## 3. Variables de entorno

| Variable | Propósito |
| --- | --- |
| `DATABASE_URL` | Conexión PostgreSQL del entorno. Runtime Vercel: pooled; operaciones locales Production: direct. |
| `PAYLOAD_SECRET` | Firma de autenticación y datos sensibles de Payload. Debe ser largo, aleatorio y distinto por entorno. |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket del entorno. |
| `SUPABASE_STORAGE_REGION` | Región que usa el cliente S3-compatible. |
| `SUPABASE_STORAGE_ACCESS_KEY_ID` | Access key S3 server-side. |
| `SUPABASE_STORAGE_SECRET_ACCESS_KEY` | Secret key S3 server-side. |
| `SUPABASE_STORAGE_ENDPOINT` | Endpoint S3 de Supabase, con ruta `/storage/v1/s3`. |
| `SUPABASE_STORAGE_PUBLIC_URL` | Base pública del bucket para URLs de Media. |
| `RESEND_API_KEY` | Credencial server-side de Resend. |
| `CONTACT_TO_EMAIL` | Destinatario del formulario. |
| `CONTACT_FROM_EMAIL` | Remitente autorizado; su dominio debe estar verificado en Resend. |
| `NEXT_PUBLIC_SITE_URL` | Origen público del entorno; alimenta URLs, metadata y validación de origen. |

La URL pública correcta de Supabase termina así:

```text
https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>
```

No uses `/rest/v1/object/public/...`; esa ruta no es la API pública de objetos y provoca respuestas 401.

No documentes ni copies valores reales en Git, tickets o logs. Cuando roten credenciales, actualiza tanto el archivo local correspondiente como el scope correcto de Vercel cuando aplique.

## 4. Setup desde cero

Los pasos marcados como **manual** se realizan en el proveedor. Los comandos se ejecutan desde la raíz del repositorio.

### 1. Instalar herramientas y dependencias

**Manual:** instala Node.js 24 y habilita Corepack.

```bash
corepack enable
pnpm install
```

### 2. Preparar el archivo de entorno

Para Development:

```bash
copy .env.example .env.local
```

Para Preview o Production crea manualmente `.env.preview.local` o `.env.production.local`. No copies esos archivos al repositorio. Completa las 12 variables de la sección anterior.

### 3. Crear Neon

**Manual:** crea un proyecto/base independiente para el entorno. Nunca reutilices DEV, Preview o Production entre sí.

- Runtime Vercel: configura la URL pooled en `DATABASE_URL` del scope correspondiente.
- Operaciones locales Production: configura la URL direct en `.env.production.local`.
- Verifica el host sin imprimir usuario, contraseña ni query string.

### 4. Crear Supabase Storage

**Manual:** crea un bucket exclusivo y márcalo como público para las lecturas de Media.

- Preview: `portfolio-preview`.
- Production: `portfolio-production`.
- Development: usa un bucket diferente de ambos.

### 5. Configurar S3-compatible

**Manual:** obtiene endpoint, región y credenciales S3 del proyecto Supabase. Configura las seis variables `SUPABASE_STORAGE_*`.

Comprueba que el project-ref del endpoint S3 y el de `SUPABASE_STORAGE_PUBLIC_URL` coincidan, y que la URL pública termine con el bucket correcto.

### 6. Generar `PAYLOAD_SECRET`

Genera un secreto distinto por entorno y guárdalo únicamente en el archivo/env scope correspondiente. Por ejemplo:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

El comando imprime un valor nuevo: trátalo como secreto y no lo copies a documentación o commits.

### 7. Configurar Resend

**Manual:** verifica el dominio remitente en Resend, crea una API key y define `RESEND_API_KEY`, `CONTACT_TO_EMAIL` y `CONTACT_FROM_EMAIL`. Configura `NEXT_PUBLIC_SITE_URL` con el origen exacto del entorno.

### 8. Aplicar migraciones

Primero verifica el entorno y el estado; aplica una sola vez; verifica de nuevo.

Preview:

```bash
pnpm preview:env:check
pnpm preview:migrate:status
pnpm preview:migrate
pnpm preview:migrate:status
```

Production:

```bash
pnpm production:env:check
pnpm production:migrate:status
pnpm production:migrate
pnpm production:migrate:status
```

Si el estado inicial no coincide con lo esperado, detente. No uses `push` como reparación.

### 9. Ejecutar el bootstrap inicial

Solo en una base nueva sin contenido editorial real:

```bash
pnpm preview:seed
# o, con autorización explícita:
pnpm production:seed
```

No repitas el seed de Production por rutina: actualiza documentos que comparten stable keys.

### 10. Validar contenido

```bash
pnpm preview:validate-content
# o
pnpm production:validate-content
```

### 11. Ejecutar calidad y build

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

`pnpm build` usa la resolución normal de variables de Next.js y puede consultar Payload durante el prerender. Confirma primero qué env está activo. Los ejecutores `preview:*` y `production:*` no ofrecen un comando de build arbitrario.

### 12. Desplegar

**Manual/Git:** sube una branch para obtener Preview, valida el deployment y después mergea a `main`. El push de `main` dispara Production. No agregues migrate o seed al build de Vercel.

## 5. Migraciones

`payload.config.ts` define:

```text
push = NODE_ENV !== "production"
```

- Development puede usar `push` para iteración local.
- Preview y Production ejecutan con `NODE_ENV=production`, por lo que `push=false`.
- Nunca uses Drizzle/Payload push para preparar Preview o Production.
- Las migraciones son explícitas y versionadas en `migrations/`.
- Vercel build/deploy no ejecuta migraciones.

Flujo seguro:

```text
migrate:status -> revisar destino -> migrate -> migrate:status
```

Migraciones actuales, en orden:

1. `20260903_145532_initial_payload_schema`
2. `20260903_160937_stable_content_keys`
3. `20260904_222234_markdown_posts`

Cada migración nueva debe incluir el archivo `.ts`, su snapshot `.json` y el registro en `migrations/index.ts`. Valida el historial en una base desechable vacía antes de Preview/Production.

No apliques el historial a ciegas sobre una base Development creada mediante `push`: puede contener las tablas sin registros en `payload_migrations`.

## 6. Seed

`scripts/seed-payload.ts` usa Payload Local API y `src/content/fallback.ts`. El algoritmo busca por stable key y crea o actualiza el documento correspondiente; no borra documentos ajenos.

Contenido esperado:

- Site Settings publicado.
- 4 Skill Categories.
- 3 Experiences.
- 4 Projects.
- 4 Credentials.
- Stable keys únicas, sin duplicados.

El seed es idempotente respecto de esas keys, pero **puede sobrescribir cambios editoriales de documentos con las mismas keys**. Úsalo para bootstrap inicial o recuperación deliberada, no como tarea rutinaria de Production.

`validate-content` compara el DTO público publicado con la fuente inicial y verifica conteos, estados y keys. Si el contenido editorial evoluciona intencionalmente después del bootstrap, esa comparación exacta también deberá evolucionar o dejará de ser una validación adecuada.

El seed no crea Posts ni Media y no escribe objetos en Storage.

## 7. Scripts operativos

### Preview

| Comando | Efecto |
| --- | --- |
| `pnpm preview:env:check` | Compara identidades DEV/Preview y reporta aislamiento, conteo de variables, `NODE_ENV=production` y `push=false`. |
| `pnpm preview:migrate:status` | Consulta migraciones de Neon Preview. |
| `pnpm preview:migrate` | Aplica migraciones pendientes a Neon Preview. |
| `pnpm preview:seed` | Ejecuta el bootstrap en Preview. |
| `pnpm preview:validate-content` | Lee y valida el contenido publicado de Preview. |

### Production

| Comando | Efecto |
| --- | --- |
| `pnpm production:env:check` | Confirma variables, Neon, bucket y aislamiento frente a DEV/Preview. |
| `pnpm production:migrate:status` | Consulta migraciones de Neon Production. |
| `pnpm production:migrate` | Aplica migraciones pendientes a Neon Production. |
| `pnpm production:seed` | Ejecuta el bootstrap en Production; requiere autorización deliberada. |
| `pnpm production:validate-content` | Lee y valida el contenido publicado de Production. |

### Protecciones

- Cargan exclusivamente `.env.preview.local` o `.env.production.local`.
- Fallan si falta el archivo objetivo; no caen silenciosamente a `.env.local`.
- Eliminan variables de aplicación heredadas antes de cargar el entorno objetivo.
- Fuerzan `NODE_ENV=production`; Payload queda con `push=false`.
- Production exige las 12 variables para cualquiera de sus comandos. Preview exige las ocho variables de Payload; las cuatro restantes deben completarse para build, contacto y validación end-to-end.
- Preview solo permite invocar el binario Payload mediante su runner y expone los comandos previstos desde `package.json`.
- Production aplica además una allowlist exacta: status, migrate, seed y validate-content.
- Los checks comparan identidades sin imprimir connection strings, access keys ni secretos.

Los validadores `payload:validate-storage` y `payload:validate-blog` crean y eliminan datos/objetos. Son herramientas destructivas de validación y no deben ejecutarse como auditorías read-only ni contra Production sin una autorización específica.

## 8. Deployment

Flujo normal:

```text
feature/fix branch
  -> push de la branch
  -> Vercel Preview
  -> validación funcional y logs
  -> merge controlado a main
  -> push de main
  -> Vercel Production automático
```

- Production sigue `main`.
- Prefiere fast-forward cuando corresponda; si no, merge normal.
- No squash/rebase/force push en el flujo validado.
- No promociones manualmente un deployment si el deployment Git de `main` ya representa el commit aprobado.
- Verifica siempre branch, commit, target y aliases del deployment.

Para cambios de schema:

```text
schema + migración versionada
  -> validar historial en base desechable
  -> Preview migrate
  -> Preview deploy y validación
  -> Production migrate
  -> merge/push main
  -> Production deploy
```

Production migrate antes del deploy solo es seguro cuando la migración es compatible con el runtime que aún está activo. Si el cambio requiere coordinación expand/contract, diseña explícitamente ese despliegue; no asumas que todas las migraciones pueden adelantarse.

## 9. Payload Admin

- Admin: `/admin`.
- Si `users` está vacío, `/admin/create-first-user` permite crear el primer administrador.
- Después, crear, leer, actualizar y eliminar usuarios requiere autenticación.
- `users` no usa drafts.
- `media` es públicamente legible, pero escribir o borrar requiere autenticación.
- Site Settings, Skill Categories, Experiences, Projects, Credentials y Posts soportan drafts/versiones.

El acceso público se restringe a `_status = published`. Los administradores autenticados pueden ver y editar drafts. La web pública usa Local API con access control activo; nunca debe solicitar drafts.

Estados distintos:

- `_status`: campo nativo de Payload para workflow `draft`/`published`.
- `projectStatus`: estado editorial del proyecto, por ejemplo completado o en desarrollo.
- `credentialStatus`: estado editorial de una formación/certificación.

`projectStatus` y `credentialStatus` no controlan visibilidad pública. No añadas manualmente otro `_status`; Payload lo genera al habilitar drafts.

Site Settings bloquea además las lecturas anónimas con `draft=true`; un administrador autenticado sí puede leerlas.

## 10. Media

- Neon guarda el documento Media: alt, nombre, MIME, dimensiones, URLs, tamaños y relaciones.
- Supabase Storage guarda original, `thumbnail` y `card` cuando aplica.
- La integración usa `@payloadcms/storage-s3`; no necesita el SDK de Supabase para el flujo normal.
- El bucket debe ser público para que las URLs públicas y `next/image` funcionen.
- Upload y delete usan credenciales S3 server-side aunque las lecturas sean públicas.

Invariantes actuales:

```text
clientUploads = false
disableLocalStorage = true
forcePathStyle = true
```

No agregues fallback al filesystem. Una configuración incompleta debe fallar claramente.

Al borrar un documento Media, el adapter elimina sus objetos remotos. Antes de borrar, revisa relaciones de Payload y referencias Markdown.

La imagen destacada de un Post es una relación con Media. En cambio, una imagen insertada dentro de Markdown es una URL de texto, no una FK. **Eliminar Media usada inline puede romper el artículo aunque Payload no muestre una relación.** Busca la URL en Posts antes de borrar.

## 11. Blog

- Fuente canónica: `contentMarkdown` en PostgreSQL.
- No se guarda HTML, MDX ni Rich Text como contenido canónico.
- El renderer usa `react-markdown` y GFM; ignora HTML crudo, restringe protocolos y solo permite imágenes bajo la base pública configurada de Supabase.
- Posts usa drafts, autosave, versiones, slug único, tags normalizados, fecha de primera publicación e imagen destacada opcional.
- Las lecturas públicas usan Payload Local API con `overrideAccess: false`, `draft: false` y `_status=published`.
- `/blog`, `/blog/[slug]`, metadata, Open Graph/Twitter, JSON-LD y sitemap solo exponen publicaciones.

### Cache Components/PPR

`next.config.ts` mantiene `cacheComponents: true`. Las lecturas usan:

```text
stale: 0
revalidate: 30 segundos
expire: 60 segundos
```

Tags:

```text
posts
post:<slug>
```

Los hooks de Posts llaman `revalidateTag(tag, { expire: 0 })` al crear/publicar, actualizar, publicar→draft, cambiar slug y eliminar. Invalidan:

- `posts`, para el listado y sitemap;
- `post:<slug actual>`;
- `post:<slug anterior>` cuando el slug cambia.

El TTL permanece como red de seguridad; las mutaciones no dependen de esperar el TTL completo.

### Decisión HTTP 404

Con PPR/streaming, Next.js puede enviar `200 OK` al comenzar el stream. Si después se ejecuta `notFound()`, renderiza la UI 404 e inyecta `noindex`, pero ya no puede cambiar las cabeceras a 404. Este trade-off fue investigado, validado y aceptado. No es un bug pendiente ni debe “corregirse” desactivando globalmente Cache Components.

## 12. Contacto y Resend

Flujo:

```text
formulario -> POST /api/contact -> validación/seguridad -> Resend
```

El Route Handler:

- acepta solo POST;
- valida y normaliza con Zod;
- limita longitudes de nombre, email, empresa, asunto y mensaje;
- exige un `Origin` propio o igual a `NEXT_PUBLIC_SITE_URL`;
- usa el campo `website` como honeypot y responde 202 sin enviar si viene lleno;
- genera una idempotency key diaria a partir del contenido;
- responde 202 cuando Resend acepta, 403 para origen inválido, 422 para input inválido y 503 si el proveedor no está disponible;
- no devuelve secretos ni errores internos del proveedor.

Entrega:

- sender: `CONTACT_FROM_EMAIL`;
- recipient: `CONTACT_TO_EMAIL`;
- `replyTo`: email validado del visitante.

El warning `No email adapter provided` pertenece al subsistema interno de Payload (por ejemplo recuperación de contraseña). No afecta el formulario: este usa Resend directamente mediante `src/features/contact/send-contact.ts`.

Las defensas en código son Zod, origin check, honeypot e idempotencia. El rate limiting por IP, si se configura, pertenece a Vercel Firewall/WAF; no existe un rate limiter distribuido dentro de la aplicación.

## 13. SEO y dominios

Dominio canónico:

```text
https://www.felipehenriquez.dev
```

`NEXT_PUBLIC_SITE_URL` debe ser ese origen exacto en Production. Alimenta `metadataBase`, canonicals, sitemap, robots y comprobación de origen del formulario.

Site Settings publicado aporta nombre, rol, SEO title y SEO description. La metadata global conserva defaults seguros cuando faltan valores. Las páginas específicas pueden definir metadata estructural propia.

El sitio mantiene:

- canonical por ruta;
- `metadataBase` `.dev`;
- Open Graph y Twitter;
- sitemap con rutas públicas y Posts publicados;
- robots apuntando al sitemap `.dev`;
- JSON-LD `Person`/`BlogPosting` con contenido publicado.

El dominio `.xyz` puede seguir asignado como alias histórico/alternativo en Vercel, pero no es canonical y no debe aparecer en metadata, sitemap o robots.

Un draft de Site Settings no cambia la web ni la metadata pública. La lectura pública usa exclusivamente la versión publicada y el caché del portafolio tiene revalidación de 60 segundos y expiración de 3600 segundos.

## 14. Checklist de deploy

### Antes de Production

- [ ] `git status --short --branch` muestra el árbol esperado y sin secretos.
- [ ] `.env.local`, `.env.preview.local` y `.env.production.local` no están rastreados.
- [ ] `pnpm lint` pasa.
- [ ] `pnpm typecheck` pasa.
- [ ] `pnpm test` pasa.
- [ ] `git diff --check` pasa.
- [ ] `pnpm build` termina con exit code 0 usando el entorno intencional.
- [ ] `preview:env:check` y/o `production:env:check` confirman aislamiento.
- [ ] `migrate:status` fue revisado en el destino correcto.
- [ ] Las migraciones pendientes se aplicaron explícitamente y el status final es correcto.
- [ ] `validate-content` es correcto cuando todavía aplica la equivalencia exacta con el seed.
- [ ] Preview del commit exacto está aprobado, incluidos Admin, drafts, Media, Blog, contacto y logs.

### Después de Production

- [ ] Deployment `READY`, target Production, branch `main` y commit exacto.
- [ ] `/`, `/sobre-mi`, `/habilidades`, `/experiencia`, `/proyectos`, `/formacion` y `/blog` responden 200.
- [ ] `/admin` carga; `/studio` responde 404.
- [ ] Canonicals, metadata, sitemap y robots usan `.dev` y no localhost.
- [ ] Admin login/account/logout funcionan.
- [ ] Media crea original/thumbnail/card, sirve URLs públicas y elimina objetos remotos.
- [ ] Blog oculta drafts e invalida lista, detalle, slug anterior y deletes sin esperar el TTL.
- [ ] Site Settings protege drafts y una publicación se refleja tras la revalidación prevista.
- [ ] Contacto responde 202 y Resend acepta; no afirmar inbox sin comprobarlo.
- [ ] Runtime logs no contienen 5xx ni errores Payload/PostgreSQL/Supabase/Resend/cache.
- [ ] Se eliminaron usuarios, Posts, Media, relaciones y objetos temporales; Site Settings fue restaurado.

## 15. Troubleshooting

### Media pública responde 401

Síntoma: el objeto existe y el bucket es público, pero la URL usa `/rest/v1/object/public/...`.

Solución: corrige `SUPABASE_STORAGE_PUBLIC_URL` a:

```text
/storage/v1/object/public/<bucket>
```

Después requiere un deployment nuevo para que Next/Payload usen la variable corregida.

### Payload Admin falla solo en un deployment

Síntoma observado: formularios de autenticación fallaban en Vercel mientras el build local Production, schema y configuración resuelta eran correctos.

Procedimiento: antes de cambiar código, crea un redeploy limpio del mismo commit sin reutilizar cache cuando sea posible y compara deployment, logs y rutas. El incidente validado desapareció en el deployment limpio y se clasificó como artefacto/cache inconsistente.

### Blog conserva contenido stale

Causa histórica: `cacheTag` etiquetaba lecturas, pero las mutaciones de Posts no invalidaban esas etiquetas.

Solución vigente: hooks `afterChange`/`afterDelete` llaman:

```text
revalidateTag(tag, { expire: 0 })
```

Se invalidan `posts`, el slug actual y el slug anterior. No elimines el TTL ni desactives PPR.

### Elegir conexión Neon

- Pooled: runtime Vercel, con muchas invocaciones concurrentes.
- Direct: migraciones/operaciones locales Production mediante `.env.production.local`.

Confirma siempre el host/base destino antes de una operación que escriba schema o contenido.

### Warning SSL de `pg`

El runtime puede advertir sobre el cambio futuro de semántica de `sslmode=require` en próximas versiones mayores de `pg`/`pg-connection-string`. Actualmente es conocido y no bloqueante. Revísalo al actualizar esas dependencias; no alteres parámetros de conexión sin validar Neon y todos los entornos.

### Warning de email adapter de Payload

`No email adapter provided` no rompe el formulario de contacto porque Resend está integrado directamente en su Route Handler. Sí indica que funciones internas de Payload que necesiten email, como recuperación de contraseña, no tienen proveedor configurado.

### Build parece bloqueado durante generación

El prerender consulta Payload. Verifica primero que la base seleccionada tenga migraciones y contenido inicial publicado, especialmente Site Settings. No agregues fallback silencioso ni uses `push` para ocultar una base vacía.
