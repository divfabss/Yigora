-- =============================================================================
-- Yigora · Migración 2: organizaciones, membresías y control de acceso
-- =============================================================================
-- Acceso solo por invitación (ADR-011). El administrador de plataforma concede
-- y retira el acceso de cada organización.

create type public.org_role as enum ('owner', 'admin', 'seller');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  slug text not null unique
    check (char_length(slug) <= 60 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  business_type text not null default 'pharmacy' check (business_type in ('pharmacy')),
  knowledge_base_language text not null default 'es'
    check (knowledge_base_language ~ '^[a-z]{2,3}(-[A-Z]{2})?$'),
  default_currency char(3) not null default 'CRC' check (default_currency ~ '^[A-Z]{3}$'),
  stale_after_hours integer not null default 24 check (stale_after_hours between 1 and 8760),
  inventory_version bigint not null default 0 check (inventory_version >= 0),
  ai_settings jsonb not null default '{}'::jsonb check (jsonb_typeof(ai_settings) = 'object'),
  is_demo boolean not null default false,
  access_status text not null default 'active' check (access_status in ('active', 'suspended')),
  access_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.organizations.access_status is
  'Solo modificable por administradores de plataforma. suspended = sin acceso inmediato.';
comment on column public.organizations.inventory_version is
  'Se incrementa en cada cambio de inventario; control de concurrencia de importaciones.';

create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.org_role not null default 'seller',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index memberships_user_id_idx on public.memberships (user_id);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function app.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function app.set_updated_at();

-- -----------------------------------------------------------------------------
-- Funciones de autorización (SECURITY DEFINER para evitar recursión de RLS)
-- -----------------------------------------------------------------------------

create or replace function app.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins pa where pa.user_id = (select auth.uid())
  )
$$;

-- Verdadero si el usuario actual tiene uno de los roles indicados en la
-- organización Y la organización tiene acceso activo y no vencido.
create or replace function app.has_org_role(target_org_id uuid, allowed_roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    join public.organizations o on o.id = m.organization_id
    where m.organization_id = target_org_id
      and m.user_id = (select auth.uid())
      and m.role = any (allowed_roles)
      and o.access_status = 'active'
      and (o.access_expires_at is null or o.access_expires_at > now())
  )
$$;

create or replace function app.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.has_org_role(target_org_id, enum_range(null::public.org_role))
$$;

-- Columnas que solo el administrador de plataforma puede cambiar.
create or replace function app.protect_platform_managed_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Roles privilegiados (postgres, service_role) y administradores de plataforma pueden cambiarlas.
  if current_user not in ('authenticated', 'anon') or app.is_platform_admin() then
    return new;
  end if;
  if new.access_status is distinct from old.access_status
     or new.access_expires_at is distinct from old.access_expires_at
     or new.ai_settings is distinct from old.ai_settings
     or new.is_demo is distinct from old.is_demo
     or new.business_type is distinct from old.business_type
     or new.slug is distinct from old.slug then
    raise exception 'only platform administrators can change access settings'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger organizations_protect_platform_columns
  before update on public.organizations
  for each row execute function app.protect_platform_managed_columns();

-- Crea el perfil al crearse un usuario en auth.users (alta por invitación).
create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();

revoke all on function app.is_platform_admin() from public;
revoke all on function app.has_org_role(uuid, public.org_role[]) from public;
revoke all on function app.is_org_member(uuid) from public;
revoke all on function app.protect_platform_managed_columns() from public;
revoke all on function app.handle_new_user() from public;
grant execute on function app.is_platform_admin() to authenticated, service_role;
grant execute on function app.has_org_role(uuid, public.org_role[]) to authenticated, service_role;
grant execute on function app.is_org_member(uuid) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Privilegios y RLS
-- -----------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.platform_admins enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;

revoke all on public.organizations, public.platform_admins, public.profiles, public.memberships
  from anon;

-- Solo columnas editables; inventory_version se cambia exclusivamente mediante funciones.
revoke update, delete on public.organizations from authenticated;
grant update (name, knowledge_base_language, default_currency, stale_after_hours,
              access_status, access_expires_at, ai_settings, is_demo, business_type, slug)
  on public.organizations to authenticated;

revoke insert, update, delete on public.platform_admins from authenticated;
revoke delete on public.profiles from authenticated;

create policy organizations_select on public.organizations
  for select to authenticated
  using (app.is_org_member(id) or app.is_platform_admin());

create policy organizations_insert on public.organizations
  for insert to authenticated
  with check (app.is_platform_admin());

create policy organizations_update on public.organizations
  for update to authenticated
  using (app.has_org_role(id, '{owner}') or app.is_platform_admin())
  with check (app.has_org_role(id, '{owner}') or app.is_platform_admin());

create policy platform_admins_select_self on public.platform_admins
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or app.is_platform_admin());

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy memberships_select on public.memberships
  for select to authenticated
  using (
    (user_id = (select auth.uid()) and app.is_org_member(organization_id))
    or app.has_org_role(organization_id, '{owner,admin}')
    or app.is_platform_admin()
  );

create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (app.has_org_role(organization_id, '{owner}') or app.is_platform_admin());

create policy memberships_update on public.memberships
  for update to authenticated
  using (app.has_org_role(organization_id, '{owner}') or app.is_platform_admin())
  with check (app.has_org_role(organization_id, '{owner}') or app.is_platform_admin());

create policy memberships_delete on public.memberships
  for delete to authenticated
  using (app.has_org_role(organization_id, '{owner}') or app.is_platform_admin());

create trigger memberships_prevent_org_change
  before update on public.memberships
  for each row execute function app.prevent_organization_change();
