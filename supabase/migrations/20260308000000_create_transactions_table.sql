CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  accounts_receivable NUMERIC(12, 2) NOT NULL DEFAULT 0,
  spare_parts_income NUMERIC(12, 2) NOT NULL DEFAULT 0,
  general_income NUMERIC(12, 2) NOT NULL DEFAULT 0,
  workshop_expenses NUMERIC(12, 2) NOT NULL DEFAULT 0,
  spare_parts_expense NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for all access (public access following project pattern)
CREATE POLICY "Allow all access to transactions"
  ON transactions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
