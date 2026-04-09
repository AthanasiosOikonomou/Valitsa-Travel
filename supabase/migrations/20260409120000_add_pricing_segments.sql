-- Independent departure offers: month+days, hotel, duration, room prices; not merged like departure_windows.
alter table public.trips
  add column if not exists pricing_segments jsonb not null default '[]'::jsonb;

comment on column public.trips.pricing_segments is
  'Independent departure offers: month+days, hotel, duration, room prices; not merged like departure_windows.';
