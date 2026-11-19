# Changelog

Formato basado en "Keep a Changelog". Categorías: Funcionalidades, Arquitectura, Dependencias, Base de datos, Seguridad, Documentación.

## [Sin publicar]

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
