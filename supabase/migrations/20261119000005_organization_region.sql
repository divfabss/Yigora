-- =============================================================================
-- Yigora · Migración 5: país y zona horaria por organización (mercado Latinoamérica)
-- =============================================================================
-- La moneda ya es configurable (default_currency). País y zona horaria permiten
-- operar en cualquier país de la región sin suponer Costa Rica.

alter table public.organizations
  add column country_code char(2) not null default 'CR'
    check (country_code ~ '^[A-Z]{2}$'),
  add column timezone text not null default 'America/Costa_Rica'
    check (char_length(timezone) between 3 and 64 and timezone ~ '^[A-Za-z_]+(/[A-Za-z0-9_+-]+)+$');

comment on column public.organizations.country_code is 'País ISO 3166-1 alfa-2.';
comment on column public.organizations.timezone is
  'Zona horaria IANA; define qué es "hoy" para la empresa en procesos de servidor.';

-- Ambas columnas las puede ajustar el dueño (no forman parte del control de acceso).
grant update (country_code, timezone) on public.organizations to authenticated;

-- Valida que la zona horaria exista en PostgreSQL.
create or replace function app.validate_organization_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'invalid timezone' using errcode = '22023';
  end if;
  return new;
end;
$$;

revoke all on function app.validate_organization_timezone() from public;

create trigger organizations_validate_timezone
  before insert or update of timezone on public.organizations
  for each row execute function app.validate_organization_timezone();

-- Códigos de idioma con región numérica UN M.49 (p. ej. es-419, español latinoamericano).
alter table public.organizations
  drop constraint organizations_knowledge_base_language_check,
  add constraint organizations_knowledge_base_language_check
    check (knowledge_base_language ~ '^[a-z]{2,3}(-([A-Z]{2}|[0-9]{3}))?$');

alter table public.product_keywords
  drop constraint product_keywords_language_check,
  add constraint product_keywords_language_check
    check (language ~ '^[a-z]{2,3}(-([A-Z]{2}|[0-9]{3}))?$');
