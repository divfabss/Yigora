# Estado del proyecto

_Última actualización: 2026-11-18 — Fase 0 (planificación)._

## Resumen

| Área | Estado |
|---|---|
| Repositorio | Git local inicializado; repositorio remoto `yigora` pendiente de creación |
| Documentación base | Aprobada y actualizada con las decisiones del propietario |
| Código de aplicación | **No iniciado** |
| Pruebas | No existen |

## Funcionalidades

- **Completadas:** ninguna.
- **En desarrollo:** ninguna.
- **Pendientes:** todas las del roadmap.

## Roadmap

Cada fase termina con pruebas verdes, documentación actualizada y revisión del propietario.

| Fase | Entregables | Criterio de cierre |
|---|---|---|
| **0 — Planificación** | Documentación, decisiones, riesgos | Aprobación del propietario |
| **1 — Fundación** | Repositorio `yigora`, monorepo, TS estricto, ESLint (capas y sin ciclos), Prettier, Vitest, Playwright, CI (lint, tipos, pruebas, gitleaks), `.env.example`, Supabase local, migraciones iniciales (orgs con estado de acceso, platform_admins, memberships, products, RLS), tokens de diseño + componentes base | CI verde; pruebas pgTAP de aislamiento multiempresa pasan |
| **2 — Interfaz** | Landing Yigora, inicio de sesión por invitación, dashboard (estado, inventario, empresa, idioma), administración de accesos, demo con ventana flotante simulada | E2E de navegación y accesibilidad básica |
| **3 — Inventario** | Seed ficticio, CRUD, importador XLSX/CSV con mapeo, validación, diff, confirmación transaccional, historial, reversión | Escenarios 1–8 pasan |
| **4 — Motor** | Normalización, búsqueda (RPC), intención, entidades, disponibilidad, plantillas, `LlmProvider` + mock, presupuesto de tokens, `GroundingValidator`, límites de frecuencia | Escenarios 10, 11, 15 pasan |
| **5 — Multilingüismo** | Detección de idioma, traducción con términos protegidos, respuestas en 6 idiomas, selector manual, conjunto de pruebas de precisión | Escenarios 12–14 pasan; precisión medida y documentada |
| **6 — Extensión** | MV3, ventana flotante (iframe + Shadow DOM), vinculación de sesión, lectura automática de mensajes de hoy, respaldo manual, *spike* de estabilidad | Escenarios 16–17 pasan; informe de viabilidad del adaptador |
| **7 — Calidad final** | Auditoría de seguridad, rendimiento, documentación, correcciones, informe final | Todas las pruebas verdes; informe entregado |

## Decisiones (resueltas el 2026-11-18)

| # | Decisión | Resultado |
|---|---|---|
| D1 | Monorepo pnpm | Aceptada (ADR-001) |
| D2 | Integración WhatsApp | **Lectura automática al entrar al chat del cliente, solo mensajes del día** (ADR-004) |
| D3 | Interfaz en WhatsApp | **Ventana flotante con recomendaciones** (ADR-005) |
| D4 | Modelo de IA | **Claude Haiku 5.5** (`claude-haiku-5-5`) (ADR-007) |
| D5 | Backend Next.js + Supabase | Aceptada (ADR-002) |
| D6 | Hosting Vercel + Supabase Cloud | Aceptada; región de Supabase por confirmar al crear el proyecto |
| D7 | Sesión de la extensión en memoria | Aceptada |
| D8 | Campos extra de producto y `product_keywords` | Aceptada |
| D9 | Nombres de productos | **Siempre los de la BD** (ADR-012) |
| D10 | Celdas con fórmula | **Usar el valor ya calculado** (ADR-013) |
| D11 | Acceso | **Solo por invitación; el propietario concede el acceso; sin demo pública** (ADR-011) |
| D12 | Repositorio | Nuevo repositorio `yigora` — **pendiente: debe crearlo el propietario** (la sesión no puede crear repositorios) |
| D13 | Retención | Aceptada (30 días / 12 meses) |
| D14 | Revisión legal | Recomendada antes de distribuir a clientes |
| D15 | Nombre del producto | **Yigora** |

### Preguntas abiertas menores (con valor por defecto)

- Chats de grupo: **excluidos** por defecto.
- Mensajes salientes del vendedor: se leen solo como contexto; el análisis se dispara con mensajes entrantes.
- Botón "Ver demostración" de la landing: lleva a **solicitar acceso/demostración** (formulario de contacto); la demo interactiva requiere sesión con acceso concedido.

## Riesgos técnicos y limitaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Lectura automática de WhatsApp: cambios frecuentes del DOM y restricciones de las condiciones de uso (posible riesgo para la cuenta del vendedor) — **riesgo aceptado por el propietario** | Alto | Adaptador aislado de solo lectura; alcance mínimo (hoy, chat abierto); pausa; respaldo manual; ruta oficial futura; revisión legal |
| Sugerencias de medicamentos incorrectas o no respaldadas | Alto | IA sin conocimiento médico propio; solo datos verificados; validador; avisos; marca de receta |
| Datos de salud enviados a un proveedor externo | Alto | No almacenar; minimizar; contrato con proveedor; IA desactivable |
| Fallo de RLS → fuga entre empresas | Alto | Pruebas pgTAP en CI; advisors de Supabase; doble barrera |
| Detección de idioma en mensajes muy cortos ("ok", "precio?") | Medio | Contexto de mensajes previos; confianza visible; selector manual |
| Heterogeneidad de Excel (separadores decimales, codificación, encabezados) | Medio | Mapeo asistido; detección de ambigüedad; plantilla descargable |
| Costo y latencia de IA (mayor volumen por lectura automática) | Medio | Haiku 5.5; determinista primero; llamadas agrupadas; análisis solo con mensajes entrantes nuevos; caché; topes |
| Ventana flotante tapando o interfiriendo con WhatsApp | Medio | Tamaño compacto, arrastrable, minimizable; iframe aislado |
| Revisión de Chrome Web Store para extensiones que operan en WhatsApp | Medio | Permisos mínimos y justificados; distribución no listada en piloto |
| Concurrencia entre importaciones y ediciones | Medio | `inventory_version` + bloqueo en transacción |
| Supabase local requiere Docker | Bajo | Documentado en `DEVELOPMENT.md` |

Limitaciones conocidas: la lectura depende de la estructura actual de WhatsApp Web y puede romperse sin aviso;
su estabilidad real solo se confirmará con una cuenta de prueba en la Fase 6.

## Deuda técnica

Ninguna (no hay código).

## Próximas tareas

1. Propietario crea el repositorio privado `yigora` en GitHub y lo conecta a la sesión.
2. Subir el historial local (documentación de Fase 0) a `main`.
3. Iniciar Fase 1 en la rama `feat/foundation`.
