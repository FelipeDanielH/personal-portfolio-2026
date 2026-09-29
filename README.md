# Portafolio de Felipe Henríquez

Portafolio construido con Next.js 16, React 19, Payload CMS 3, Neon PostgreSQL, Supabase Storage y Resend. La aplicación pública y el Admin de Payload se despliegan juntos en Vercel.

## Inicio rápido en Development

Requisitos: Node.js 24 y pnpm 11.

```bash
corepack enable
pnpm install
copy .env.example .env.local
pnpm dev
```

Completa `.env.local` antes de iniciar. Payload exige PostgreSQL, secreto y Storage; el formulario de contacto responde `503` mientras Resend no esté configurado. Abre `http://localhost:3000/admin` para crear el primer usuario.

## Arquitectura

```text
Next.js 16 -> Payload Local API -> Neon PostgreSQL
Payload Media -> Supabase Storage (S3-compatible)
Formulario -> POST /api/contact -> Resend
```

- Neon conserva contenido, usuarios, versiones, metadata y relaciones.
- Supabase conserva los binarios originales y derivados de Media.
- Payload define el CMS, el Admin, el acceso editorial, las migraciones y los drafts.
- Vercel construye y ejecuta Next.js con variables separadas por entorno.
- Resend entrega exclusivamente los mensajes del formulario de contacto.

## Entornos

| Entorno | Archivo local | Servicios |
| --- | --- | --- |
| Development | `.env.local` | Neon DEV y bucket DEV |
| Preview | `.env.preview.local` | Neon Preview, `portfolio-preview` y Vercel Preview |
| Production | `.env.production.local` | Neon Production y `portfolio-production`; Vercel Production sigue `main` |

El código siempre consume nombres normales como `DATABASE_URL`. Los ejecutores Preview y Production cargan el archivo correspondiente sin introducir variables alternativas en la aplicación.

## Comandos habituales

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build

pnpm preview:env:check
pnpm preview:migrate:status

pnpm production:env:check
pnpm production:migrate:status
```

Las migraciones y el seed modifican servicios externos. No los ejecutes por rutina ni como parte del build. Consulta primero la guía operativa.

## Documentación

- [Manual de uso y onboarding del portafolio](docs/portfolio-onboarding.md)
- [Arquitectura, configuración y operación](docs/operations.md)
- [Archivo histórico de la fase Blog](docs/blog-phase.md)

El manual de onboarding explica cómo realizar tareas concretas. La guía operativa contiene la referencia de arquitectura, entornos, migraciones, seed y deployment.
