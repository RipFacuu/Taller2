export interface ServiceItem {
  id?: string;
  service_record_id?: string;
  description: string;
  amount: number;
  date: string;
  order_index: number;
   kilometers?: number;
}

export interface ServiceRecord {
  id?: string;
  category: string;
  client_name: string;
  phone: string;
  date: string;
  brand: string;
  model: string;
  plate: string;
  kilometers: number;
  total: number;
  payment: number;
  payment_method: string;
  balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface SparePart {
  id?: string;
  date: string;
  description: string;
  cost: number;
  quantity?: number;
  created_at?: string;
}

export interface Transaction {
  id?: string;
  date: string;
  description: string;
  accounts_receivable: number; // Entradas Cuentas / Cobros
  spare_parts_income: number;   // Repuestos (Ingreso)
  general_income: number;       // Entradas (Gral)
  workshop_expenses: number;    // Gastos Taller
  spare_parts_expense: number;  // Repuestos (Gasto)
  created_at?: string;
}

export type Category = 'G1' | 'Camioneros';
