ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS participation text,
  ADD COLUMN IF NOT EXISTS participation_el text;
