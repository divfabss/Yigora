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
