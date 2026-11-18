-- Verificaciones estructurales de seguridad del esquema.
begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'todas las tablas de public tienen RLS habilitado'
);

select is(
  (select count(*)::int
   from information_schema.role_table_grants
   where grantee = 'anon' and table_schema = 'public'),
  0,
  'el rol anon no tiene privilegios sobre tablas de public'
);

select is(
  (select count(*)::int
   from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('app', 'public')
     and p.prosecdef
     and not exists (
       select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%'
     )),
  0,
  'toda función SECURITY DEFINER fija search_path'
);

select ok(
  not has_schema_privilege('anon', 'app', 'usage'),
  'anon no puede usar el esquema app'
);

select ok(
  not has_function_privilege('authenticated', 'app.write_audit(uuid,text,text,uuid,jsonb)', 'execute'),
  'authenticated no puede escribir auditoría directamente'
);

select ok(
  not has_table_privilege('authenticated', 'public.products', 'delete'),
  'no existe borrado físico de productos para authenticated'
);

select ok(
  not has_column_privilege('authenticated', 'public.organizations', 'inventory_version', 'update'),
  'inventory_version no es editable directamente'
);

select * from finish();
rollback;
