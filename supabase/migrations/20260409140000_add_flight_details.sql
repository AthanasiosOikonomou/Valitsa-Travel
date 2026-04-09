alter table public.trips
  add column if not exists flight_details jsonb not null default '[]'::jsonb;

alter table public.trips
  add column if not exists flight_details_enabled boolean not null default false;

comment on column public.trips.flight_details is
  'Bilingual flight legs: departure/return free text per row.';
