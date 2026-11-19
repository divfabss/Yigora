# Registro de decisiones arquitectónicas (ADR)

Estados: **Propuesta** · **Aceptada** · **Reemplazada** · **Rechazada**.
Decisiones del propietario registradas el 2026-11-18. Las propuestas que el propietario no objetó se
consideran aceptadas (ADR-001, 002, 003, 006, 008, 009, 010 y las recomendaciones D1, D5–D8, D13, D14).

---

## ADR-001 — Monorepo con pnpm workspaces

- **Estado:** Aceptada
- **Contexto:** web, extensión y lógica compartida (dominio, motor, importador, UI) deben evolucionar juntos.
- **Alternativas:** repos separados; monorepo con Turborepo/Nx; monorepo con pnpm workspaces simple.
- **Decisión:** pnpm workspaces sin orquestador adicional en el MVP.
- **Justificación:** comparte contratos tipados sin publicar paquetes; mínima complejidad.
- **Consecuencias:** si los tiempos de build crecen, se evaluará Turborepo.

## ADR-002 — Lógica de backend en Next.js (route handlers) + Supabase para datos y Auth

- **Estado:** Aceptada
- **Alternativas:** Supabase Edge Functions (Deno); servidor Node separado.
- **Decisión:** API en `apps/web/app/api/v1` (runtime Node); Supabase para Postgres, Auth y RLS.
- **Justificación:** un solo runtime TypeScript que reutiliza los paquetes; menos piezas que desplegar.
- **Consecuencias:** límites de tiempo de funciones serverless; el motor debe responder en pocos segundos.

## ADR-003 — Cliente Supabase con JWT del usuario (RLS siempre activa)

- **Estado:** Aceptada
- **Decisión:** el servidor no usa la Service Role Key en flujos normales. Excepción acotada: invitaciones de
  usuarios por el administrador de plataforma (ADR-011).
- **Justificación:** mínimo privilegio; un error en servicios no puede saltarse el aislamiento multiempresa.

## ADR-004 — Lectura automática de WhatsApp Web limitada a mensajes del día

- **Estado:** Aceptada (decisión del propietario, D2). Reemplaza la propuesta de lectura bajo demanda.
- **Contexto:** no hay API pública para extensiones; las condiciones de WhatsApp restringen el acceso automatizado.
- **Alternativas:** lectura bajo demanda; lectura automática; solo manual; solo API oficial.
- **Decisión:** lectura automática al abrir un chat individual y al llegar mensajes entrantes nuevos, solo de
  mensajes de hoy, solo lectura, sin nombres ni teléfonos, sin persistencia, con pausa y respaldo manual.
  Detrás del puerto `ConversationSource`.
- **Consecuencias:** mejor experiencia; riesgo aceptado por el propietario ante las condiciones de WhatsApp y
  ante cambios del DOM. Más análisis por vendedor → control de costos por hash de estado del chat.

## ADR-005 — Ventana flotante sobre WhatsApp Web

- **Estado:** Aceptada (decisión del propietario, D3). Reemplaza la propuesta de Side Panel.
- **Decisión:** ventana flotante arrastrable y minimizable, renderizada en un iframe de la extensión dentro de un
  Shadow DOM cerrado.
- **Justificación:** el iframe aísla datos y estilos de la página de WhatsApp; el Shadow DOM evita conflictos de
  maquetación.
- **Consecuencias:** se elimina el permiso `sidePanel`; la posición debe evitar tapar la caja de redacción.

## ADR-006 — Motor de sugerencias determinista primero, IA como respaldo

- **Estado:** Aceptada
- **Decisión:** búsqueda por trigramas/texto completo/palabras clave y plantillas multilingües; IA solo para
  idioma/traducción/intención ambiguos o redacción opcional; llamadas agrupadas con salida estructurada.

## ADR-007 — Proveedor de IA: Claude Haiku 5.5 detrás de `LlmProvider`

- **Estado:** Aceptada (decisión del propietario, D4)
- **Decisión:** adaptador Anthropic con el SDK oficial `@anthropic-ai/sdk`, modelo `claude-haiku-5-5`, más un
  adaptador `mock` para pruebas. Modelo configurable por organización.
- **Consecuencias:** costo aproximado ≈ US$0,0002 por llamada de análisis (a medir). Esfuerzo de razonamiento
  bajo para clasificación/traducción. Si el modelo rechaza una solicitud o falla, se usa la respuesta
  determinista por plantilla.

## ADR-008 — Parseo de archivos en servidor

- **Estado:** Aceptada
- **Decisión:** servidor como fuente de verdad. SheetJS Community Edition (versión fijada desde su distribución
  oficial; la de npm está desactualizada) para XLSX y PapaParse para CSV.

## ADR-009 — Eliminación lógica de productos

- **Estado:** Aceptada. "Eliminar" = `is_active = false`; sin borrado físico por importación.

## ADR-010 — Sin almacenamiento de conversaciones

- **Estado:** Aceptada. Procesar en memoria; solo métricas sin contenido (Ley 8968, datos de salud).

## ADR-011 — Acceso solo por invitación concedida por el propietario

- **Estado:** Aceptada (decisión del propietario, D11)
- **Contexto:** Yigora será un producto de pago, no de uso libre.
- **Decisión:** registro público desactivado; tabla `platform_admins`; `organizations.access_status` y
  `access_expires_at`; RLS y API verifican acceso activo. Sin demo pública: la demo es para usuarios con acceso.
- **Consecuencias:** cobro y suscripciones quedan para después del MVP.

## ADR-012 — Nombres de productos tal como están en la base de datos

- **Estado:** Aceptada (decisión del propietario, D9). Los nombres no se traducen en ningún idioma de respuesta.

## ADR-013 — Celdas con fórmula: usar el valor calculado

- **Estado:** Aceptada (decisión del propietario, D10). Nunca se evalúa la fórmula; se marca advertencia.

## ADR-014 — Herramientas y dependencias de la Fase 1

- **Estado:** Aceptada
- **Contexto:** regla 7 de `CLAUDE.md`: toda dependencia debe justificarse.
- **Decisión y justificación:**

| Dependencia                                                                                                                                              | Dónde       | Motivo                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `next` 16, `react` 19                                                                                                                                    | web         | Stack aprobado (ADR-002)                                         |
| `@supabase/ssr`, `@supabase/supabase-js`                                                                                                                 | web         | Sesión por cookies y cliente con RLS                             |
| `zod` 4                                                                                                                                                  | domain, web | Validación en todas las fronteras                                |
| `server-only`                                                                                                                                            | web         | Error de compilación si código de servidor llega al navegador    |
| `tailwindcss` 4, `@tailwindcss/postcss`                                                                                                                  | web, ui     | Sistema de diseño                                                |
| `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`                                                                             | ui          | Base de componentes estilo shadcn/ui (copiados al repo, sin CLI) |
| `typescript` 6.0                                                                                                                                         | raíz        | TS 7 aún no es compatible con `typescript-eslint`                |
| `eslint` 10, `typescript-eslint`, `eslint-plugin-import-x`, `eslint-import-resolver-typescript`, `@next/eslint-plugin-next`, `eslint-plugin-react-hooks` | raíz        | Reglas de calidad, capas y ciclos                                |
| `prettier`                                                                                                                                               | raíz        | Formato consistente                                              |
| `vitest` 5, `@playwright/test`                                                                                                                           | raíz, web   | Pruebas unitarias y E2E                                          |
| `supabase` (CLI)                                                                                                                                         | raíz        | BD local, migraciones y pruebas pgTAP                            |

- **Consecuencias:** Dependabot vigila actualizaciones semanalmente.

## ADR-015 — Seguridad base de la web

- **Estado:** Aceptada
- **Decisión:** CSP estricta con nonce por petición en `src/proxy.ts` (sin `unsafe-inline`; `unsafe-eval`
  solo en desarrollo), cabeceras estáticas (HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`), variables de entorno validadas sin revelar valores, y logger con lista blanca de
  campos.
- **Consecuencias:** las páginas deben renderizarse dinámicamente para recibir el nonce.

## ADR-016 — Modo demostración local en la extensión

- **Estado:** Aceptada (2026-11-19)
- **Contexto:** el propietario pidió una demo para probar cuanto antes. La web todavía no tiene
  autenticación ni API de sugerencias, y no hay proyecto de Supabase en la nube.
- **Alternativas:** esperar a tener backend desplegado; demo solo con capturas; motor local en la extensión.
- **Decisión:** el service worker ejecuta `@yigora/suggestion-engine` con `@yigora/demo-data` (farmacia
  ficticia) detrás de la interfaz `SuggestionService`. No hay credenciales ni datos reales en la extensión.
- **Consecuencias:** la demo funciona sin servidor. En producción, `SuggestionService` se implementará
  llamando a `/api/v1/suggestions` con la sesión del usuario; el resto de la extensión no cambia. El motor
  es el mismo código en ambos casos.

## ADR-017 — Mercado Latinoamérica

- **Estado:** Aceptada (decisión del propietario, 2026-11-19)
- **Decisión:** la interfaz usa español latinoamericano neutro (`es-419`); país (`country_code`), zona
  horaria (`timezone`) y moneda (`default_currency`) son configurables por empresa. Costa Rica es el país
  piloto y el valor por defecto.
- **Consecuencias:** los precios se formatean según el idioma de respuesta y la moneda del producto; en la
  extensión, "hoy" se calcula con la hora local del equipo del vendedor. Región de Supabase pendiente
  (ver `PROJECT_STATUS.md`, D6).

## ADR-018 — Dependencias de la extensión y del motor

- **Estado:** Aceptada

| Dependencia                                           | Dónde           | Motivo                                                                     |
| ----------------------------------------------------- | --------------- | -------------------------------------------------------------------------- |
| `vite` 8, `@vitejs/plugin-react`, `@tailwindcss/vite` | extension       | Compilar la ventana flotante, el service worker y el content script (IIFE) |
| `@types/chrome`                                       | extension       | Tipos de las APIs de extensiones                                           |
| `jsdom`                                               | extension (dev) | Pruebas del lector de WhatsApp sobre una réplica del DOM                   |
| `react`, `zod`, paquetes internos                     | extension       | Interfaz y validación de mensajes internos                                 |

El motor de sugerencias y la farmacia ficticia no agregan dependencias externas.
