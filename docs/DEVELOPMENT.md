# Desarrollo

> **Estado:** pendiente. El proyecto aún no tiene código ni configuración. Este archivo se completará en la
> Fase 1 con comandos reales y verificados.

## Requisitos previstos

- Node.js 22 LTS y pnpm 10.
- Docker (para Supabase local con la Supabase CLI).
- Google Chrome o Chromium (extensión y pruebas E2E).

## Comandos previstos (se confirmarán en Fase 1)

| Comando | Propósito |
|---|---|
| `pnpm install` | Instalar dependencias del monorepo |
| `pnpm dev` | Web en modo desarrollo |
| `pnpm dev:extension` | Compilar la extensión en modo observación |
| `pnpm lint` · `pnpm typecheck` | Calidad de código |
| `pnpm test` | Pruebas unitarias e integración (Vitest) |
| `pnpm test:e2e` | Pruebas end-to-end (Playwright, incluida la extensión) |
| `pnpm db:start` · `pnpm db:reset` · `pnpm db:test` | Supabase local, migraciones + seed, pruebas RLS |

## Variables de entorno previstas

Se documentarán en `.env.example` (sin valores): URL de Supabase, clave publicable, Service Role Key
(solo servidor), API key del proveedor de IA (solo servidor), origen permitido de la extensión.

## Despliegue previsto

Web en Vercel, base de datos en Supabase Cloud, extensión distribuida como "no listada" en Chrome Web Store
para el piloto. Pendiente de aprobación.
