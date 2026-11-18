# Desarrollo

> **Estado:** vigente desde la Fase 1. Todos los comandos de este archivo fueron ejecutados y verificados.

## Requisitos

- Node.js 22 (`.nvmrc`) y pnpm 10 (`packageManager` en `package.json`).
- Docker en ejecución (Supabase local).
- Chromium para las pruebas E2E (`pnpm --filter @yigora/web exec playwright install chromium`).

## Primer arranque

```bash
pnpm install
pnpm db:start
cp apps/web/.env.example apps/web/.env.local
```

Completar `apps/web/.env.local` con la URL y la clave publicable que imprime `pnpm db:start`
(la clave secreta solo hace falta para invitar usuarios). Luego:

```bash
pnpm dev
```

La web queda en `http://localhost:3000`.

## Comandos

| Comando              | Propósito                                                         |
| -------------------- | ----------------------------------------------------------------- |
| `pnpm dev`           | Web en modo desarrollo                                            |
| `pnpm build`         | Compilación de producción de la web                               |
| `pnpm lint`          | ESLint (capas, ciclos, `any`, tamaño de archivos), 0 advertencias |
| `pnpm format`        | Formatear con Prettier (`format:check` para verificar)            |
| `pnpm typecheck`     | TypeScript estricto en todos los paquetes                         |
| `pnpm test`          | Pruebas unitarias (Vitest, todos los paquetes)                    |
| `pnpm test:e2e`      | Pruebas end-to-end (Playwright; requiere `pnpm build` antes)      |
| `pnpm db:start/stop` | Iniciar/detener Supabase local                                    |
| `pnpm db:reset`      | Recrear la BD local aplicando todas las migraciones               |
| `pnpm db:test`       | Pruebas pgTAP de seguridad y reglas de datos                      |
| `pnpm db:lint`       | Revisión estática del esquema SQL                                 |

Si Chromium ya está instalado en otra ruta, `PLAYWRIGHT_CHROMIUM_PATH=/ruta/chromium pnpm test:e2e`.

## Estructura actual

```
apps/web            Next.js 16 (App Router, proxy con CSP, API /api/v1/health)
packages/domain     Reglas puras: stock, roles/acceso, idiomas, esquemas de producto
packages/ui         Tokens de diseño (Tailwind v4) y componentes base estilo shadcn/ui
packages/i18n       Catálogo de textos es-CR
supabase/           config.toml, migrations/, tests/ (pgTAP)
```

Pendientes de crear en fases posteriores: `apps/extension`, `packages/suggestion-engine`,
`packages/ai`, `packages/importer`.

## Migraciones

- Crear: `pnpm exec supabase migration new <descripcion>`.
- Nunca editar una migración ya aplicada en un entorno compartido; crear una nueva.
- Toda tabla nueva necesita RLS, políticas y pruebas en `supabase/tests/`.

## Integración continua

`.github/workflows/ci.yml` ejecuta en cada PR:

1. Formato, lint, tipos, pruebas unitarias y build.
2. Migraciones + `db lint` + pruebas pgTAP sobre una BD Supabase limpia.
3. Pruebas E2E con Playwright.
4. Escaneo de secretos con gitleaks.

Dependabot revisa dependencias npm y acciones de GitHub cada semana.

## Despliegue (previsto)

Web en Vercel y base de datos en Supabase Cloud. Pendiente: crear el proyecto de Supabase (requiere elegir
región) y configurar variables de entorno en Vercel.
