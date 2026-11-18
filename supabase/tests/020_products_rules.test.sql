-- Reglas de datos de productos: normalización, stock desconocido, unicidad y auditoría.
begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into public.organizations (id, name, slug) values
  ('0a000000-0000-4000-8000-000000000000', 'Farmacia A', 'farmacia-a');

insert into public.products (id, organization_id, name, stock_quantity) values
  ('aa000000-0000-4000-8000-000000000001', '0a000000-0000-4000-8000-000000000000', '  Acetaminofén   Niños ', 4),
  ('aa000000-0000-4000-8000-000000000002', '0a000000-0000-4000-8000-000000000000', 'Loratadina 10 mg', null);

select is(
  (select normalized_name from public.products where id = 'aa000000-0000-4000-8000-000000000001'),
  'acetaminofen ninos',
  'normalized_name elimina tildes y espacios extra'
);

select isnt(
  (select stock_updated_at from public.products where id = 'aa000000-0000-4000-8000-000000000001'),
  null,
  'un stock conocido registra su fecha de actualización'
);

select is(
  (select stock_quantity from public.products where id = 'aa000000-0000-4000-8000-000000000002'),
  null,
  'el stock desconocido se conserva como NULL, no como 0'
);

update public.products set stock_updated_at = '2026-01-01T00:00:00Z' where id = 'aa000000-0000-4000-8000-000000000001';
update public.products set stock_quantity = 7 where id = 'aa000000-0000-4000-8000-000000000001';

select ok(
  (select stock_updated_at > '2026-01-01T00:00:00Z' from public.products where id = 'aa000000-0000-4000-8000-000000000001'),
  'cambiar la cantidad actualiza la fecha de stock'
);

select throws_ok(
  $$insert into public.products (organization_id, name) values ('0a000000-0000-4000-8000-000000000000', 'ACETAMINOFEN ninos')$$,
  '23505', null,
  'no se permiten productos activos duplicados por nombre normalizado'
);

update public.products set is_active = false where id = 'aa000000-0000-4000-8000-000000000001';

select lives_ok(
  $$insert into public.products (organization_id, name) values ('0a000000-0000-4000-8000-000000000000', 'Acetaminofén Niños')$$,
  'un producto desactivado no bloquea uno nuevo con el mismo nombre'
);

select throws_ok(
  $$insert into public.products (organization_id, name, price) values ('0a000000-0000-4000-8000-000000000000', 'Precio malo', -5)$$,
  '23514', null,
  'la BD rechaza precios negativos'
);

update public.organizations set access_status = 'suspended' where id = '0a000000-0000-4000-8000-000000000000';

select is(
  (select count(*)::int from public.audit_log where action = 'organization.access_changed'),
  1,
  'los cambios de acceso quedan auditados'
);

select * from finish();
rollback;
