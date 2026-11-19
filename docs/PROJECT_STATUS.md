# Estado del proyecto

_Última actualización: 2026-11-19 — Demo 0.1.0 de la extensión lista; Fase 1 en revisión._

## Resumen

| Área                 | Estado                                                                   |
| -------------------- | ------------------------------------------------------------------------ |
| Repositorio          | `divfabss/yigora`; Fase 1 en la rama `feat/foundation` (PR hacia `main`) |
| Documentación base   | Aprobada y sincronizada con el código de la Fase 1                       |
| Código de aplicación | Fundación + motor determinista + extensión MV3 en modo demostración      |
| Pruebas              | 113 unitarias · 49 pgTAP · 5 E2E web · 3 E2E extensión — todas en verde  |

## Funcionalidades

### Completadas (Fase 1, verificadas con pruebas)

- Monorepo pnpm con TypeScript estricto, ESLint (capas, ciclos, `any`, tamaño), Prettier.
- Supabase local y 4 migraciones: organizaciones con estado de acceso, administradores de plataforma,
  perfiles, membresías con roles, productos, palabras clave, auditoría.
- RLS en todas las tablas con verificación de acceso activo/no vencido; auditoría automática de cambios de
  acceso y membresías; stock desconocido como `NULL`; sin borrado físico de productos.
- `@yigora/domain`: estados de inventario, normalización de texto (idéntica a la BD), roles y acceso,
  idiomas, esquemas Zod de producto.
- `@yigora/ui`: tokens de diseño claro/oscuro (Tailwind v4) y componentes base (Button, Card, Badge, Input, Label).
- `@yigora/i18n`: catálogo es-CR.
- `apps/web`: Next.js 16 con CSP por nonce, cabeceras de seguridad, variables de entorno validadas,
  clientes Supabase de servidor, logger con lista blanca, `/api/v1/health`, página provisional.
- CI en GitHub Actions (calidad, BD, E2E, gitleaks) y Dependabot.

### Completadas (demo 0.1.0, verificadas con pruebas)

- Mercado Latinoamérica: interfaz `es-419`; país y zona horaria por empresa (migración 5).
- `@yigora/suggestion-engine`: detección de idioma (6 idiomas), intención, búsqueda tolerante a errores,
  preguntas de seguimiento, productos con stock primero, plantillas en 6 idiomas, validador de cifras,
  sugerencias comerciales para el vendedor. Sin IA.
- `@yigora/demo-data`: farmacia ficticia de 17 productos con palabras clave en 6 idiomas.
- `apps/extension`: lectura automática de los mensajes de hoy del chat individual abierto (solo lectura),
  ventana flotante arrastrable y minimizable, cambio de idioma de respuesta, copiar, pausa y entrada manual.
  Guía: `docs/DEMO.md`.

### En desarrollo

- Revisión del PR de la Fase 1 y del PR de la demo.
- Validación de la lectura de WhatsApp en una cuenta real (comentarios del propietario).

### Pendientes

- Fases 2 a 7 del roadmap.

## Roadmap

Cada fase termina con pruebas verdes, documentación actualizada y revisión del propietario.

| Fase                   | Entregables                                                                                                                                                                                                                                                                                                      | Criterio de cierre                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **0 — Planificación**  | Documentación, decisiones, riesgos                                                                                                                                                                                                                                                                               | Aprobación del propietario                                  |
| **1 — Fundación**      | Repositorio `yigora`, monorepo, TS estricto, ESLint (capas y sin ciclos), Prettier, Vitest, Playwright, CI (lint, tipos, pruebas, gitleaks), `.env.example`, Supabase local, migraciones iniciales (orgs con estado de acceso, platform_admins, memberships, products, RLS), tokens de diseño + componentes base | CI verde; pruebas pgTAP de aislamiento multiempresa pasan   |
| **2 — Interfaz**       | Landing Yigora, inicio de sesión por invitación, dashboard (estado, inventario, empresa, idioma), administración de accesos, demo con ventana flotante simulada                                                                                                                                                  | E2E de navegación y accesibilidad básica                    |
| **3 — Inventario**     | Seed ficticio, CRUD, importador XLSX/CSV con mapeo, validación, diff, confirmación transaccional, historial, reversión                                                                                                                                                                                           | Escenarios 1–8 pasan                                        |
| **4 — Motor**          | Normalización, búsqueda (RPC), intención, entidades, disponibilidad, plantillas, `LlmProvider` + mock, presupuesto de tokens, `GroundingValidator`, límites de frecuencia                                                                                                                                        | Escenarios 10, 11, 15 pasan                                 |
| **5 — Multilingüismo** | Detección de idioma, traducción con términos protegidos, respuestas en 6 idiomas, selector manual, conjunto de pruebas de precisión                                                                                                                                                                              | Escenarios 12–14 pasan; precisión medida y documentada      |
| **6 — Extensión**      | MV3, ventana flotante (iframe + Shadow DOM), vinculación de sesión, lectura automática de mensajes de hoy, respaldo manual, _spike_ de estabilidad                                                                                                                                                               | Escenarios 16–17 pasan; informe de viabilidad del adaptador |
| **7 — Calidad final**  | Auditoría de seguridad, rendimiento, documentación, correcciones, informe final                                                                                                                                                                                                                                  | Todas las pruebas verdes; informe entregado                 |

## Decisiones (resueltas el 2026-11-18)

| #   | Decisión                                      | Resultado                                                                             |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------- |
| D1  | Monorepo pnpm                                 | Aceptada (ADR-001)                                                                    |
| D2  | Integración WhatsApp                          | **Lectura automática al entrar al chat del cliente, solo mensajes del día** (ADR-004) |
| D3  | Interfaz en WhatsApp                          | **Ventana flotante con recomendaciones** (ADR-005)                                    |
| D4  | Modelo de IA                                  | **Claude Haiku 5.5** (`claude-haiku-5-5`) (ADR-007)                                   |
| D5  | Backend Next.js + Supabase                    | Aceptada (ADR-002)                                                                    |
| D6  | Hosting Vercel + Supabase Cloud               | Aceptada; región de Supabase por confirmar al crear el proyecto                       |
| D7  | Sesión de la extensión en memoria             | Aceptada                                                                              |
| D8  | Campos extra de producto y `product_keywords` | Aceptada                                                                              |
| D9  | Nombres de productos                          | **Siempre los de la BD** (ADR-012)                                                    |
| D10 | Celdas con fórmula                            | **Usar el valor ya calculado** (ADR-013)                                              |
| D11 | Acceso                                        | **Solo por invitación; el propietario concede el acceso; sin demo pública** (ADR-011) |
| D12 | Repositorio                                   | `divfabss/yigora` creado por el propietario                                           |
| D13 | Retención                                     | Aceptada (30 días / 12 meses)                                                         |
| D14 | Revisión legal                                | Recomendada antes de distribuir a clientes                                            |
| D15 | Nombre del producto                           | **Yigora**                                                                            |

### Región de Supabase (D6)

Para clientes en México, Centroamérica, Caribe y norte de Sudamérica, `us-east-1` (Virginia) suele dar
menor latencia que `sa-east-1` (São Paulo), que favorece a Brasil y el Cono Sur. Ninguna ley de los
países considerados exige almacenar los datos en el país, pero conviene confirmarlo con asesoría legal
antes de elegir. Cambiar de región después requiere migrar la base de datos.

### Preguntas abiertas menores (con valor por defecto)

- Chats de grupo: **excluidos** por defecto.
- Mensajes salientes del vendedor: se leen solo como contexto; el análisis se dispara con mensajes entrantes.
- Botón "Ver demostración" de la landing: lleva a **solicitar acceso/demostración** (formulario de contacto); la demo interactiva requiere sesión con acceso concedido.

## Riesgos técnicos y limitaciones

| Riesgo                                                                                                                                                                                     | Impacto | Mitigación                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Lectura automática de WhatsApp: cambios frecuentes del DOM y restricciones de las condiciones de uso (posible riesgo para la cuenta del vendedor) — **riesgo aceptado por el propietario** | Alto    | Adaptador aislado de solo lectura; alcance mínimo (hoy, chat abierto); pausa; respaldo manual; ruta oficial futura; revisión legal |
| Sugerencias de medicamentos incorrectas o no respaldadas                                                                                                                                   | Alto    | IA sin conocimiento médico propio; solo datos verificados; validador; avisos; marca de receta                                      |
| Datos de salud enviados a un proveedor externo                                                                                                                                             | Alto    | No almacenar; minimizar; contrato con proveedor; IA desactivable                                                                   |
| Fallo de RLS → fuga entre empresas                                                                                                                                                         | Alto    | Pruebas pgTAP en CI; advisors de Supabase; doble barrera                                                                           |
| Detección de idioma en mensajes muy cortos ("ok", "precio?")                                                                                                                               | Medio   | Contexto de mensajes previos; confianza visible; selector manual                                                                   |
| Heterogeneidad de Excel (separadores decimales, codificación, encabezados)                                                                                                                 | Medio   | Mapeo asistido; detección de ambigüedad; plantilla descargable                                                                     |
| Costo y latencia de IA (mayor volumen por lectura automática)                                                                                                                              | Medio   | Haiku 5.5; determinista primero; llamadas agrupadas; análisis solo con mensajes entrantes nuevos; caché; topes                     |
| Ventana flotante tapando o interfiriendo con WhatsApp                                                                                                                                      | Medio   | Tamaño compacto, arrastrable, minimizable; iframe aislado                                                                          |
| Revisión de Chrome Web Store para extensiones que operan en WhatsApp                                                                                                                       | Medio   | Permisos mínimos y justificados; distribución no listada en piloto                                                                 |
| Concurrencia entre importaciones y ediciones                                                                                                                                               | Medio   | `inventory_version` + bloqueo en transacción                                                                                       |
| Supabase local requiere Docker                                                                                                                                                             | Bajo    | Documentado en `DEVELOPMENT.md`                                                                                                    |

Limitaciones conocidas: la lectura depende de la estructura actual de WhatsApp Web y puede romperse sin aviso;
su estabilidad real solo se confirmará con una cuenta de prueba en la Fase 6.

## Deuda técnica

- No se impide eliminar o degradar al último `owner` de una organización (agregar trigger en la Fase 2,
  junto con la administración de miembros).
- `products.last_import_id` no tiene FK todavía; se agrega con `import_batches` en la Fase 3.
- Acciones de GitHub fijadas por versión mayor, no por SHA.
- Proyecto de Supabase Cloud aún no creado (requiere elegir región).
- La extensión aún no tiene sesión de usuario ni llama al API (modo demostración local, ADR-016).
- El motor determinista no traduce literalmente al español; requiere el adaptador de IA (Fase 5).
- "Hoy" se calcula con la hora del equipo del vendedor; no usa todavía la zona horaria de la empresa.

## Errores conocidos

Ninguno conocido. La lectura de WhatsApp Web solo se ha validado contra una réplica de su estructura.

## Próximas tareas

1. Propietario prueba la demo (`docs/DEMO.md`) en su WhatsApp Web y reporta si la lectura funciona.
2. Revisar e integrar el PR de la Fase 1 y luego el de la demo.
3. Elegir la región de Supabase (D6) para crear el proyecto en la nube.
4. Fase 2: landing, inicio de sesión por invitación, dashboard y administración de accesos.
5. Fase 3: importación de inventario (Excel/CSV) y conexión extensión ↔ API.
