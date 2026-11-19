# Changelog

Formato basado en "Keep a Changelog". Categorías: Funcionalidades, Arquitectura, Dependencias, Base de datos, Seguridad, Documentación.

## [Sin publicar]

### Demo 0.1.1 de la extensión (2026-11-19) — corrección: la ventana no aparecía

- **Corregido:** la ventana flotante quedaba oculta detrás de la interfaz de WhatsApp Web (faltaba
  `z-index`). Reproducido y verificado contra el WhatsApp Web real.
- **Corregido:** la lectura podía no ejecutarse nunca porque WhatsApp cambia la página continuamente
  (presencia, "escribiendo…"); el observador ahora lee como máximo cada 700 ms (throttle) en vez de
  esperar a que la página se calme (debounce).
- **Corregido:** la ventana se vaciaba tras 30 s sin uso porque Chrome detiene el service worker; ahora
  la ventana envía un latido cada 20 s mientras está abierta.
- **Mejorado:** selectores alternativos para el panel y el título; el texto se toma del último bloque
  (no de mensajes citados) e incluye emojis; detección de grupos también por autores distintos; si el
  formato de `data-id` cambia, se usan las clases de dirección.
- **Diagnóstico:** mensajes `[Yigora]` en la consola del navegador (solo estados y conteos, sin contenido).
- **Pruebas:** la réplica de WhatsApp ahora tiene capas con `z-index` y la E2E verifica que la ventana
  quede encima; prueba del observador con cambios constantes; prueba opcional contra WhatsApp Web real
  (`YIGORA_REAL_WHATSAPP=1`).

### Demo 0.1.0 de la extensión (2026-11-19)

- **Funcionalidades:** extensión MV3 con ventana flotante sobre WhatsApp Web, lectura automática de los
  mensajes de hoy (solo lectura, sin grupos), motor de sugerencias determinista en 6 idiomas, farmacia
  ficticia, copiar respuesta, pausa y entrada manual. Guía en `docs/DEMO.md`.
- **Arquitectura:** nuevos paquetes `@yigora/suggestion-engine` y `@yigora/demo-data`; app
  `apps/extension` (ADR-016, ADR-018).
- **Base de datos:** migración `20261119000005` (país, zona horaria, códigos `es-419`).
- **Mercado:** Latinoamérica; interfaz en `es-419` (ADR-017).
- **Seguridad:** prueba estática que prohíbe APIs de escritura/clic en la extensión; E2E que verifica que
  nada se escribe ni se envía en WhatsApp; mensajes internos validados con Zod.
- **CI:** compila y prueba la extensión y publica el `.zip` de la demo como artefacto.

### Fase 1 — Fundación (2026-11-18)

- **Arquitectura:** monorepo pnpm (`apps/web`, `packages/domain`, `packages/ui`, `packages/i18n`).
- **Base de datos:** migraciones `20261118000001`–`20261118000004` (extensiones y helpers, organizaciones y
  acceso, productos y palabras clave, auditoría). RLS en todas las tablas.
- **Seguridad:** registro público desactivado, contraseñas de 10+ caracteres con mayúsculas, minúsculas y
  números; CSP con nonce; cabeceras de seguridad; logger con lista blanca; gitleaks en CI.
- **Funcionalidades:** sistema de diseño (tokens claro/oscuro, componentes base), página provisional,
  endpoint `/api/v1/health`.
- **Pruebas:** 35 unitarias, 44 pgTAP, 5 E2E.
- **Dependencias:** ver ADR-014.

### Documentación

- 2026-11-18 — Decisiones del propietario: producto llamado **Yigora**; lectura automática de mensajes del día
  (ADR-004); ventana flotante en lugar de Side Panel (ADR-005); Claude Haiku 5.5 (ADR-007); acceso solo por
  invitación (ADR-011); nombres de productos de la BD (ADR-012); valores calculados de fórmulas (ADR-013).
- 2026-11-18 — Fase 0: propuesta inicial de arquitectura, base de datos, seguridad, decisiones (ADR-001 a
  ADR-010), estado del proyecto y roadmap. Sin código de aplicación.
