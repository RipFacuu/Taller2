CREATE TABLE IF NOT EXISTS spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;

-- Create policy for all access (assuming local dev for now, following existing project patterns)
CREATE POLICY "Allow all access to spare_parts"
  ON spare_parts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
