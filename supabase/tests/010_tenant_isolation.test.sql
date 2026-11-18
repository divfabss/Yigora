-- Aislamiento multiempresa, roles y control de acceso (escenario de prueba 9).
begin;
create extension if not exists pgtap with schema extensions;
select plan(29);

-- -----------------------------------------------------------------------------
-- Datos de prueba (como superusuario)
-- -----------------------------------------------------------------------------
insert into auth.users (id, email, aud, role) values
  ('a0000000-0000-4000-8000-000000000001', 'owner-a@test.local', 'authenticated', 'authenticated'),
  ('a0000000-0000-4000-8000-000000000002', 'seller-a@test.local', 'authenticated', 'authenticated'),
  ('b0000000-0000-4000-8000-000000000001', 'owner-b@test.local', 'authenticated', 'authenticated'),
  ('c0000000-0000-4000-8000-000000000001', 'seller-c@test.local', 'authenticated', 'authenticated'),
  ('d0000000-0000-4000-8000-000000000001', 'seller-d@test.local', 'authenticated', 'authenticated'),
  ('e0000000-0000-4000-8000-000000000001', 'outsider@test.local', 'authenticated', 'authenticated'),
  ('f0000000-0000-4000-8000-000000000001', 'platform@test.local', 'authenticated', 'authenticated');

insert into public.platform_admins (user_id) values ('f0000000-0000-4000-8000-000000000001');

insert into public.organizations (id, name, slug, access_status, access_expires_at) values
  ('0a000000-0000-4000-8000-000000000000', 'Farmacia A', 'farmacia-a', 'active', null),
  ('0b000000-0000-4000-8000-000000000000', 'Farmacia B', 'farmacia-b', 'active', null),
  ('0c000000-0000-4000-8000-000000000000', 'Farmacia C', 'farmacia-c', 'suspended', null),
  ('0d000000-0000-4000-8000-000000000000', 'Farmacia D', 'farmacia-d', 'active', now() - interval '1 day');

insert into public.memberships (organization_id, user_id, role) values
  ('0a000000-0000-4000-8000-000000000000', 'a0000000-0000-4000-8000-000000000001', 'owner'),
  ('0a000000-0000-4000-8000-000000000000', 'a0000000-0000-4000-8000-000000000002', 'seller'),
  ('0b000000-0000-4000-8000-000000000000', 'b0000000-0000-4000-8000-000000000001', 'owner'),
  ('0c000000-0000-4000-8000-000000000000', 'c0000000-0000-4000-8000-000000000001', 'seller'),
  ('0d000000-0000-4000-8000-000000000000', 'd0000000-0000-4000-8000-000000000001', 'seller');

insert into public.products (id, organization_id, name, stock_quantity, price) values
  ('aa000000-0000-4000-8000-000000000001', '0a000000-0000-4000-8000-000000000000', 'Producto A', 10, 1000),
  ('bb000000-0000-4000-8000-000000000001', '0b000000-0000-4000-8000-000000000000', 'Producto B', 5, 2000),
  ('cc000000-0000-4000-8000-000000000001', '0c000000-0000-4000-8000-000000000000', 'Producto C', 1, 3000),
  ('dd000000-0000-4000-8000-000000000001', '0d000000-0000-4000-8000-000000000000', 'Producto D', 1, 4000);

-- -----------------------------------------------------------------------------
-- Vendedor de A
-- -----------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}', true);

select results_eq(
  'select name from public.products order by name',
  $$values ('Producto A'::text)$$,
  'el vendedor de A solo ve productos de A'
);

select results_eq(
  'select name from public.organizations',
  $$values ('Farmacia A'::text)$$,
  'el vendedor de A solo ve su organización'
);

select throws_ok(
  $$insert into public.products (organization_id, name) values ('0a000000-0000-4000-8000-000000000000', 'Nuevo')$$,
  '42501', null,
  'el vendedor no puede crear productos'
);

update public.products set name = 'Modificado' where id = 'aa000000-0000-4000-8000-000000000001';

select is(
  (select count(*)::int from public.memberships),
  1,
  'el vendedor solo ve su propia membresía'
);

select is_empty('select id from public.audit_log', 'el vendedor no ve la auditoría');

-- -----------------------------------------------------------------------------
-- Dueño de A
-- -----------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

select is(
  (select name from public.products where id = 'aa000000-0000-4000-8000-000000000001'),
  'Producto A',
  'la edición del vendedor no tuvo efecto'
);

select lives_ok(
  $$insert into public.products (organization_id, name, stock_quantity) values ('0a000000-0000-4000-8000-000000000000', 'Nuevo A', 3)$$,
  'el dueño de A puede crear productos en A'
);

select throws_ok(
  $$insert into public.products (organization_id, name) values ('0b000000-0000-4000-8000-000000000000', 'Intruso')$$,
  '42501', null,
  'el dueño de A no puede crear productos en B'
);

update public.products set price = 1 where id = 'bb000000-0000-4000-8000-000000000001';

select throws_ok(
  $$update public.products set organization_id = '0b000000-0000-4000-8000-000000000000' where id = 'aa000000-0000-4000-8000-000000000001'$$,
  '42501', null,
  'no se puede mover un producto a otra organización'
);

select throws_ok(
  $$delete from public.products where id = 'aa000000-0000-4000-8000-000000000001'$$,
  '42501', null,
  'no existe borrado físico de productos'
);

select throws_ok(
  $$update public.products set stock_quantity = -1 where id = 'aa000000-0000-4000-8000-000000000001'$$,
  '23514', null,
  'la BD rechaza cantidades negativas'
);

select throws_ok(
  $$insert into public.product_keywords (organization_id, product_id, keyword, kind)
    values ('0a000000-0000-4000-8000-000000000000', 'bb000000-0000-4000-8000-000000000001', 'alergia', 'indication')$$,
  '23503', null,
  'no se puede asociar una palabra clave a un producto de otra organización'
);

select lives_ok(
  $$insert into public.product_keywords (organization_id, product_id, keyword, language, kind)
    values ('0a000000-0000-4000-8000-000000000000', 'aa000000-0000-4000-8000-000000000001', 'allergy', 'en', 'indication')$$,
  'el dueño puede agregar palabras clave a sus productos'
);

select throws_ok(
  $$update public.organizations set access_status = 'active', access_expires_at = now() + interval '10 years' where id = '0a000000-0000-4000-8000-000000000000'$$,
  '42501', null,
  'el dueño no puede cambiar el estado de acceso'
);

select throws_ok(
  $$update public.organizations set inventory_version = 99 where id = '0a000000-0000-4000-8000-000000000000'$$,
  '42501', null,
  'el dueño no puede alterar inventory_version'
);

select lives_ok(
  $$update public.organizations set name = 'Farmacia A Renovada' where id = '0a000000-0000-4000-8000-000000000000'$$,
  'el dueño puede cambiar el nombre de su empresa'
);

select throws_ok(
  $$insert into public.platform_admins (user_id) values ('a0000000-0000-4000-8000-000000000001')$$,
  '42501', null,
  'nadie puede autoasignarse administrador de plataforma'
);

select ok(
  (select count(*) from public.audit_log) > 0,
  'el dueño ve la auditoría de su organización'
);

select throws_ok(
  $$select app.write_audit('0a000000-0000-4000-8000-000000000000', 'fake.event', 'x', null, '{}')$$,
  '42501', null,
  'no se puede escribir auditoría directamente'
);

-- -----------------------------------------------------------------------------
-- Usuarios sin acceso
-- -----------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"e0000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select is_empty('select id from public.products', 'un usuario sin membresía no ve productos');
select is_empty('select id from public.organizations', 'un usuario sin membresía no ve organizaciones');

select set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select is_empty('select id from public.products', 'una empresa suspendida no ve sus productos');

select set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select is_empty('select id from public.products', 'una empresa con acceso vencido no ve sus productos');

-- -----------------------------------------------------------------------------
-- Administrador de plataforma
-- -----------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"f0000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

select is((select count(*)::int from public.organizations), 4, 'el administrador de plataforma ve todas las empresas');
select is_empty('select id from public.products', 'el administrador de plataforma no lee inventarios ajenos');

select lives_ok(
  $$update public.organizations set access_status = 'suspended' where id = '0a000000-0000-4000-8000-000000000000'$$,
  'el administrador de plataforma puede suspender una empresa'
);

select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
select is_empty('select id from public.products', 'tras la suspensión, el vendedor de A pierde el acceso');

-- -----------------------------------------------------------------------------
-- Anónimo y verificaciones finales (superusuario)
-- -----------------------------------------------------------------------------
set local role anon;
select throws_ok('select id from public.products', '42501', null, 'anon no puede leer productos');

reset role;

select is(
  (select price from public.products where id = 'bb000000-0000-4000-8000-000000000001'),
  2000.00::numeric,
  'el dueño de A no pudo modificar productos de B'
);

select * from finish();
rollback;
