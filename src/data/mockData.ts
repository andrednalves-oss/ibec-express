import { Delivery, Driver, Client, FinancialEntry, PayrollEntry, User } from '../types';

// ===== APENAS USUÁRIO ADMIN =====
export const users: User[] = [
  { id: '1', name: 'Admin IBEC', email: 'admin@ibecexpress.com.br', role: 'admin' },
];

// ===== LISTAS VAZIAS - SEM DADOS FICTÍCIOS =====
export const mockDrivers: Driver[] = [];
export const mockClients: Client[] = [];
export const mockDeliveries: Delivery[] = [];
export const mockFinancials: FinancialEntry[] = [];
export const mockPayroll: PayrollEntry[] = [];

// ===== DADOS VAZIOS PARA GRÁFICOS =====
export const weeklyPerformance = [
  { day: 'Seg', entregas: 0 },
  { day: 'Ter', entregas: 0 },
  { day: 'Qua', entregas: 0 },
  { day: 'Qui', entregas: 0 },
  { day: 'Sex', entregas: 0 },
  { day: 'Sáb', entregas: 0 },
  { day: 'Dom', entregas: 0 },
];

export const monthlyRevVsExp = [
  { month: 'Jan', receitas: 0, despesas: 0 },
  { month: 'Fev', receitas: 0, despesas: 0 },
  { month: 'Mar', receitas: 0, despesas: 0 },
  { month: 'Abr', receitas: 0, despesas: 0 },
  { month: 'Mai', receitas: 0, despesas: 0 },
  { month: 'Jun', receitas: 0, despesas: 0 },
];

export const dailyRequests = [
  { date: 'Seg', solicitacoes: 0 },
  { date: 'Ter', solicitacoes: 0 },
  { date: 'Qua', solicitacoes: 0 },
  { date: 'Qui', solicitacoes: 0 },
  { date: 'Sex', solicitacoes: 0 },
  { date: 'Sáb', solicitacoes: 0 },
  { date: 'Dom', solicitacoes: 0 },
];
