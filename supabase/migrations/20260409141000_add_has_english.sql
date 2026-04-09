alter table public.trips
  add column if not exists has_english boolean not null default false;

comment on column public.trips.has_english is
  'When true, admin UI requires English fields and persists them; when false, English may be omitted and cleared on save.';

-- Trips that already have English copy should open with English enabled so a save does not wipe it unintentionally.
update public.trips
set has_english = true
where trim(coalesce(title, '')) <> ''
   or trim(coalesce(location, '')) <> ''
   or trim(coalesce(country, '')) <> ''
   or trim(coalesce(departure_city, '')) <> ''
   or trim(coalesce(trip_notes, '')) <> ''
   or trim(coalesce(description, '')) <> ''
   or trim(coalesce(date_range, '')) <> '';
