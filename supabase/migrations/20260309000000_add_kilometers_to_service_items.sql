-- Add kilometers column to service_items table
ALTER TABLE service_items ADD COLUMN IF NOT EXISTS kilometers INTEGER DEFAULT 0;

-- Update existing items to have the kilometers of the record they belong to as a starting point
UPDATE service_items
SET kilometers = sr.kilometers
FROM service_records sr
WHERE service_items.service_record_id = sr.id;
