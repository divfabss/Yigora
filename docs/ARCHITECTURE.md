# Arquitectura

> **Estado:** diseño aprobado en Fase 0 (decisiones del 2026-11-18). Nada de esto está implementado aún.

## 1. Vista general

```
┌──────────────────────────── Navegador del vendedor (Chrome) ────────────────────────────┐
│  Pestaña WhatsApp Web                                                                   │
│  ┌───────────────────────────────────────────┐                                          │
│  │ content script                            │      chrome.runtime        ┌───────────┐ │
│  │  ├─ adaptador WhatsApp (SOLO LECTURA):     │ ───── mensajes (Zod) ────▶ │ service   │ │
│  │  │   detecta cambio de chat y lee los      │                            │ worker    │ │
│  │  │   mensajes de HOY del chat abierto      │ ◀───────────────────────── │ (router,  │ │
│  │  └─ anfitrión de la ventana flotante:      │                            │  sesión,  │ │
│  │      Shadow DOM cerrado + iframe           │                            │  cliente  │ │
│  │      chrome-extension://…/overlay.html ◀───┼──── mensajes (Zod) ──────▶ │  API)     │ │
│  └───────────────────────────────────────────┘                            └─────┬─────┘ │
└─────────────────────────────────────────────────────────────────────────────────┼───────┘
                                                   HTTPS + Bearer (JWT de usuario) │
                                                                                   ▼
                     ┌───────────────────── apps/web (Next.js) ─────────────────────┐
                     │ Landing · Dashboard · Administración de accesos · API /api/v1 │
                     │   server/: auth · control de acceso · rate-limit · logging    │
                     │   usa: suggestion-engine · importer · ai · domain             │
                     └───────────────┬───────────────────────────────┬──────────────┘
                                     │ cliente Supabase con JWT       │ LlmProvider
                                     ▼ del usuario (RLS aplica)       ▼ (solo si hace falta)
                     ┌──────────────────────────────┐   ┌──────────────────────────┐
                     │ Supabase: Postgres + Auth    │   │ Claude Haiku 5.5         │
                     │ RLS multiempresa · RPC       │   │ (adaptador intercambiable)│
                     └──────────────────────────────┘   └──────────────────────────┘
```

Principios:

- **Una sola puerta de backend:** la extensión y el dashboard llaman a `apps/web/api`. La extensión no conoce
  claves de Supabase ni del proveedor de IA.
- **Mínimo privilegio en BD:** el servidor crea un cliente Supabase por petición con el JWT del usuario, de modo
  que RLS se aplica siempre. La Service Role Key no se usa en el flujo normal (reservada para tareas
  administrativas puntuales, nunca expuesta).
- **Inversión de dependencias:** `suggestion-engine` e `importer` definen _puertos_ (interfaces); `apps/web`
  inyecta los adaptadores (Supabase, proveedor IA). Esto permite probar el motor sin red ni BD.

## 2. Estructura de carpetas

```
/
├── CLAUDE.md · README.md · .env.example · .gitignore
├── package.json · pnpm-workspace.yaml · tsconfig.base.json · eslint.config.mjs
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── app/(marketing)/          # landing
│   │       ├── app/(dashboard)/panel/    # dashboard: inventario, importaciones, idioma, empresa
│   │       ├── app/demo/                 # demostración (solo usuarios con acceso concedido)
│   │       ├── app/(admin)/admin/            # administración de accesos (solo administrador de plataforma)
│   │       ├── app/api/v1/               # route handlers (delgados: validar → servicio → responder)
│   │       ├── features/<feature>/       # componentes y hooks de presentación por funcionalidad
│   │       └── server/                   # auth, db, rate-limit, logging, services/
│   └── extension/
│       └── src/
│           ├── background/               # service worker: router de mensajes, sesión, cliente API
│           ├── content/whatsapp/         # adaptador DOM de solo lectura (selectores aislados en un archivo)
│           ├── content/overlay-host/     # inserta y posiciona la ventana flotante (Shadow DOM + iframe)
│           ├── overlay/                  # UI React de la ventana flotante (página de la extensión)
│           └── shared/                   # contratos de mensajería (Zod)
├── packages/
│   ├── domain/            # entidades, esquemas Zod, contratos API, estados de inventario
│   ├── suggestion-engine/ # pipeline + puertos + plantillas de respuesta multilingües
│   ├── ai/                # LlmProvider, adaptadores, presupuesto de tokens, timeouts, reintentos
│   ├── importer/          # parseo seguro, detección de mapeo, validación, diff
│   ├── ui/                # tokens de diseño + componentes shadcn/ui compartidos (web y ventana flotante)
│   ├── i18n/              # catálogo tipado de textos es-419
│   ├── demo-data/         # farmacia ficticia (demo y pruebas)
│   └── config/            # tsconfig/eslint compartidos
├── supabase/
│   ├── config.toml · migrations/ · seed.sql · tests/ (pgTAP)
└── docs/
```

Reglas de dependencia (se harán cumplir con ESLint):

```
domain  ←  suggestion-engine, importer, ai  ←  apps/web, apps/extension
ui, i18n  ←  apps/web, apps/extension
```

`domain` no depende de nada interno. Los paquetes no importan desde `apps/`. Sin ciclos.

## 3. Responsabilidades de los módulos

| Módulo                           | Responsabilidad única                                                            | No hace                                           |
| -------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| `domain`                         | Definir tipos, esquemas y reglas puras (p. ej. `deriveStockStatus`)              | E/S, red, BD                                      |
| `suggestion-engine`              | Orquestar el pipeline de análisis y componer sugerencias                         | Hablar con Supabase o la IA directamente          |
| `ai`                             | Llamar al proveedor con límites (tokens, tiempo, frecuencia) y registrar consumo | Conocer el inventario o reglas de negocio         |
| `importer`                       | Convertir un archivo en filas normalizadas + errores + diff                      | Escribir en BD                                    |
| `apps/web/server/services`       | Casos de uso (importar, sugerir, administrar productos)                          | Renderizar UI                                     |
| `apps/web/app/api`               | Autenticar, validar entrada, delegar, serializar salida                          | Contener lógica de negocio                        |
| `extension/background`           | Sesión, enrutamiento de mensajes, llamadas al API                                | Leer el DOM                                       |
| `extension/content/whatsapp`     | Detectar el chat abierto y leer el texto de los mensajes de hoy                  | Escribir en WhatsApp, enviar, hacer clic o scroll |
| `extension/content/overlay-host` | Insertar, mover, minimizar y restaurar la ventana flotante                       | Leer mensajes, mostrar datos                      |
| `extension/overlay`              | Mostrar análisis y permitir copiar                                               | Lógica de negocio, acceso al DOM de WhatsApp      |

## 4. Motor de sugerencias

> **Implementado (modo determinista):** `packages/suggestion-engine`. Normalización, detección de idioma por
> léxico, intención por frases, búsqueda tolerante a errores (`createInMemoryProductSearch`), preguntas de
> seguimiento con contexto, plantillas en 6 idiomas y validador de cifras. **Pendiente:** adaptador de IA
> (traducción literal, idiomas fuera de los 6) y adaptador de búsqueda sobre Supabase.

### 4.1 Pipeline

```
mensaje(s) ─▶ 1 normalizar ─▶ 2 detectar idioma ─▶ 3 intención ─▶ 4 entidades ─▶ 5 buscar productos
          ─▶ 6 decidir si hace falta IA ─▶ 7 componer respuesta ─▶ 8 traducir/validar ─▶ 9 resultado
```

| Paso       | Puerto (interfaz)    | Implementación por defecto (sin IA)                                                                       | Respaldo con IA                  |
| ---------- | -------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Normalizar | `TextNormalizer`     | minúsculas, sin tildes, colapsar letras repetidas, abreviaturas (`xfa`, `q`, `pls`, `tb`)                 | —                                |
| Idioma     | `LanguageDetector`   | léxico por idioma para mensajes cortos + detector por trigramas para textos largos; devuelve confianza    | si confianza < umbral            |
| Intención  | `IntentClassifier`   | reglas por idioma: `availability`, `price`, `product_info`, `recommendation_by_need`, `greeting`, `other` | si la regla no decide            |
| Entidades  | `EntityExtractor`    | coincidencia con nombres, SKU y `product_keywords` (sinónimos/indicaciones multilingües verificados)      | si no hay coincidencias          |
| Búsqueda   | `ProductSearch`      | RPC `search_products` (trigramas + texto completo + palabras clave), máx. 5 resultados                    | —                                |
| Respuesta  | `ResponseComposer`   | plantillas por intención y por idioma con datos de BD                                                     | redacción más natural (opcional) |
| Validación | `GroundingValidator` | verifica que todo precio, cantidad y nombre del texto final exista en los datos recuperados               | —                                |

**Llamadas de IA agrupadas:** los módulos están separados en código, pero cuando hace falta IA el adaptador
puede resolver idioma + traducción + intención + entidades en **una sola llamada con salida estructurada**
(JSON validado con Zod). Máximo esperado por consulta: 0 llamadas (español con coincidencia clara),
1 llamada (otro idioma), 2 llamadas (si además se pide redacción natural de la respuesta).

### 4.2 Control de costos y tokens

- Modelo (D4): **Claude Haiku 5.5** (`claude-haiku-5-5`), configurable por organización. Razonamiento al
  mínimo necesario (esfuerzo bajo) para tareas de clasificación y traducción.
- Al modelo solo se envían: los últimos N mensajes relevantes (por defecto 5, truncados a ~1 500 caracteres)
  y como máximo 5 productos recuperados, con los campos necesarios.
- Límites configurables por organización: modelo, `max_tokens`, tiempo de espera, solicitudes por minuto,
  presupuesto diario de tokens.
- Registro de consumo en `ai_usage_events` (tokens, latencia, modelo, resultado) **sin contenido**.
- Caché en memoria de corta duración por `hash(mensaje normalizado + org + inventory_version)`; no se persiste
  contenido de mensajes en BD.
- Si la IA falla, excede tiempo o presupuesto: respuesta determinista por plantilla + aviso "Traducción no
  disponible" (nunca se bloquea al vendedor).

### 4.3 Reglas de veracidad (farmacia)

- La IA **no** recomienda medicamentos con su propio conocimiento. Las asociaciones necesidad→producto salen
  de `product_keywords` cargadas y verificadas por la farmacia.
- Las recomendaciones de uso solo se citan textualmente desde `usage_recommendations`.
- Productos con receta (`requires_prescription`) se marcan y la sugerencia lo indica.
- Toda sugerencia de farmacia incluye una invitación a consultar al farmacéutico (configurable por vertical).
- Datos de demostración rotulados como **ficticios** en la interfaz.

### 4.4 Verticales de negocio

`organizations.business_type` selecciona un **perfil de vertical** en código (`pharmacy`, más adelante
`restaurant`, `hotel`, …) que define: campos extra en `products.attributes` (validados con Zod), intenciones
habilitadas, plantillas y avisos legales. El núcleo no cambia al agregar un vertical.

## 5. Arquitectura multilingüe

Cuatro conceptos independientes:

| Concepto                          | Origen                                                      | Valor inicial           |
| --------------------------------- | ----------------------------------------------------------- | ----------------------- |
| Idioma de la interfaz             | catálogo `packages/i18n`                                    | `es-419` fijo en el MVP |
| Idioma de la conversación         | detectado por mensaje (con contexto de mensajes previos)    | automático              |
| Idioma de la base de conocimiento | `organizations.knowledge_base_language`                     | `es`                    |
| Idioma de la respuesta sugerida   | por defecto = idioma detectado; el vendedor puede cambiarlo | automático              |

- **Nombres de productos (D9):** siempre se usa el nombre tal como está en la base de datos, en cualquier
  idioma de respuesta (p. ej. "We currently have Loratadina 10 mg available").
- **Términos protegidos:** antes de traducir, nombres comerciales, principios activos, dosis,
  concentraciones, códigos y cantidades se sustituyen por marcadores (`⟦T1⟧`) y se restauran después; el
  `GroundingValidator` comprueba que se preservaron. No se traducen términos médicos inventando equivalentes.
- **Plantillas** para las intenciones comunes en es/en/pt/fr/de/it → la mayoría de respuestas no requieren IA.
  Otros idiomas: generación con IA (con la misma validación).
- La interfaz siempre muestra al vendedor: mensaje original, traducción al español, intención detectada,
  idioma detectado con confianza, y respuesta en el idioma elegido.

## 6. Integración con WhatsApp Web

**Decisión del propietario (D2):** lectura **automática** al entrar al chat de un cliente, limitada a los
mensajes **del día**. No existe una API pública para que una extensión lea WhatsApp Web y sus condiciones de uso
restringen el acceso automatizado; el propietario acepta ese riesgo (ver `SECURITY.md` §7). La integración se
mantiene detrás del puerto `ConversationSource` para poder sustituirla sin tocar el motor:

| Fuente                      | Uso                                                                         |
| --------------------------- | --------------------------------------------------------------------------- |
| `WhatsAppDomSource`         | Principal. Lectura automática del chat abierto (reglas abajo)               |
| `ManualInputSource`         | Respaldo: el vendedor pega texto en la ventana flotante si la lectura falla |
| `DemoConversationSource`    | Conversaciones simuladas para demostración y pruebas                        |
| `WhatsAppBusinessApiSource` | Futuro: API oficial de WhatsApp Business Platform                           |

### 6.1 Reglas de lectura

1. **Disparador:** el adaptador detecta que el vendedor abrió o cambió de chat (observación del contenedor de
   la conversación, con _debounce_ de ~500 ms) y cuando llega un mensaje **entrante** nuevo al chat abierto.
2. **Alcance temporal:** solo mensajes con fecha de **hoy** (zona horaria `America/Costa_Rica`), según la fecha
   del separador o del metadato del mensaje. Si no se puede determinar la fecha de un mensaje, se excluye.
3. **Alcance de chats:** solo el chat abierto por el vendedor; solo chats individuales (los grupos se excluyen
   por defecto).
4. **Sin automatizar la página:** no hace _scroll_ para cargar historial, no hace clic, no escribe, no inserta
   texto ni despacha eventos. Solo lee texto ya renderizado.
5. **Minimización:** se extrae únicamente texto, dirección (entrante/saliente) y hora. Se descartan nombres,
   números de teléfono, fotos, audios y adjuntos.
6. **Contexto:** se envían al motor como máximo los últimos N mensajes de hoy (por defecto 10); los salientes se
   usan solo como contexto. El análisis se repite solo si hay mensajes entrantes nuevos (hash del estado del chat).
7. **Control del vendedor:** botón "Pausar lectura" y un indicador visible "Leyendo mensajes de hoy".
8. **Sin persistencia:** nada se guarda en el navegador más allá del último análisis en memoria de sesión.
9. **Fallos:** si los selectores no coinciden (cambio de WhatsApp), la ventana muestra "No se pudo leer la
   conversación" y ofrece pegar el texto (escenario 16). Los selectores viven en un único archivo con
   verificación de salud.

La estabilidad real se medirá con una cuenta de prueba en la Fase 6.

## 7. Extensión Chrome (MV3) y ventana flotante

> **Implementado (demo 0.1.0):** `apps/extension`. El motor corre dentro del service worker con la farmacia
> ficticia (ADR-016). La conexión al API y la sesión por usuario llegarán con la Fase 2.
>
> Flujo: content script (lector + anfitrión) → `chrome.runtime.sendMessage` → service worker
> (`SuggestionService`) → puerto `yigora-overlay` → ventana flotante (iframe). Un `sessionId` aleatorio en el
> hash del iframe empareja cada pestaña con su ventana. El service worker guarda las conversaciones solo en
> memoria; si se reinicia, pide al content script que vuelva a leer.

**Decisión del propietario (D3):** ventana flotante sobre WhatsApp Web, con las recomendaciones.

- **Aislamiento:** el content script inserta un elemento anfitrión con **Shadow DOM cerrado** que contiene un
  **iframe** a `overlay.html` de la extensión (declarado en `web_accessible_resources` solo para
  `web.whatsapp.com`). La página de WhatsApp no puede leer el contenido del iframe (origen distinto) y los
  estilos no se mezclan.
- **Comunicación:** iframe ↔ service worker ↔ content script mediante `chrome.runtime` con esquemas Zod. No se
  usa `window.postMessage`, que la página podría falsificar.
- **Comportamiento:** arrastrable, minimizable a una burbuja pequeña, expandible y reabrible desde el icono de la
  extensión. Tamaño compacto por defecto, ubicada para no tapar la caja de redacción; no bloquea clics fuera de
  ella. La posición se recuerda en `chrome.storage.local`; el estado (minimizada, idioma elegido, último
  análisis) en `chrome.storage.session`.
- **Contenido:** estado del asistente, mensaje original, traducción, intención, producto, descripción, precio,
  existencias (con indicador de desactualizado), sugerencia comercial, respuesta recomendada, selector de idioma
  y botón Copiar (`navigator.clipboard.writeText` con gesto del usuario).
- **Permisos:** `storage`; `host_permissions` para `https://web.whatsapp.com/*` y el origen del API. Nada más.
- **Acceso:** la extensión no funciona sin una sesión de un usuario con acceso concedido (ver §10).

## 8. Importación de inventario (resumen)

Flujo en dos fases — **preparar** y **confirmar** — con el diff calculado en servidor y la escritura en una
única transacción de BD. Detalle en `docs/DATABASE.md` §5.

```
subir archivo ─▶ validar archivo ─▶ cabeceras + muestra ─▶ mapeo de columnas ─▶ validar filas
   ─▶ diff (nuevos / modificados / ausentes / inválidos / cambios de stock) ─▶ confirmación explícita
   ─▶ RPC commit_import (transacción + control de versión) ─▶ historial (+ reversión)
```

Fuentes futuras implementan el puerto `InventorySource` (Google Sheets, POS, API, carpeta compartida) y
reutilizan el mismo pipeline de validación, diff y confirmación.

## 9. Contratos principales (borrador)

| Endpoint                      | Método         | Rol mínimo                  | Descripción                                                         |
| ----------------------------- | -------------- | --------------------------- | ------------------------------------------------------------------- |
| `/api/v1/suggestions`         | POST           | seller                      | `{ messages[], replyLanguage? }` → análisis + productos + respuesta |
| `/api/v1/products`            | GET            | seller                      | lista paginada                                                      |
| `/api/v1/products/:id`        | PATCH          | admin                       | edición manual                                                      |
| `/api/v1/imports`             | POST           | admin                       | sube archivo → cabeceras, muestra, mapeo sugerido                   |
| `/api/v1/imports/:id/preview` | POST           | admin                       | mapeo → validación + diff                                           |
| `/api/v1/imports/:id/commit`  | POST           | admin                       | confirma con `expectedInventoryVersion`                             |
| `/api/v1/imports/:id/revert`  | POST           | admin                       | revierte si no hubo cambios posteriores                             |
| `/api/v1/admin/organizations` | GET/POST/PATCH | administrador de plataforma | crear empresas, activar/suspender acceso                            |
| `/api/v1/admin/invitations`   | POST           | administrador de plataforma | invitar usuarios a una empresa                                      |

Todos los cuerpos y respuestas se definirán como esquemas Zod en `packages/domain`.

## 10. Control de acceso a la plataforma

**Decisión del propietario (D11):** Yigora no es de uso libre; el propietario concede el acceso.

- Registro público **desactivado** en Supabase Auth. Solo se entra por invitación.
- El **administrador de plataforma** (el propietario) crea empresas, invita usuarios y activa o suspende el
  acceso desde `/admin`. Las invitaciones usan la API administrativa de Supabase Auth, que requiere la Service
  Role Key: se ejecuta solo en servidor, solo para administradores de plataforma.
- Cada empresa tiene `access_status` (`active`, `suspended`) y `access_expires_at` opcional. Cada petición al
  API y las políticas RLS verifican que la empresa esté activa; una empresa suspendida pierde acceso de
  inmediato, también desde la extensión.
- La demostración (farmacia ficticia) solo es visible para usuarios con acceso concedido.
- Cobro y suscripciones: fuera del MVP; el modelo de datos deja espacio para integrarlo después.
