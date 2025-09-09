ALTER TABLE events
ADD COLUMN date timestamptz DEFAULT now();