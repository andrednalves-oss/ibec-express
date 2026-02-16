export type UserRole = 'admin' | 'operacional' | 'cliente' | 'colaborador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Delivery {
  id: string;
  clientName: string;
  clientId: string;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  date: string;
  value: number;
  type: 'avulsa' | 'contrato';
  description?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  type: 'motorista' | 'motoboy';
  status: 'available' | 'busy' | 'offline';
  deliveries: number;
  rating: number;
  photo?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cnpj: string;
  contractType: 'avulso' | 'fixo';
  totalOrders: number;
  createdAt: string;
}

export interface FinancialEntry {
  id: string;
  type: 'revenue' | 'expense';
  category: string;
  description: string;
  value: number;
  date: string;
}

export interface PayrollEntry {
  id: string;
  driverId: string;
  driverName: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  total: number;
}
