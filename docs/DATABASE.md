# Base de datos

> **Estado:** diseño aprobado (Fase 0). No existen migraciones todavía.

Motor: PostgreSQL en Supabase. Extensiones: `pg_trgm`, `unaccent`. Esquema de helpers: `app`.
Migraciones versionadas en `supabase/migrations/` (Supabase CLI). Pruebas de RLS con pgTAP en `supabase/tests/`.

## 1. Tablas

### organizations
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text not null | |
| slug | text unique not null | |
| business_type | text not null | `check in ('pharmacy')`, ampliable |
| knowledge_base_language | text not null default `'es'` | BCP-47 |
| default_currency | char(3) not null default `'CRC'` | |
| stale_after_hours | int not null default 24 | umbral de "información desactualizada" |
| inventory_version | bigint not null default 0 | se incrementa en cada cambio de inventario |
| ai_settings | jsonb not null default `'{}'` | modelo, límites; validado con Zod |
| is_demo | boolean not null default false | |
| access_status | text not null default `'active'` | `check in ('active','suspended')`; lo cambia solo el administrador de plataforma |
| access_expires_at | timestamptz null | fin opcional del periodo de acceso |
| created_at | timestamptz | |

### platform_admins
`user_id` PK FK → `auth.users`, `created_at`. Administradores de Yigora (el propietario), que conceden y
retiran accesos. Sin políticas de escritura para usuarios: se gestiona por migración o consola.

### memberships
`organization_id` FK, `user_id` FK → `auth.users`, `role` enum `org_role ('owner','admin','seller')`,
PK `(organization_id, user_id)`.

### profiles
`id` = `auth.users.id`, `full_name`, `created_at`. Datos mínimos.

### products
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK not null | |
| sku | text null | único por organización si existe |
| name | text not null | 1–200 caracteres |
| normalized_name | text generada | `lower(app.immutable_unaccent(name))` |
| description | text null | ≤ 2 000 |
| usage_recommendations | text null | recomendaciones **verificadas** por la empresa |
| stock_quantity | int **null** | `check (stock_quantity >= 0)`; **null = desconocido** |
| stock_updated_at | timestamptz null | |
| price | numeric(12,2) null | `check (price >= 0)`; null = sin precio |
| currency | char(3) not null default `'CRC'` | |
| requires_prescription | boolean null | _propuesto, requiere aprobación_ |
| attributes | jsonb not null default `'{}'` | campos del vertical (p. ej. principio activo, concentración) |
| is_active | boolean not null default true | "eliminar" = desactivar |
| is_demo_data | boolean not null default false | |
| search_vector | tsvector generada | nombre + descripción |
| last_import_id | uuid null FK | |
| created_at / updated_at | timestamptz | `updated_at` por trigger |

Restricciones: `unique (organization_id, normalized_name) where is_active`, `unique (organization_id, sku)`.

### product_keywords
Sinónimos, marcas, principios activos e indicaciones **multilingües** cargadas por la empresa
(p. ej. `allergy`, `alergia`, `Allergie` → Loratadina).
`id`, `organization_id`, `product_id` FK, `keyword`, `language`, `kind ('synonym','brand','active_ingredient','indication')`.

### import_batches
`id`, `organization_id`, `created_by`, `source_type ('xlsx','csv')`, `file_name`, `file_size`, `file_sha256`,
`status` enum (`uploaded`, `previewed`, `committing`, `committed`, `failed`, `cancelled`, `reverted`),
`column_mapping` jsonb, `summary` jsonb (conteos), `base_inventory_version` bigint, `handle_missing`
(`keep` | `deactivate`), `error_code`, `created_at`, `committed_at`.
**No se guarda el archivo original** (solo hash y metadatos).

### import_rows (staging, retención 30 días)
`id`, `batch_id`, `organization_id`, `row_number`, `parsed` jsonb, `status ('valid','invalid','duplicate')`,
`errors` jsonb, `action ('create','update','unchanged','skip')`, `matched_product_id`.

### import_changes (auditoría y reversión)
`id`, `batch_id`, `organization_id`, `product_id`, `change_type ('created','updated','deactivated')`,
`before` jsonb, `after` jsonb.

### ai_usage_events (sin contenido)
`id`, `organization_id`, `user_id`, `operation`, `provider`, `model`, `input_tokens`, `output_tokens`,
`latency_ms`, `outcome ('ok','timeout','error','budget_exceeded','fallback')`, `created_at`.

### rate_limit_counters
`key` text, `window_start` timestamptz, `count` int, PK `(key, window_start)`. Usado por `app.check_rate_limit()`.

### audit_log
`id`, `organization_id`, `actor_id`, `action`, `entity`, `entity_id`, `metadata` jsonb (sin datos personales), `created_at`.

**No existen tablas de clientes finales ni de conversaciones** (minimización de datos).

## 2. Estados de inventario

Derivados en `packages/domain` (función pura `deriveStockStatus`) y nunca persistidos:

| Estado | Regla |
|---|---|
| `unknown` (Stock desconocido) | `stock_quantity is null` |
| `out_of_stock` (Sin existencias) | `stock_quantity = 0` |
| `available` (Disponible) | `stock_quantity > 0` |
| `stale` (Información desactualizada) | indicador adicional: `stock_updated_at` más antiguo que `stale_after_hours` |

`stale` se combina con los demás (p. ej. "Disponible · desactualizado"). Un valor vacío en una importación
produce `null`, **nunca 0**.

## 3. Row Level Security

- RLS habilitado y forzado en todas las tablas del esquema `public`.
- Helpers `SECURITY DEFINER`, `STABLE`, `set search_path = ''`:
  - `app.is_org_member(org uuid) → boolean` — miembro **y** empresa con acceso activo y no vencido
  - `app.has_org_role(org uuid, roles org_role[]) → boolean` — mismas condiciones + rol
  - `app.is_platform_admin() → boolean`
- Como ambos helpers exigen acceso activo, suspender una empresa corta su acceso a todos los datos de inmediato.
- `organizations.access_status` y `access_expires_at` solo son modificables por administradores de plataforma.
- Patrón `(select auth.uid())` en políticas para que el planificador lo evalúe una sola vez.

| Tabla | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| organizations | miembros | owner (update) |
| memberships | miembros de la org | owner / admin |
| products, product_keywords | miembros | owner / admin (delete denegado: se desactiva) |
| import_* | owner / admin | owner / admin vía RPC |
| ai_usage_events | owner / admin | insert: el propio usuario miembro |
| audit_log | owner / admin | solo vía funciones |
| rate_limit_counters | nadie | solo vía `app.check_rate_limit` |

Pruebas pgTAP obligatorias: usuario de la org A no puede leer/escribir datos de la org B (escenario 9),
`seller` no puede importar ni editar, un usuario de una empresa suspendida no ve nada, un miembro no puede
cambiar `access_status`, y anónimo no ve nada (no hay demo pública).

## 4. Índices

- `products (organization_id)`; GIN `normalized_name gin_trgm_ops`; GIN `search_vector`.
- `product_keywords (organization_id)`; GIN `keyword gin_trgm_ops`.
- `import_batches (organization_id, created_at desc)`; `import_rows (batch_id)`.
- `ai_usage_events (organization_id, created_at)`.

`unaccent` no es `IMMUTABLE`; se crea el contenedor `app.immutable_unaccent(text)` para columnas generadas
e índices.

## 5. Importación transaccional

1. **Preparar** (`POST /imports`, `/preview`): el servidor parsea y valida, guarda filas en `import_rows`,
   calcula el diff contra el inventario actual y registra `base_inventory_version`.
2. **Confirmar** (`POST /imports/:id/commit`) llama a `app.commit_import(batch_id, expected_version,
   handle_missing, confirm_deactivate_count)` (`SECURITY INVOKER`, RLS aplica):
   - bloquea la fila de la organización (`FOR UPDATE`);
   - si `inventory_version` cambió desde la vista previa → error `INVENTORY_CHANGED` (hay que regenerar la vista previa);
   - aplica altas y modificaciones; desactiva ausentes **solo** si `handle_missing = 'deactivate'` y el conteo
     confirmado coincide;
   - escribe `import_changes` con `before`/`after`, incrementa `inventory_version`, marca el lote `committed`.
   - Cualquier error revierte toda la transacción; el lote queda `failed` (escenario 8) y el inventario intacto.
3. **Revertir** (`app.revert_import`): restaura `before` si ningún lote o edición posterior tocó esos productos.

Celdas con fórmula (D10): se toma el valor ya calculado que guarda el archivo; la fórmula nunca se evalúa y la
fila se marca con una advertencia informativa en la vista previa. Si la celda no tiene valor calculado, queda
vacía (stock vacío = desconocido).

Emparejamiento de filas con productos existentes: por `sku` si la columna está mapeada; si no, por
`normalized_name`.

## 6. Datos de demostración

`supabase/seed.sql` crea "Farmacia Demo (ficticia)" con ≤ 20 productos marcados `is_demo_data = true`,
descripciones genéricas rotuladas como ficticias, e incluye casos de prueba: sin stock, stock desconocido,
información desactualizada y sin precio.

## 7. Migraciones

Una migración por cambio lógico, nombrada `YYYYMMDDHHMMSS_<descripcion>.sql`. Nunca editar una migración ya
aplicada en un entorno compartido; crear una nueva. Revisar los *advisors* de seguridad y rendimiento de
Supabase después de cada migración.
