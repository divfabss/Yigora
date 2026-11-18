# CLAUDE.md — Yigora · Instrucciones principales del proyecto

> **Estado:** Fase 0 (planificación). **No existe código de aplicación todavía.**
> La arquitectura descrita aquí y en `docs/` fue **aprobada** por el propietario (2026-11-18), pero aún no
> está implementada. No asumir que algo existe porque aparece en la documentación: verificar siempre el código.

## 1. Visión del producto

**Yigora** es un asistente inteligente de ventas para vendedores que atienden clientes por **WhatsApp Web**.
Funciona como **extensión de Chrome (Manifest V3) con ventana flotante** y un **panel web** (landing + dashboard).
Producto de pago: el acceso lo concede el propietario (solo por invitación).

- Lee automáticamente los mensajes **de hoy** del chat abierto (solo lectura) o texto pegado como respaldo.
- Detecta idioma, traduce al español, interpreta intención y busca en el inventario de la empresa.
- Sugiere una respuesta **en el idioma del cliente**, basada **solo** en datos verificables de la base de datos.
- **Nunca envía mensajes.** El vendedor revisa, copia y decide.

Mercado inicial: Costa Rica. Primer sector: farmacias. Arquitectura **multiempresa** desde el inicio.

## 2. Arquitectura (resumen)

Monorepo pnpm. Detalle en `docs/ARCHITECTURE.md`.

| Ruta | Responsabilidad |
|---|---|
| `apps/web` | Next.js: landing, dashboard, administración de accesos y API `/api/v1/*` (única puerta al backend) |
| `apps/extension` | Extensión MV3: service worker, ventana flotante (iframe en Shadow DOM), adaptador de WhatsApp |
| `packages/domain` | Tipos, esquemas Zod, contratos API, estados de inventario. Sin infraestructura |
| `packages/suggestion-engine` | Pipeline de sugerencias con puertos inyectables. Sin red ni BD directa |
| `packages/ai` | Interfaz `LlmProvider` + adaptadores (Anthropic `claude-haiku-5-5`, mock), presupuesto de tokens |
| `packages/importer` | Parseo seguro XLSX/CSV, mapeo, validación y cálculo de diferencias |
| `packages/ui` | Sistema de diseño (tokens + componentes shadcn/ui) |
| `packages/i18n` | Catálogo de textos de interfaz es-CR |
| `supabase/` | Migraciones versionadas, seed ficticio, pruebas RLS (pgTAP) |

## 3. Stack (aprobado)

TypeScript estricto · Next.js (App Router) · React · Tailwind CSS · shadcn/ui · Supabase (PostgreSQL, Auth, RLS) ·
Zod · Vitest · Playwright · Vite (extensión) · pnpm workspaces. Ver `docs/DECISIONS.md`.

## 4. Reglas de desarrollo

1. Leer este archivo y `docs/PROJECT_STATUS.md` antes de cada tarea; revisar la doc del módulo afectado.
2. Presentar plan antes de implementar funcionalidades nuevas (protocolo §17 del prompt maestro).
3. Lógica de negocio **fuera** de componentes visuales. Capas: presentación → servicios → dominio ← adaptadores.
4. Sin `any` injustificado, sin dependencias circulares, sin manejo silencioso de errores.
5. Archivos < ~300 líneas, funciones con una sola responsabilidad, nombres descriptivos.
6. Validar con Zod en **todas** las fronteras (API, mensajes de la extensión, archivos, respuestas de IA).
7. No agregar dependencias sin justificarlas en `docs/DECISIONS.md`.
8. Ninguna funcionalidad se declara terminada sin pruebas que pasen.
9. Actualizar `docs/` y `PROJECT_STATUS.md` al terminar cada hito. La documentación refleja el código real.

## 5. Reglas de seguridad (obligatorias)

- Nunca exponer API keys ni la Service Role Key en frontend o extensión. `.env` nunca en Git.
- La extensión **no contiene credenciales**: solo habla con `apps/web/api`.
- RLS habilitado en todas las tablas; la organización se deriva de la sesión, nunca del cuerpo de la petición.
- SQL solo parametrizado (cliente Supabase o funciones RPC). Prohibido concatenar SQL.
- Mensajes de clientes = **datos no confiables**. El LLM no tiene herramientas ni acceso de escritura.
- Precios, existencias y recomendaciones de uso **solo** desde la BD. Stock desconocido ≠ 0.
- No almacenar conversaciones. No registrar contenido de mensajes, tokens ni archivos en logs.
- La extensión no tiene código capaz de escribir en WhatsApp ni de enviar mensajes; no hace clic ni scroll.
- Lectura de WhatsApp: solo chat individual abierto, solo mensajes de hoy, sin nombres ni teléfonos, sin persistencia.
- Nombres de productos siempre tal como están en la BD, sin traducir.
- Registro público desactivado; empresas suspendidas o vencidas pierden acceso (API + RLS).
- Importaciones: vista previa + confirmación explícita + transacción + historial. Nunca borrar en duro.

## 6. Convenciones

- Código e identificadores en inglés; textos de interfaz y documentación en español (Costa Rica).
- Idiomas con códigos BCP-47 (`es`, `en`, `pt`, `fr`, `de`, `it`). Moneda por defecto `CRC`.
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `db:`, `sec:`).
- Ramas: `feat/<tema>`, `fix/<tema>`; integración a `main` mediante PR revisado.

## 7. Comandos principales

_Pendiente (Fase 1)._ Se documentarán en `docs/DEVELOPMENT.md` cuando existan.

## 8. Índice de documentación

| Archivo | Contenido |
|---|---|
| `docs/ARCHITECTURE.md` | Módulos, flujos, contratos, motor de sugerencias, multilingüismo, integración WhatsApp |
| `docs/DATABASE.md` | Esquema, RLS, índices, importación transaccional, migraciones |
| `docs/SECURITY.md` | Autenticación, autorización, amenazas, controles, Ley 8968 |
| `docs/DEVELOPMENT.md` | Instalación, ejecución, pruebas, despliegue |
| `docs/PROJECT_STATUS.md` | Estado, roadmap, riesgos, deuda técnica, próximas tareas |
| `docs/DECISIONS.md` | Registro de decisiones arquitectónicas (ADR) |
| `docs/CHANGELOG.md` | Historial de cambios |

## 9. Estado general

Fase 0 cerrada: decisiones aprobadas (ver `docs/DECISIONS.md`). Siguiente: Fase 1 (fundación), pendiente de
que exista el repositorio GitHub `yigora`.
