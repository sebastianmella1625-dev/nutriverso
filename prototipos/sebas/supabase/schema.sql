-- NutriVerso · contrato de datos (brief-prototipos.md §3). Pegar UNA vez en Supabase → SQL Editor.
-- Datos simulados. Las políticas son de DEMO: anon puede leer e insertar, pero no borrar ni editar (D-29).

create table if not exists readings (
  id          uuid primary key default gen_random_uuid(),
  crew_id     text not null,
  indicator   text not null check (indicator in (
                'heart_rate','bp_systolic','bp_diastolic','glucose',
                'body_temp','sleep_hours','mood',
                'water_ml','energy_kcal','protein_g','body_mass_kg')),
  value       numeric not null,
  unit        text not null,
  measured_at timestamptz not null default now(),
  source      text not null default 'simulated'
);

create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  crew_id     text not null,
  from_role   text not null check (from_role in ('crew','ground')),
  body        text not null check (char_length(body) <= 1000),
  created_at  timestamptz not null default now(),
  deliver_at  timestamptz
);

create index if not exists readings_crew_time on readings (crew_id, measured_at);
create index if not exists messages_crew_time on messages (crew_id, created_at);

alter table readings enable row level security;
alter table messages enable row level security;

create policy demo_read_readings   on readings for select to anon using (true);
create policy demo_insert_readings on readings for insert to anon with check (true);
create policy demo_read_messages   on messages for select to anon using (true);
create policy demo_insert_messages on messages for insert to anon with check (true);

alter publication supabase_realtime add table readings, messages;
