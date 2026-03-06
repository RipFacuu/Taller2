/*
  # Sistema de Gestión de Taller Mecánico

  1. Nuevas Tablas
    - `service_records`
      - `id` (uuid, primary key)
      - `category` (text) - G1 o Camioneros
      - `client_name` (text) - Nombre y apellido del cliente
      - `phone` (text) - Teléfono de contacto
      - `date` (date) - Fecha del servicio
      - `brand` (text) - Marca del vehículo
      - `model` (text) - Modelo del vehículo
      - `plate` (text) - Patente
      - `kilometers` (numeric) - Kilómetros del vehículo
      - `total` (numeric) - Total calculado
      - `payment` (numeric) - Pago/Entrega realizado
      - `payment_method` (text) - Método de pago (Transferencia, Efectivo, USD)
      - `balance` (numeric) - Saldo pendiente (Debe)
      - `created_at` (timestamptz) - Fecha de creación del registro
      - `updated_at` (timestamptz) - Fecha de última actualización
    
    - `service_items`
      - `id` (uuid, primary key)
      - `service_record_id` (uuid, foreign key) - Relación con la ficha de servicio
      - `description` (text) - Descripción del repuesto o mano de obra
      - `amount` (numeric) - Monto en pesos
      - `order_index` (integer) - Orden de los ítems en la lista
      - `created_at` (timestamptz) - Fecha de creación

  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Políticas públicas para permitir operaciones CRUD (aplicación interna de taller)
*/

CREATE TABLE IF NOT EXISTS service_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  client_name text NOT NULL,
  phone text DEFAULT '',
  date date NOT NULL,
  brand text DEFAULT '',
  model text DEFAULT '',
  plate text DEFAULT '',
  kilometers numeric DEFAULT 0,
  total numeric DEFAULT 0,
  payment numeric DEFAULT 0,
  payment_method text DEFAULT '',
  balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_record_id uuid NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on service_records"
  ON service_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on service_items"
  ON service_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_service_records_category ON service_records(category);
CREATE INDEX IF NOT EXISTS idx_service_records_date ON service_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_service_items_service_record ON service_items(service_record_id);
