-- =============================================================================
-- Yigora · Migración 4: registro de auditoría
-- =============================================================================
-- Solo metadatos; nunca contenido de mensajes ni datos personales de clientes.

create table public.audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (action ~ '^[a-z_]+\.[a-z_]+$'),
  entity text not null check (char_length(entity) <= 60),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index audit_log_org_created_idx on public.audit_log (organization_id, created_at desc);

alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon;
revoke insert, update, delete on public.audit_log from authenticated;

create policy audit_log_select on public.audit_log
  for select to authenticated
  using (app.has_org_role(organization_id, '{owner,admin}') or app.is_platform_admin());

create or replace function app.write_audit(
  p_organization_id uuid,
  p_action text,
  p_entity text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_log (organization_id, actor_id, action, entity, entity_id, metadata)
  values (p_organization_id, (select auth.uid()), p_action, p_entity, p_entity_id, p_metadata)
$$;

revoke all on function app.write_audit(uuid, text, text, uuid, jsonb) from public;

-- Auditoría automática de cambios de acceso de una organización.
create or replace function app.audit_organization_access()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.access_status is distinct from old.access_status
     or new.access_expires_at is distinct from old.access_expires_at then
    perform app.write_audit(
      new.id, 'organization.access_changed', 'organization', new.id,
      jsonb_build_object(
        'from_status', old.access_status, 'to_status', new.access_status,
        'expires_at', new.access_expires_at
      )
    );
  end if;
  return new;
end;
$$;

-- Auditoría de altas, cambios de rol y bajas de membresías.
create or replace function app.audit_membership_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform app.write_audit(new.organization_id, 'membership.created', 'membership', new.user_id,
      jsonb_build_object('role', new.role));
    return new;
  elsif tg_op = 'UPDATE' then
    if new.role is distinct from old.role then
      perform app.write_audit(new.organization_id, 'membership.role_changed', 'membership',
        new.user_id, jsonb_build_object('from_role', old.role, 'to_role', new.role));
    end if;
    return new;
  else
    -- Si la organización completa se está eliminando (cascada), no hay nada que auditar.
    if exists (select 1 from public.organizations o where o.id = old.organization_id) then
      perform app.write_audit(old.organization_id, 'membership.deleted', 'membership',
        old.user_id, jsonb_build_object('role', old.role));
    end if;
    return old;
  end if;
end;
$$;

revoke all on function app.audit_organization_access() from public;
revoke all on function app.audit_membership_change() from public;

create trigger organizations_audit_access
  after update on public.organizations
  for each row execute function app.audit_organization_access();

create trigger memberships_audit
  after insert or update or delete on public.memberships
  for each row execute function app.audit_membership_change();
