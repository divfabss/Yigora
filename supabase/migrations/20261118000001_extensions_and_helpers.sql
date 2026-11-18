-- =============================================================================
-- Yigora · Migración 1: extensiones y funciones auxiliares genéricas
-- =============================================================================
-- El esquema `app` contiene funciones internas. No está expuesto por la API
-- (config.toml solo expone `public`).

create schema if not exists app;
revoke all on schema app from public;
grant usage on schema app to authenticated, service_role;

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- unaccent() no es IMMUTABLE; este contenedor con diccionario explícito sí lo es
-- y permite usarlo en columnas generadas e índices.
create or replace function app.immutable_unaccent(value text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, value)
$$;

-- Normalización usada para comparar nombres: sin tildes, minúsculas,
-- espacios colapsados. Debe coincidir con `normalizeText` de @yigora/domain.
create or replace function app.normalize_text(value text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$
  select lower(btrim(regexp_replace(app.immutable_unaccent(value), '\s+', ' ', 'g')))
$$;

create or replace function app.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Impide mover una fila de una organización a otra.
create or replace function app.prevent_organization_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.organization_id is distinct from old.organization_id then
    raise exception 'organization_id is immutable' using errcode = '42501';
  end if;
  return new;
end;
$$;

alter default privileges in schema app revoke execute on functions from public;
revoke all on all functions in schema app from public;
grant execute on function app.immutable_unaccent(text) to authenticated, service_role;
grant execute on function app.normalize_text(text) to authenticated, service_role;
