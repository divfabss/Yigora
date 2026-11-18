# Changelog

Formato basado en "Keep a Changelog". Categorías: Funcionalidades, Arquitectura, Dependencias, Base de datos, Seguridad, Documentación.

## [Sin publicar]

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
