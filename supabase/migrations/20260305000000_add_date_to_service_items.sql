-- Add date column to service_items table
ALTER TABLE service_items ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

-- Update existing items to have the date of the record they belong to
UPDATE service_items
SET date = sr.date
FROM service_records sr
WHERE service_items.service_record_id = sr.id;

-- Make it NOT NULL after population
ALTER TABLE service_items ALTER COLUMN date SET NOT NULL;
