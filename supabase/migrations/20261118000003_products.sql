-- =============================================================================
-- Yigora · Migración 3: productos y palabras clave
-- =============================================================================
-- Reglas: stock NULL = desconocido (nunca 0). Sin borrado físico: is_active = false.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  sku text check (sku is null or char_length(btrim(sku)) between 1 and 64),
  name text not null check (char_length(btrim(name)) between 1 and 200),
  normalized_name text generated always as (app.normalize_text(name)) stored,
  description text check (description is null or char_length(description) <= 2000),
  usage_recommendations text
    check (usage_recommendations is null or char_length(usage_recommendations) <= 2000),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  stock_updated_at timestamptz,
  price numeric(12, 2) check (price is null or price >= 0),
  currency char(3) not null default 'CRC' check (currency ~ '^[A-Z]{3}$'),
  requires_prescription boolean,
  attributes jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes) = 'object'),
  is_active boolean not null default true,
  is_demo_data boolean not null default false,
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(app.immutable_unaccent(name), '')), 'A')
    || setweight(to_tsvector('simple', coalesce(app.immutable_unaccent(description), '')), 'B')
  ) stored,
  last_import_id uuid, -- la FK a import_batches se agrega en la fase de importación
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Permite FKs compuestas que garantizan la misma organización.
  unique (id, organization_id)
);

comment on column public.products.stock_quantity is 'NULL = stock desconocido. Nunca interpretar como 0.';

create unique index products_org_normalized_name_active_key
  on public.products (organization_id, normalized_name) where is_active;
create unique index products_org_sku_key
  on public.products (organization_id, sku) where sku is not null;
create index products_organization_id_idx on public.products (organization_id);
create index products_normalized_name_trgm_idx
  on public.products using gin (normalized_name extensions.gin_trgm_ops);
create index products_search_vector_idx on public.products using gin (search_vector);

create table public.product_keywords (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  product_id uuid not null,
  keyword text not null check (char_length(btrim(keyword)) between 1 and 100),
  normalized_keyword text generated always as (app.normalize_text(keyword)) stored,
  language text not null default 'es' check (language ~ '^[a-z]{2,3}(-[A-Z]{2})?$'),
  kind text not null check (kind in ('synonym', 'brand', 'active_ingredient', 'indication')),
  created_at timestamptz not null default now(),
  foreign key (product_id, organization_id)
    references public.products (id, organization_id) on delete cascade,
  unique (product_id, normalized_keyword, language)
);

create index product_keywords_organization_id_idx on public.product_keywords (organization_id);
create index product_keywords_keyword_trgm_idx
  on public.product_keywords using gin (normalized_keyword extensions.gin_trgm_ops);

-- Fecha de actualización de stock: se fija automáticamente si cambia la cantidad
-- y quien escribe no proporcionó una fecha explícita.
create or replace function app.track_stock_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.stock_quantity is not null and new.stock_updated_at is null then
      new.stock_updated_at := now();
    end if;
  elsif new.stock_quantity is distinct from old.stock_quantity
        and new.stock_updated_at is not distinct from old.stock_updated_at then
    new.stock_updated_at := now();
  end if;
  return new;
end;
$$;

revoke all on function app.track_stock_updated_at() from public;

create trigger products_track_stock_updated_at
  before insert or update on public.products
  for each row execute function app.track_stock_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function app.set_updated_at();

create trigger products_prevent_org_change
  before update on public.products
  for each row execute function app.prevent_organization_change();

create trigger product_keywords_prevent_org_change
  before update on public.product_keywords
  for each row execute function app.prevent_organization_change();

alter table public.products enable row level security;
alter table public.product_keywords enable row level security;

revoke all on public.products, public.product_keywords from anon;
revoke delete on public.products from authenticated;

create policy products_select on public.products
  for select to authenticated
  using (app.is_org_member(organization_id));

create policy products_insert on public.products
  for insert to authenticated
  with check (app.has_org_role(organization_id, '{owner,admin}'));

create policy products_update on public.products
  for update to authenticated
  using (app.has_org_role(organization_id, '{owner,admin}'))
  with check (app.has_org_role(organization_id, '{owner,admin}'));

create policy product_keywords_select on public.product_keywords
  for select to authenticated
  using (app.is_org_member(organization_id));

create policy product_keywords_insert on public.product_keywords
  for insert to authenticated
  with check (app.has_org_role(organization_id, '{owner,admin}'));

create policy product_keywords_update on public.product_keywords
  for update to authenticated
  using (app.has_org_role(organization_id, '{owner,admin}'))
  with check (app.has_org_role(organization_id, '{owner,admin}'));

create policy product_keywords_delete on public.product_keywords
  for delete to authenticated
  using (app.has_org_role(organization_id, '{owner,admin}'));
