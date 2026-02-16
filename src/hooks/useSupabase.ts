import { useState, useEffect, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import {
  mockDrivers, mockClients, mockDeliveries, mockFinancials, mockPayroll, users as mockUsers
} from '../data/mockData';
import type { User, Driver, Client, Delivery, FinancialEntry, PayrollEntry } from '../types';

// ===== Mappers: DB Row -> App Types =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbUser(u: any): User {
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar_url || undefined };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbDriver(d: any): Driver {
  return { id: d.id, name: d.name, phone: d.phone, vehicle: d.vehicle, plate: d.plate, type: d.type, status: d.status, deliveries: d.deliveries_count ?? 0, rating: Number(d.rating ?? 5), photo: d.photo_url || undefined };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbClient(c: any): Client {
  return { id: c.id, name: c.name, email: c.email, phone: c.phone, address: c.address, cnpj: c.cnpj, contractType: c.contract_type, totalOrders: c.total_orders ?? 0, createdAt: c.created_at?.split('T')[0] || '' };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbDelivery(d: any): Delivery {
  return { id: d.id, clientName: d.client_name, clientId: d.client_id, driverId: d.driver_id, driverName: d.driver_name, origin: d.origin, destination: d.destination, status: d.status, date: d.delivery_date, value: Number(d.value), type: d.type, description: d.description || undefined };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbFinancial(f: any): FinancialEntry {
  return { id: f.id, type: f.type, category: f.category, description: f.description, value: Number(f.value), date: f.entry_date };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbPayroll(p: any): PayrollEntry {
  return { id: p.id, driverId: p.driver_id, driverName: p.driver_name, month: p.month, baseSalary: Number(p.base_salary), bonus: Number(p.bonus), deductions: Number(p.deductions), total: Number(p.total) };
}

// ===== AUTH HOOK =====
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    setError(null);

    const supabase = getSupabase();

    if (!supabase) {
      // Modo offline - usar dados mockados
      const user = mockUsers.find(u => u.email === email);
      setLoading(false);
      if (!user) { setError('Usuário não encontrado'); return null; }
      if (password !== 'admin123') { setError('Senha incorreta'); return null; }
      return user;
    }

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .eq('active', true)
        .single();

      if (dbError || !data) {
        setError('E-mail ou senha incorretos');
        return null;
      }
      return mapDbUser(data);
    } catch {
      setError('Erro ao conectar com servidor');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error };
}

// ===== DRIVERS HOOK =====
export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setDrivers(mockDrivers);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('drivers').select('*').eq('active', true).order('created_at', { ascending: false });
      if (error) throw error;
      setDrivers(data ? data.map(mapDbDriver) : []);
    } catch {
      console.warn('Fallback para dados locais (drivers)');
      setDrivers(mockDrivers);
    }
    setLoading(false);
  }, []);

  const addDriver = useCallback(async (driver: Omit<Driver, 'id' | 'deliveries' | 'rating' | 'status'>) => {
    const supabase = getSupabase();
    if (!supabase) {
      const newDriver: Driver = { id: `d${Date.now()}`, ...driver, status: 'available', deliveries: 0, rating: 5.0 };
      setDrivers(prev => [newDriver, ...prev]);
      return newDriver;
    }
    const { data, error } = await supabase.from('drivers').insert({
      name: driver.name, phone: driver.phone, vehicle: driver.vehicle, plate: driver.plate, type: driver.type,
    }).select().single();
    if (error) throw error;
    const mapped = mapDbDriver(data);
    setDrivers(prev => [mapped, ...prev]);
    return mapped;
  }, []);

  const updateDriver = useCallback(async (id: string, updates: Partial<Driver>) => {
    const supabase = getSupabase();
    if (!supabase) {
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      return;
    }
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.vehicle) dbUpdates.vehicle = updates.vehicle;
    if (updates.plate) dbUpdates.plate = updates.plate;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.status) dbUpdates.status = updates.status;

    await supabase.from('drivers').update(dbUpdates).eq('id', id);
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const deleteDriver = useCallback(async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      setDrivers(prev => prev.filter(d => d.id !== id));
      return;
    }
    await supabase.from('drivers').update({ active: false }).eq('id', id);
    setDrivers(prev => prev.filter(d => d.id !== id));
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  return { drivers, loading, fetchDrivers, addDriver, updateDriver, deleteDriver };
}

// ===== CLIENTS HOOK =====
export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setClients(mockClients);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('clients').select('*').eq('active', true).order('created_at', { ascending: false });
      if (error) throw error;
      setClients(data ? data.map(mapDbClient) : []);
    } catch {
      console.warn('Fallback para dados locais (clients)');
      setClients(mockClients);
    }
    setLoading(false);
  }, []);

  const addClient = useCallback(async (client: Omit<Client, 'id' | 'totalOrders' | 'createdAt'>) => {
    const supabase = getSupabase();
    if (!supabase) {
      const newClient: Client = { id: `c${Date.now()}`, ...client, totalOrders: 0, createdAt: new Date().toISOString().split('T')[0] };
      setClients(prev => [newClient, ...prev]);
      return newClient;
    }
    const { data, error } = await supabase.from('clients').insert({
      name: client.name, email: client.email, phone: client.phone,
      address: client.address, cnpj: client.cnpj, contract_type: client.contractType,
    }).select().single();
    if (error) throw error;
    const mapped = mapDbClient(data);
    setClients(prev => [mapped, ...prev]);
    return mapped;
  }, []);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    const supabase = getSupabase();
    if (!supabase) {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      return;
    }
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.address) dbUpdates.address = updates.address;
    if (updates.cnpj) dbUpdates.cnpj = updates.cnpj;
    if (updates.contractType) dbUpdates.contract_type = updates.contractType;

    await supabase.from('clients').update(dbUpdates).eq('id', id);
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      setClients(prev => prev.filter(c => c.id !== id));
      return;
    }
    await supabase.from('clients').update({ active: false }).eq('id', id);
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  return { clients, loading, fetchClients, addClient, updateClient, deleteClient };
}

// ===== DELIVERIES HOOK =====
export function useDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setDeliveries(mockDeliveries);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('deliveries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDeliveries(data ? data.map(mapDbDelivery) : []);
    } catch {
      console.warn('Fallback para dados locais (deliveries)');
      setDeliveries(mockDeliveries);
    }
    setLoading(false);
  }, []);

  const addDelivery = useCallback(async (delivery: Omit<Delivery, 'id' | 'date' | 'status'>) => {
    const supabase = getSupabase();
    if (!supabase) {
      const newDel: Delivery = { id: `e${Date.now()}`, ...delivery, status: 'pending', date: new Date().toISOString().split('T')[0] };
      setDeliveries(prev => [newDel, ...prev]);
      return newDel;
    }
    const { data, error } = await supabase.from('deliveries').insert({
      client_id: delivery.clientId, client_name: delivery.clientName,
      driver_id: delivery.driverId, driver_name: delivery.driverName,
      origin: delivery.origin, destination: delivery.destination,
      value: delivery.value, type: delivery.type, description: delivery.description || null,
    }).select().single();
    if (error) throw error;
    const mapped = mapDbDelivery(data);
    setDeliveries(prev => [mapped, ...prev]);
    return mapped;
  }, []);

  const updateDeliveryStatus = useCallback(async (id: string, status: Delivery['status']) => {
    const supabase = getSupabase();
    if (!supabase) {
      setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      return;
    }
    await supabase.from('deliveries').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  }, []);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  return { deliveries, loading, fetchDeliveries, addDelivery, updateDeliveryStatus };
}

// ===== FINANCIAL HOOK =====
export function useFinancials() {
  const [financials, setFinancials] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinancials = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setFinancials(mockFinancials);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('financial_entries').select('*').order('entry_date', { ascending: false });
      if (error) throw error;
      setFinancials(data ? data.map(mapDbFinancial) : []);
    } catch {
      console.warn('Fallback para dados locais (financials)');
      setFinancials(mockFinancials);
    }
    setLoading(false);
  }, []);

  const addFinancial = useCallback(async (entry: Omit<FinancialEntry, 'id'>) => {
    const supabase = getSupabase();
    if (!supabase) {
      const newEntry: FinancialEntry = { id: `f${Date.now()}`, ...entry };
      setFinancials(prev => [newEntry, ...prev]);
      return newEntry;
    }
    const { data, error } = await supabase.from('financial_entries').insert({
      type: entry.type, category: entry.category, description: entry.description,
      value: entry.value, entry_date: entry.date,
    }).select().single();
    if (error) throw error;
    const mapped = mapDbFinancial(data);
    setFinancials(prev => [mapped, ...prev]);
    return mapped;
  }, []);

  useEffect(() => { fetchFinancials(); }, [fetchFinancials]);

  return { financials, loading, fetchFinancials, addFinancial };
}

// ===== PAYROLL HOOK =====
export function usePayroll() {
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setPayroll(mockPayroll);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('payroll').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPayroll(data ? data.map(mapDbPayroll) : []);
    } catch {
      console.warn('Fallback para dados locais (payroll)');
      setPayroll(mockPayroll);
    }
    setLoading(false);
  }, []);

  const addPayrollEntry = useCallback(async (entry: Omit<PayrollEntry, 'id'>) => {
    const supabase = getSupabase();
    if (!supabase) {
      const newEntry: PayrollEntry = { id: `p${Date.now()}`, ...entry };
      setPayroll(prev => [newEntry, ...prev]);
      return newEntry;
    }
    const { data, error } = await supabase.from('payroll').insert({
      driver_id: entry.driverId, driver_name: entry.driverName, month: entry.month,
      base_salary: entry.baseSalary, bonus: entry.bonus, deductions: entry.deductions, total: entry.total,
    }).select().single();
    if (error) throw error;
    const mapped = mapDbPayroll(data);
    setPayroll(prev => [mapped, ...prev]);
    return mapped;
  }, []);

  useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

  return { payroll, loading, fetchPayroll, addPayrollEntry };
}
