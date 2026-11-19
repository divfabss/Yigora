-- País y zona horaria por organización (mercado Latinoamérica).
begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

insert into public.organizations (id, name, slug) values
  ('0a000000-0000-4000-8000-000000000000', 'Farmacia A', 'farmacia-a');

select is(
  (select timezone from public.organizations where id = '0a000000-0000-4000-8000-000000000000'),
  'America/Costa_Rica',
  'la zona horaria por defecto es Costa Rica'
);

select lives_ok(
  $$update public.organizations set country_code = 'MX', timezone = 'America/Mexico_City' where id = '0a000000-0000-4000-8000-000000000000'$$,
  'se puede configurar otro país de Latinoamérica'
);

select throws_ok(
  $$update public.organizations set timezone = 'America/No_Existe' where id = '0a000000-0000-4000-8000-000000000000'$$,
  '22023', null,
  'se rechazan zonas horarias inexistentes'
);

select throws_ok(
  $$update public.organizations set country_code = 'mx' where id = '0a000000-0000-4000-8000-000000000000'$$,
  '23514', null,
  'el país debe ser un código ISO en mayúsculas'
);

select lives_ok(
  $$update public.organizations set knowledge_base_language = 'es-419' where id = '0a000000-0000-4000-8000-000000000000'$$,
  'se acepta español latinoamericano (es-419)'
);

select * from finish();
rollback;
