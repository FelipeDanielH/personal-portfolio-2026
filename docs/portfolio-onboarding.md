# Manual de uso y onboarding del portafolio

Esta guía responde una pregunta práctica: **“quiero hacer X, ¿qué pasos sigo?”**. Para entender arquitectura, variables, migraciones, despliegues y recuperación en profundidad, consulta [Arquitectura, configuración y operación](operations.md).

El principio que evita la mayoría de los errores es simple:

> Edita contenido en Payload, cambia presentación en React/CSS y modifica el modelo solo con schema, tipos, migración y validación por entornos.

## Índice

1. [Empezar desde cero](#1-empezar-desde-cero)
2. [Mapa mental del proyecto](#2-mapa-mental-del-proyecto)
3. [Árbol de decisión](#3-árbol-de-decisión)
4. [Tareas editoriales cotidianas](#4-tareas-editoriales-cotidianas)
5. [Cambios visuales](#5-cambios-visuales)
6. [Añadir una sección nueva](#6-añadir-una-sección-nueva)
7. [Cambios estructurales en Payload](#7-cambios-estructurales-en-payload)
8. [Modificar el Blog](#8-modificar-el-blog)
9. [Trabajar con Media](#9-trabajar-con-media)
10. [Modificar el formulario de contacto](#10-modificar-el-formulario-de-contacto)
11. [Añadir o cambiar variables de entorno](#11-añadir-o-cambiar-variables-de-entorno)
12. [Flujo normal de desarrollo](#12-flujo-normal-de-desarrollo)
13. [Corregir un bug](#13-corregir-un-bug)
14. [Actualizar dependencias](#14-actualizar-dependencias)
15. [Cambiar arquitectura](#15-cambiar-arquitectura)
16. [Revertir un cambio](#16-revertir-un-cambio)
17. [Funciona localmente, pero falla en Preview o Production](#17-funciona-localmente-pero-falla-en-preview-o-production)
18. [Checklist si tienes miedo de romper Production](#18-checklist-si-tienes-miedo-de-romper-production)
19. [Tabla rápida cambio → impacto](#19-tabla-rápida-cambio--impacto)
20. [Volver al proyecto después de meses](#20-volver-al-proyecto-después-de-meses)

## 1. Empezar desde cero

### Primera apertura del repositorio

1. Si aún no tienes el repositorio, clónalo desde el remote autorizado y entra a su carpeta. Si ya existe, ábrelo sin borrar ni sobrescribir el checkout actual:

   ```bash
   git clone https://github.com/FelipeDanielH/personal-portfolio-2026.git portafolio-definitivo
   cd portafolio-definitivo
   ```

2. Abre una terminal en la raíz del proyecto.
3. Comprueba el estado antes de tocar archivos:

   ```bash
   git status --short --branch
   git branch --show-current
   git log --oneline -10
   git diff --stat
   ```

4. Instala Node.js 24, habilita Corepack e instala dependencias:

   ```bash
   corepack enable
   pnpm install
   ```

5. Si no existe `.env.local`, créalo desde el ejemplo y completa sus valores de Development:

   ```bash
   copy .env.example .env.local
   ```

6. Verifica que `.env.local` esté ignorado. No abras ni imprimas secretos para comprobarlo:

   ```bash
   git check-ignore .env.local
   ```

7. Inicia Development:

   ```bash
   pnpm dev
   ```

8. Comprueba `/`, `/blog` y `/admin` en `http://localhost:3000`.

### Qué entorno estás usando

- `pnpm dev` usa `.env.local`: **Development**.
- `pnpm preview:*` usa exclusivamente `.env.preview.local`: **Preview**.
- `pnpm production:*` usa exclusivamente `.env.production.local`: **Production**.
- Los scopes de Vercel determinan el entorno de cada deployment.

No cambies `DATABASE_URL` a mano para “apuntar temporalmente” a otro entorno. Usa el comando explícito del entorno. Los checks `preview:env:check` y `production:env:check` comparan identidades sin revelar credenciales; consulta [Entornos](operations.md#2-entornos) para sus requisitos.

### Primer usuario administrador

Si la colección `users` está vacía, abre `/admin/create-first-user`. Ese alta solo está permitida mientras no exista ningún usuario. En un entorno compartido o real, confirma primero que estás en el dominio y base correctos.

## 2. Mapa mental del proyecto

Piensa en cuatro capas:

| Capa | Qué contiene | Fuente principal |
| --- | --- | --- |
| Contenido | Perfil, habilidades, experiencia, proyectos, formación, posts y Media | Payload Admin y Neon |
| Presentación | Páginas, componentes, navegación, estilos y Markdown renderizado | `src/app/`, `src/components/`, `src/features/` |
| Integración | Payload, Storage, contacto, cache y mappers | `payload.config.ts`, `src/payload/`, `src/features/contact/` |
| Operación | Entornos, migraciones, seed, validadores y deploy | `scripts/`, `migrations/`, `package.json`, Vercel |

Recorrido del contenido público del portafolio:

```text
Payload Collections/Global
  -> src/payload/portfolio/repository.ts
  -> src/payload/portfolio/mapper.ts
  -> src/content/types.ts
  -> src/content/data.ts
  -> páginas y componentes
```

Recorrido del Blog:

```text
Posts de Payload
  -> src/payload/blog/repository.ts
  -> src/payload/blog/mapper.ts
  -> src/features/blog/data.ts
  -> /blog y /blog/[slug]
```

Neon guarda documentos, versiones, usuarios, metadata y relaciones. Supabase Storage guarda los bytes de Media. Vercel ejecuta la aplicación. Resend solo entrega el formulario de contacto.

Regla corta para orientarte:

```text
Contenido editorial       -> Payload
Presentación/comportamiento -> código
Schema                    -> código + migración
Infraestructura/env       -> proveedor + variables
```

## 3. Árbol de decisión

```text
¿Solo cambia texto, orden, enlaces, imagen o un artículo ya modelado?
  Sí -> usa /admin; publica; no requiere commit ni deploy.
  No
   |
   +-- ¿Solo cambia aspecto o interacción?
   |     -> modifica React/CSS; branch -> tests -> Preview -> main.
   |
   +-- ¿Necesitas guardar un dato nuevo?
   |     -> cambia schema Payload + tipos/mappers/UI + migración.
   |
   +-- ¿Necesitas una lista administrable de elementos?
   |     -> evalúa una Collection.
   |
   +-- ¿Es una configuración única del sitio?
   |     -> evalúa un Global o reutiliza site-settings.
   |
   +-- ¿Cambia proveedor, persistencia, cache, auth o deploy?
         -> es arquitectura; escribe decisión, riesgos y rollback antes de implementar.
```

Antes de crear un campo, pregunta: “¿esto ya existe en `site-settings` o en otra Collection?”. Antes de crear una Collection, pregunta: “¿realmente necesito varios documentos con CRUD independiente?”. Mantén KISS.

## 4. Tareas editoriales cotidianas

Estas tareas se hacen en `/admin`. No requieren deploy mientras no cambie el schema ni el código. Site Settings y las cinco Collections editoriales tienen drafts/versiones; `media` y `users` no.

| Quiero hacer | Dónde | Pasos mínimos | ¿Deploy? | Validación y riesgo principal |
| --- | --- | --- | --- | --- |
| Cambiar presentación personal | Global `site-settings` | Editar nombre/rol/eyebrow/summary/bio → draft → publicar | No | Revisar portada, header/footer y metadata; un draft no debe verse |
| Cambiar “Sobre mí” | Global `site-settings` → `aboutSections` | Editar párrafos manteniendo anchors únicos → publicar | No | Revisar `/sobre-mi`; cambiar un anchor puede romper navegación |
| Agregar/editar/eliminar habilidad | `skill-categories` | Abrir categoría → editar `skills`; o crear/eliminar categoría → publicar | No | Revisar `/habilidades`, `order` y `key`; al borrar se pierde su versión pública |
| Agregar experiencia | `experiences` | Crear documento → completar listas y orden → publicar | No | Revisar `/experiencia`; no duplicar `key` |
| Agregar proyecto | `projects` | Crear → completar datos/imagen/enlaces/estado → publicar | No | Revisar portada y `/proyectos`; distinguir `projectStatus` de `_status` |
| Agregar formación/certificación | `credentials` | Crear → elegir tipo/estado → completar datos → publicar | No | Revisar `/formacion`; validar URL del certificado |
| Modificar Site Settings | Global `site-settings` | Editar el bloque correspondiente → guardar draft → publicar | No | Revisar todas las rutas que consumen perfil; puede tardar la revalidación |
| Cambiar SEO básico | `site-settings` → `seo` | Editar title/description → publicar | No | Revisar metadata/OG/JSON-LD; respetar 60/160 caracteres |
| Crear artículo | `posts` | Crear → título/extracto/Markdown/tags → draft → publicar | No | Draft oculto; lista, detalle y sitemap al publicar |
| Editar artículo | `posts` | Abrir → editar → guardar/publicar | No | El hook debe refrescar lista y detalle inmediatamente |
| Publicar/despublicar | `posts` | Cambiar `_status` published/draft | No | El detalle y la lista deben aparecer/desaparecer; no confundir con autosave |
| Cambiar slug | `posts` → `slug` | Editar con minúsculas/números/guiones → publicar | No | URL nueva visible y anterior invalidada; enlaces externos viejos dejarán de resolver |
| Añadir imagen destacada | `posts` → `featuredImage` | Subir/seleccionar Media → publicar | No | Revisar tarjeta/detalle y URL pública; es una relación Payload |
| Insertar imagen inline | `posts` → `contentMarkdown` | Colocar cursor → “Insertar Media” → elegir/crear imagen → publicar | No | Revisar render y alt; queda una URL en Markdown, no una relación |
| Subir/eliminar Media | `media` | Crear Archivo con alt; antes de borrar, quitar relaciones y buscar URL en Markdown | No | Original/derivados 200; borrar puede romper Posts aunque no figure como relación |

### Perfil, presentación, contacto público y SEO

Ruta: `/admin/globals/site-settings`.

1. Edita nombre, rol, línea superior, propuesta de valor, biografía, ubicación o disponibilidad.
2. Para “Sobre mí”, edita `aboutSections`. Conserva identificadores `anchor` únicos y estables si ya están enlazados desde la UI.
3. Para contacto visible, edita correo o teléfono públicos. Esto **no** cambia `CONTACT_TO_EMAIL` ni el envío de Resend.
4. Para enlaces sociales, usa URLs completas `http` o `https`.
5. Para avatar o CV, sube primero el archivo a Media o selecciónalo desde la relación.
6. Para SEO general, completa `seo.title` y `seo.description` dentro de sus límites.
7. Guarda como draft para revisar sin afectar la web; publica para hacerlo público.

La web, metadata global, Open Graph/Twitter y JSON-LD consumen la versión publicada. Un draft anónimo está bloqueado. El contenido general usa una cache con revalidación de 60 segundos; un cambio publicado puede no aparecer en el primer refresh inmediato.

### Habilidades

Ruta: `/admin/collections/skill-categories`.

1. Crea o abre una categoría.
2. Mantén una `key` estable y única; no la cambies solo por renombrar el título.
3. Edita título, descripción, orden y la lista de habilidades/conceptos.
4. Guarda draft o publica.

La página `/habilidades` ordena por `order`. Una key duplicada rompe la identidad estable esperada por seed y validadores.

### Experiencia

Ruta: `/admin/collections/experiences`.

Edita cargo, empresa, periodo, ubicación, resumen, responsabilidades, logros, tecnologías, tipo de proyecto y orden. Publica para que aparezca en `/experiencia`.

### Proyectos

Ruta: `/admin/collections/projects`.

1. Completa nombre, resumen corto, descripción, tecnologías, frameworks, lenguajes, roles y enlaces.
2. Elige una imagen existente de Media si corresponde.
3. Usa `projectStatus` para “Completado” o “En desarrollo”. Ese campo describe el proyecto; `_status` controla draft/publicación.
4. Usa `featured` para destacar y `order` para ordenar.
5. Publica y revisa `/proyectos` y la portada.

### Formación y certificaciones

Ruta: `/admin/collections/credentials`.

Elige tipo, título, institución, año, fecha, descripción, detalles, habilidades, enlace de certificado y orden. `credentialStatus` describe si está completado o en progreso; no reemplaza el estado de publicación `_status`.

### Blog

Ruta: `/admin/collections/posts`.

1. Crea título y extracto.
2. Deja `slug` vacío para derivarlo del título o define uno con minúsculas, números y guiones.
3. Escribe Markdown en `contentMarkdown`.
4. Añade tags; Payload los normaliza.
5. Selecciona imagen destacada si procede.
6. Guarda draft y visita la URL pública: no debe mostrarlo.
7. Publica y comprueba `/blog` y `/blog/<slug>`.

La publicación, actualización, cambio de slug, vuelta a draft y eliminación invalidan lista y detalle explícitamente; no hace falta redeploy.

### Eliminar contenido

Antes de borrar:

- Confirma que estás en el entorno correcto.
- Quita relaciones hacia el documento o archivo.
- En Media, busca también URLs insertadas directamente en Markdown; no son relaciones de Payload.
- Prefiere despublicar o guardar una versión recuperable cuando no tengas certeza.

## 5. Cambios visuales

Un cambio visual sí requiere código y deploy, pero normalmente no requiere migración.

Puntos de entrada habituales:

- Estilos globales: `src/app/globals.css`.
- Layout público: `src/app/(website)/layout.tsx`.
- Páginas: `src/app/(website)/*/page.tsx`.
- Header, footer y navegación: `src/components/site-header.tsx`, `site-footer.tsx`, `navigation.ts`, `desktop-navigation.tsx`, `mobile-navigation.tsx`.
- Tarjetas y piezas reutilizables: `src/components/`.
- Blog: `src/app/(website)/blog/styles.css`, `src/features/blog/post-card.tsx`, `src/features/blog/markdown.tsx`.

| Caso | Empieza por | Migración |
| --- | --- | --- |
| Cambiar estilos o responsive | `src/app/globals.css` y CSS local de la ruta | No |
| Cambiar un componente | Componente en `src/components/` y sus consumidores | No |
| Modificar una sección existente | Su `page.tsx`, componentes y DTO que ya recibe | No, si no agregas datos persistidos |
| Cambiar header/footer | `site-header.tsx`, `site-footer.tsx` y `navigation.ts` | No |
| Añadir interacción | Componente cliente más pequeño posible; conserva Server Components alrededor | No |
| Cambiar Blog visual | `src/app/(website)/blog/styles.css` y `src/features/blog/*.tsx` | No |

Flujo recomendado:

1. Crea una branch desde `main` actualizado.
2. Cambia el componente más local posible.
3. Comprueba desktop y móvil, tema, navegación, foco, overflow, imágenes y consola.
4. Ejecuta `pnpm lint`, `pnpm typecheck`, `pnpm test` y, antes del merge, `pnpm build`.
5. Valida en Vercel Preview.
6. Mergea a `main` solo después de aprobar Preview.

No conviertas textos estructurales como etiquetas de navegación en campos CMS salvo que exista una necesidad editorial real.

## 6. Añadir una sección nueva

### A. Sección estática

Úsala cuando el contenido sea estructural, cambie raramente y no necesite edición desde Admin.

1. Crea el componente o la ruta bajo `src/app/(website)/`.
2. Reutiliza componentes de `src/components/`.
3. Añade navegación en `src/components/navigation.ts` si corresponde.
4. Añade metadata de ruta y, si debe indexarse, revisa `src/lib/site.ts` y `src/app/sitemap.ts`.
5. Prueba desktop, móvil y accesibilidad básica.

### B. Sección editable única

Primero comprueba si cabe naturalmente en `site-settings`. Si agregas datos nuevos al Global, el cambio afecta schema y normalmente requiere migración.

Capas que debes revisar:

1. `src/payload/globals/SiteSettings.ts`.
2. Tipos generados: `src/payload-types.ts` mediante `pnpm payload:types`.
3. DTO estable: `src/content/types.ts`.
4. Mapper: `src/payload/portfolio/mapper.ts`.
5. Página/componente consumidor.
6. Tests, migración e historial limpio.

### C. Lista editorial con CRUD

Usa una Collection si habrá varios documentos, orden, publicación individual o relaciones. Sigue el patrón de `Projects.ts` o `Experiences.ts`:

1. Define la Collection en `src/payload/collections/`.
2. Regístrala en `payload.config.ts`.
3. Define acceso, drafts, key estable, orden y validación.
4. Añade repository, mapper y DTO; la UI no debe depender directamente de `payload-types.ts`.
5. Añade la lectura publicada con `overrideAccess: false` y `draft: false`.
6. Crea y prueba la migración.
7. Conecta la UI y el sitemap/metadata si aplica.

### D. Configuración singleton

Usa un Global cuando solo pueda existir una instancia, como “Perfil y sitio”. No inventes una Collection de un único documento. Mantén acceso publicado/autenticado y protección de drafts equivalente a Site Settings.

## 7. Cambios estructurales en Payload

Cambiar el schema no es una edición editorial. Puede afectar PostgreSQL, Admin, tipos, queries, mappers, cache, seed y datos existentes.

| Cambio | ¿Migración? | Precaución principal |
| --- | --- | --- |
| Añadir campo persistido | Sí, normalmente | Define default/backfill para datos existentes |
| Renombrar campo | Sí | Preserva datos; no lo trates como delete + add a ciegas |
| Cambiar tipo | Sí | Comprueba conversión y valores incompatibles |
| Hacer campo obligatorio | Sí o backfill previo | Ningún documento existente puede quedar inválido |
| Eliminar campo/Collection | Sí, destructiva | Backup y confirmación explícita |
| Cambiar una relación | Sí | Revisa profundidad, documentos relacionados y limpieza de referencias |
| Habilitar drafts/versiones | Sí | Payload añade tablas/campos/versiones; revisa access y lecturas públicas |
| Añadir/cambiar `index` o `unique` | Sí | Limpia duplicados antes de crear una restricción única |
| Añadir Collection | Sí | Regístrala, define access/drafts y conecta todas las capas de lectura |
| Añadir Global | Sí | Decide acceso singleton, drafts y consumo publicado |
| Cambiar label, descripción o columnas Admin | Normalmente no | Confirma que no cambió persistencia |
| Añadir custom component | No por sí solo | Regenera import map |

Flujo seguro:

1. Parte de `main` limpio y abre una branch.
2. Modifica el schema y sus tests.
3. Regenera tipos e import map cuando corresponda:

   ```bash
   pnpm payload:types
   pnpm payload:importmap
   ```

4. Crea la migración versionada:

   ```bash
   pnpm payload:migrate:create
   ```

5. Revisa el `.ts`, snapshot `.json` y `migrations/index.ts`. No edites una migración ya aplicada salvo una causa demostrada y un plan explícito.
6. Valida `up` y `down` en una base desechable limpia; no uses una Development preparada por `push` como prueba del historial.
7. Ejecuta calidad y build.
8. Aplica la migración explícita en Preview, despliega la branch y valida datos/Admin/web.
9. Antes de Production, define compatibilidad entre runtime viejo, schema nuevo y rollback. Si no es compatible, usa un diseño expand/contract.
10. Solo con autorización, aplica Production migration y luego despliega el código aprobado.

Nunca uses `push` para preparar Preview o Production. Los comandos y protecciones exactas están en [Migraciones](operations.md#5-migraciones).

## 8. Modificar el Blog

### Dónde vive cada responsabilidad

- Schema y hooks: `src/payload/collections/Posts.ts`.
- Lectura publicada: `src/payload/blog/repository.ts`.
- Conversión a modelo público: `src/payload/blog/mapper.ts`.
- Cache: `src/features/blog/data.ts` y `src/features/blog/cache-tags.ts`.
- Invalidación: `src/payload/blog/cache-invalidation.ts`.
- Tipos: `src/features/blog/types.ts`.
- Renderer Markdown: `src/features/blog/markdown.tsx`.
- Campo Admin: `src/payload/admin/MarkdownField.tsx`.
- Lista y detalle: `src/app/(website)/blog/`.

### Reglas que debes conservar

- `contentMarkdown` es Markdown real; no lo sustituyas por HTML crudo, MDX o Rich Text sin una decisión arquitectónica.
- El renderer usa `react-markdown`, GFM y validación de enlaces/imágenes; HTML crudo debe seguir deshabilitado.
- Solo las publicaciones se leen con acceso público activo, `draft: false` y `_status=published`.
- Los tags `posts` y `post:<slug>` tienen TTL (`stale: 0`, `revalidate: 30`, `expire: 60`) **y** invalidación explícita.
- Los hooks deben invalidar la lista, el slug actual y el anterior si cambia; también al despublicar o eliminar.
- No uses `updateTag` desde un contexto no soportado. La implementación actual usa `revalidateTag(..., { expire: 0 })` en hooks server-side.
- Cache Components/PPR permanece activo.

Pruebas mínimas después de tocar Blog:

1. Draft visitado → publicar → detalle visible sin esperar el TTL completo.
2. Publicado → actualizar → contenido nuevo visible.
3. Publicado → draft → desaparece del listado y detalle.
4. Slug A → B → B visible y A invalidado.
5. Delete → lista y detalle actualizados.
6. Markdown: encabezado, lista, enlace, inline code, bloque de código e imagen.
7. Sitemap solo contiene posts publicados.

`notFound()` produce la UI y `noindex` correctos para contenido inexistente/no público, pero con streaming/PPR el status HTTP puede ser 200. Ese trade-off está aceptado; no desactives globalmente PPR para cambiarlo.

Si cambias cómo se guardan Posts, revisa en conjunto `Posts.ts`, la migración, `payload-types.ts`, repository/mapper/tipos públicos, el campo Admin, el renderer, seed/validadores si llegan a incluir Posts, cache tags/hooks, sitemap, metadata, JSON-LD y todas las pruebas anteriores. No cambies solo el campo y esperes que las demás capas se adapten.

## 9. Trabajar con Media

### Subir y relacionar

1. En `/admin/collections/media`, crea un Archivo.
2. Sube JPEG, PNG, WebP, AVIF o PDF y escribe un `alt` útil.
3. Para imágenes, comprueba original, `thumbnail` y `card`.
4. Relaciónalo desde Project, Site Settings o Post.
5. Comprueba preview Admin y URL pública.

### Qué ocurre realmente

- Neon recibe el documento y metadata.
- Supabase Storage recibe los objetos.
- La URL se construye desde `SUPABASE_STORAGE_PUBLIC_URL`.
- El adapter es `@payloadcms/storage-s3`; `clientUploads=false`, `forcePathStyle=true` y `disableLocalStorage=true`.

### Borrar sin dejar residuos

1. Busca relaciones en Projects, Site Settings y `featuredImage` de Posts.
2. Busca la URL en `contentMarkdown`; una imagen inline no es una relación de Payload.
3. Retira referencias y publica los documentos afectados.
4. Elimina Media desde Admin.
5. En una validación operativa autorizada, confirma que metadata y objetos remotos desaparecieron.

No ejecutes `pnpm payload:validate-storage` por curiosidad: crea y elimina usuarios, proyectos, Media y objetos. Úsalo solo en un entorno autorizado y desechable.

## 10. Modificar el formulario de contacto

Recorrido:

```text
src/features/contact/contact-form.tsx
  -> POST /api/contact
  -> schema.ts + security.ts
  -> send-contact.ts
  -> Resend
```

Si agregas o cambias un campo:

1. Actualiza el formulario y su estado cliente.
2. Actualiza `src/features/contact/schema.ts`: normalización, longitud y obligatoriedad.
3. Actualiza `src/features/contact/email-template.tsx`.
4. Confirma que `send-contact.ts` mantiene `from`, `to`, `replyTo` e idempotencia.
5. Ajusta tests de schema, seguridad y Route Handler.
6. Prueba `202`, `422`, `403`, honeypot silencioso y `503` sin detalles internos.

Qué se cambia dónde:

- Destinatario: `CONTACT_TO_EMAIL` del entorno.
- Remitente: `CONTACT_FROM_EMAIL`; su dominio debe estar verificado en Resend.
- Credencial: `RESEND_API_KEY` server-side.
- Asunto y cuerpo del correo: `src/features/contact/send-contact.ts` y `email-template.tsx`.
- Campos, límites y mensajes: formulario + `schema.ts`.
- Origin, honeypot e idempotencia: Route Handler, `security.ts` y `send-contact.ts`.

No elimines las capas actuales: Zod, origin check, honeypot e idempotencia por contenido/día. El rate limiting por IP pertenece a Vercel Firewall/WAF, no al handler, y no debe configurarse automáticamente sin autorización. Los tests mockeados no demuestran entrega; una prueba real autorizada debe distinguir aceptación de Resend de entrega en inbox.

## 11. Añadir o cambiar variables de entorno

1. Decide si es server-only o realmente pública. No uses prefijo `NEXT_PUBLIC_` para secretos.
2. Añade solo el nombre y un placeholder seguro a `.env.example`.
3. Añade validación que falle claramente donde se consume.
4. Actualiza `.env.local`, `.env.preview.local` y `.env.production.local` manualmente según corresponda; nunca los agregues a Git.
5. Actualiza scopes Development/Preview/Production en Vercel.
6. Si la variable participa en aislamiento, actualiza con cuidado `scripts/preview-env.mjs`, `production-env.mjs` y sus checks/runners.
7. Ejecuta los env checks sin imprimir valores:

   ```bash
   pnpm preview:env:check
   pnpm production:env:check
   ```

8. Un cambio de variable en Vercel requiere un deployment nuevo para que el build/runtime lo use. Valida target, branch, commit y dominio.

Las 12 variables y sus responsabilidades están en [Variables de entorno](operations.md#3-variables-de-entorno). Nunca pegues connection strings o tokens en logs, documentación o conversaciones.

Para Neon, Vercel usa normalmente la conexión **pooled** del entorno; las operaciones locales de Production usan la conexión **direct** en `.env.production.local`. Antes de cualquier comando sensible:

- Confirma el nombre del comando: `preview:*` o `production:*`.
- Ejecuta el `env:check` correspondiente.
- Comprueba que Neon y bucket difieren de los otros entornos.
- Confirma `NODE_ENV=production` y `push=false` para Preview/Production.
- Detente si el check no puede demostrar el aislamiento.

## 12. Flujo normal de desarrollo

```text
main actualizado
  -> branch feature/fix
  -> cambio pequeño
  -> pruebas locales
  -> commit
  -> push de la branch
  -> Vercel Preview
  -> validación funcional + logs
  -> merge controlado a main
  -> Production automático
```

Checklist local normal:

```bash
git status --short --branch
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

Además:

- Revisa el diff completo antes de agregar archivos.
- No incluyas `.env.*.local`, `.next`, `node_modules`, `.vercel`, Media local ni reportes temporales.
- `pnpm build` puede leer Payload durante prerender; confirma el entorno antes.
- `pnpm test:e2e` inicia `next dev` y puede activar `push` contra la base configurada. No lo ejecutes sin clasificar su efecto.
- No mezcles una refactorización, una dependencia y un cambio de schema en el mismo checkpoint si pueden aislarse.

Si hay migración, el flujo cambia: valida primero el historial en una base desechable, migra Preview antes de desplegar la branch y coordina Production migrate con la compatibilidad del runtime anterior. No conviertas el build de Vercel en un ejecutor automático de migraciones.

## 13. Corregir un bug

1. Reproduce y registra ruta, entorno, commit, request/status y logs relevantes.
2. Separa evidencia de hipótesis. No cambies código hasta saber qué capa falla.
3. Compara local production (`pnpm build` + `pnpm start`) con Preview si el fallo solo aparece en Vercel.
4. Escribe una prueba que falle por la causa observada.
5. Aplica el cambio mínimo.
6. Ejecuta calidad, build y reproducción funcional.
7. Valida en Preview limpio antes de `main`.

Incidentes reales que sirven de patrón:

- **Admin fallaba solo en un deployment Preview:** local production funcionaba y un redeploy limpio del mismo commit corrigió el problema. Conclusión: artefacto/cache inconsistente; no se justificaba un fix especulativo.
- **Media devolvía 401:** el bucket era público, pero `SUPABASE_STORAGE_PUBLIC_URL` usaba `/rest/v1/object/public/` en vez de `/storage/v1/object/public/`. Conclusión: comparar project-ref, bucket, key y URL antes de tocar policies o código.
- **Blog conservaba cache negativa:** existían tags, pero no hooks que los invalidaran. Conclusión: se añadieron hooks y tests para publish/update/draft/slug/delete sin desactivar PPR ni TTL.
- **Site Settings filtraba drafts:** `read: () => true` permitía acceso anónimo. Conclusión: reutilizar `publishedOrAuthenticated` y bloquear `draft=true` anónimo.

## 14. Actualizar dependencias

1. Abre una branch dedicada.
2. Lee changelog y guía oficial para las versiones objetivo, especialmente Next.js, React, Payload, Drizzle y el adapter PostgreSQL de Payload.
3. Comprueba versiones actuales con `pnpm outdated` sin actualizar todavía.
4. Cambia el conjunto mínimo; mantén alineados los paquetes `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical` y `@payloadcms/storage-s3`.
5. Revisa cuidadosamente el lockfile; no lo regeneres con otro package manager.
6. Regenera tipos/import map si Payload lo requiere.
7. Ejecuta lint, typecheck, tests, build y smoke de `/admin`, rutas públicas, Blog, Media y contacto.
8. Valida en Preview y revisa logs antes de mergear.

No combines una actualización mayor de framework con una migración editorial no relacionada. Una alerta automática no autoriza por sí sola un upgrade mayor.

## 15. Cambiar arquitectura

Cambios como reemplazar Neon, Supabase, Payload, Resend, el modelo de cache o el pipeline de deploy requieren una decisión explícita.

Antes de implementar, escribe:

1. Problema concreto y evidencia.
2. Restricciones e invariantes que deben sobrevivir.
3. Opción mínima que no cambia arquitectura.
4. Alternativas y por qué se descartan.
5. Impacto en datos, seguridad, coste, operación y rollback.
6. Plan de migración por entornos y validación.
7. Criterio de éxito y plan de salida.

Después recorre explícitamente todas las fuentes de verdad afectadas: schema Payload, migraciones, DTOs, repository/mapper, cache e invalidación, auth/access, Storage, variables, seed, tests, orden de deploy y rollback. Si una capa no cambia, deja documentado por qué.

Evita añadir servicios para resolver problemas que ya cubren las piezas actuales. Ejemplos: no uses SDK Supabase si el adapter S3 basta; no introduzcas HTTP interno donde existe Payload Local API; no agregues fallback local silencioso; no conviertas constantes técnicas en contenido CMS.

Si una decisión estable cambia, actualiza `AGENTS.md`, README y operaciones en la misma tarea, sin convertirlos en bitácoras.

## 16. Revertir un cambio

### Código

1. Identifica el commit exacto y sus efectos.
2. Crea una branch desde el estado actual.
3. Prefiere `git revert <hash>` para conservar historia; no uses `reset --hard`, force push ni rebase sobre trabajo compartido.
4. Ejecuta calidad y valida en Preview.
5. Mergea el revert como cualquier otro cambio aprobado.

### Contenido editorial

- Si solo está en draft, descarta o corrige el draft sin publicar.
- Si fue publicado, usa la versión anterior de Payload o restaura manualmente el valor y vuelve a publicar.
- Verifica la web después de la ventana de cache correspondiente.

### Variable o deployment

- Restaura el valor correcto en el scope exacto sin exponerlo.
- Genera un deployment limpio del commit conocido si el artefacto pudo quedar inconsistente.
- Verifica aliases, canonical, sitemap, robots y logs.

### Schema/datos

No improvises `migrate:down`. Determina primero si el runtime anterior es compatible y si la migración elimina datos. Usa backup/proyecto desechable y el procedimiento de [Migraciones](operations.md#5-migraciones). Si no existe una recuperación demostrada, detente.

## 17. Funciona localmente, pero falla en Preview o Production

Comprueba en este orden:

1. **Identidad:** deployment, target, branch, commit y aliases.
2. **Variables:** presencia y scope; nunca valores en logs. Recuerda que `NEXT_PUBLIC_SITE_URL` afecta build, SEO y origen.
3. **Base:** Neon correcta, migraciones aplicadas y contenido publicado.
4. **Storage:** project-ref, endpoint S3, bucket y URL pública con `/storage/v1/object/public/<bucket>`.
5. **Build vs runtime:** identifica si falla al compilar, prerenderizar o atender una request.
6. **Cache:** prueba si el dato publicado se invalida o solo espera TTL; revisa hooks y logs.
7. **Artefacto:** si el mismo commit funciona local production, prueba un redeploy limpio sin cache antes de cambiar código.
8. **Logs:** busca primero 5xx, Payload, PostgreSQL, Supabase, Resend y cache.

No ejecutes migrate, seed o validators destructivos para “ver si arregla”. No uses Production como entorno de diagnóstico cuando Preview reproduce el problema.

## 18. Checklist si tienes miedo de romper Production

- [ ] Estoy en una branch, no editando directamente `main`.
- [ ] `git status` no contiene trabajo ajeno ni secretos.
- [ ] Sé si el cambio es contenido, visual, schema, variable o arquitectura.
- [ ] La base y bucket objetivo están identificados sin imprimir credenciales.
- [ ] No necesito migración; o existe una migración revisada y validada en una base desechable.
- [ ] No ejecutaré seed por rutina: puede sobrescribir stable keys.
- [ ] No ejecutaré `payload:validate-storage`, `payload:validate-blog` ni E2E destructivo sin autorización.
- [ ] Si la migración puede destruir o transformar datos, existe un backup/restore point probado en el proveedor.
- [ ] Lint, typecheck, tests, build y `git diff --check` pasan.
- [ ] Preview usa la branch/commit correctos y pasó smoke funcional.
- [ ] Revisé logs de Preview.
- [ ] El cambio es compatible con el runtime actual durante el orden migrate/deploy.
- [ ] Tengo un rollback concreto de código, contenido, variable y datos.
- [ ] El push a `main` es la única acción que debe disparar Production.
- [ ] Después del deploy validaré rutas, Admin, SEO y logs antes de cualquier prueba destructiva.

## 19. Tabla rápida cambio → impacto

| Quiero cambiar | ¿Código? | ¿Migración? | ¿Preview? | ¿Deploy? | Validación mínima |
| --- | --- | --- | --- | --- | --- |
| Texto editorial existente | No | No | Opcional | No | Draft oculto, publicar y revisar web |
| Nombre, rol, bio o SEO | No | No | Opcional | No | Web, metadata, OG/JSON-LD |
| Habilidad, experiencia, proyecto o formación | No | No | Opcional | No | Publicación, orden y página pública |
| Publicar/editar Post | No | No | Opcional | No | Draft/publish, lista, detalle y cache |
| Subir imagen o CV | No | No | Opcional | No | URL 200, derivados/preview y referencia |
| CSS, layout o navegación | Sí | No | Sí | Sí | Desktop/móvil, accesibilidad y consola |
| Nueva ruta estática | Sí | No | Sí | Sí | Metadata, sitemap, navegación y 404 |
| Nuevo campo persistido | Sí | Sí, normalmente | Sí | Sí | Historial limpio y datos existentes |
| Nueva Collection/Global | Sí | Sí | Sí | Sí | Access, drafts, tipos, Admin y web |
| Renderer Markdown | Sí | No | Sí | Sí | Seguridad de URLs/HTML y formatos |
| Cache Blog | Sí | No | Sí | Sí | Publish/update/draft/slug/delete |
| Campo de contacto | Sí | No | Sí | Sí | 202/422/403/honeypot/503 |
| Credencial o URL de proveedor | No, salvo variable nueva | No | Sí para scope Preview | Redeploy | Env check, target, smoke y logs |
| Dependencia | Sí | No, salvo efecto de schema | Sí | Sí | Changelog, suite completa y smoke |

## 20. Volver al proyecto después de meses

Haz esto antes de la primera edición:

1. Lee README, este manual y [operations.md](operations.md).
2. Ejecuta:

   ```bash
   git status --short --branch
   git branch --show-current
   git log --oneline -10
   git diff --stat
   git fetch --prune
   ```

3. Comprueba si `main` local y `origin/main` coinciden; no descartes cambios para sincronizar.
4. Revisa `package.json`, `payload.config.ts`, `next.config.ts`, `.env.example` y las migraciones actuales.
5. Ejecuta `pnpm install` con la versión de Node/pnpm indicada en README.
6. Confirma qué archivos `.env.*.local` existen y que estén ignorados; no imprimas valores.
7. Inicia Development y haz smoke de `/`, páginas internas, `/blog` y `/admin`.
8. Ejecuta lint, typecheck y tests antes de asumir que el estado base es sano.
9. Verifica servicios y documentación contra el código: no confíes en una nota histórica si Git o el runtime dicen otra cosa.
10. Para la primera tarea, usa el árbol de decisión de esta guía y abre una branch pequeña.

Si el objetivo es operar infraestructura, migraciones, seed o deployment, continúa en [Arquitectura, configuración y operación](operations.md). Si el objetivo es editar o evolucionar el portafolio, vuelve a la sección de esta guía que describe la tarea concreta.
