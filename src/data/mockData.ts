import { Delivery, Driver, Client, FinancialEntry, PayrollEntry, User } from '../types';

export const users: User[] = [
  { id: '1', name: 'Admin IBEC', email: 'admin@ibecexpress.com', role: 'admin' },
  { id: '2', name: 'João Operacional', email: 'operacional@ibecexpress.com', role: 'operacional' },
  { id: '3', name: 'Cliente ABC', email: 'cliente@abc.com', role: 'cliente' },
  { id: '4', name: 'Carlos Colaborador', email: 'carlos@ibecexpress.com', role: 'colaborador' },
];

export const mockDrivers: Driver[] = [
  { id: 'd1', name: 'Carlos Silva', phone: '(11) 99999-0001', vehicle: 'Fiorino', plate: 'ABC-1234', type: 'motorista', status: 'available', deliveries: 145, rating: 4.8 },
  { id: 'd2', name: 'Roberto Santos', phone: '(11) 99999-0002', vehicle: 'Honda CG 160', plate: 'DEF-5678', type: 'motoboy', status: 'busy', deliveries: 230, rating: 4.9 },
  { id: 'd3', name: 'André Oliveira', phone: '(11) 99999-0003', vehicle: 'Saveiro', plate: 'GHI-9012', type: 'motorista', status: 'available', deliveries: 89, rating: 4.5 },
  { id: 'd4', name: 'Felipe Costa', phone: '(11) 99999-0004', vehicle: 'Yamaha Factor', plate: 'JKL-3456', type: 'motoboy', status: 'busy', deliveries: 312, rating: 4.7 },
  { id: 'd5', name: 'Marcos Lima', phone: '(11) 99999-0005', vehicle: 'Kangoo', plate: 'MNO-7890', type: 'motorista', status: 'offline', deliveries: 67, rating: 4.3 },
  { id: 'd6', name: 'Lucas Pereira', phone: '(11) 99999-0006', vehicle: 'Honda Bros', plate: 'PQR-1234', type: 'motoboy', status: 'available', deliveries: 198, rating: 4.6 },
  { id: 'd7', name: 'Diego Almeida', phone: '(11) 99999-0007', vehicle: 'Strada', plate: 'STU-5678', type: 'motorista', status: 'busy', deliveries: 156, rating: 4.4 },
  { id: 'd8', name: 'Thiago Souza', phone: '(11) 99999-0008', vehicle: 'Honda XRE', plate: 'VWX-9012', type: 'motoboy', status: 'available', deliveries: 276, rating: 4.8 },
];

export const mockClients: Client[] = [
  { id: 'c1', name: 'Loja ABC Materiais', email: 'contato@abc.com', phone: '(11) 3333-0001', address: 'Rua Augusta, 500 - São Paulo', cnpj: '12.345.678/0001-01', contractType: 'fixo', totalOrders: 89, createdAt: '2024-01-15' },
  { id: 'c2', name: 'Restaurante Sabor & Cia', email: 'pedidos@sabor.com', phone: '(11) 3333-0002', address: 'Av. Paulista, 1200 - São Paulo', cnpj: '23.456.789/0001-02', contractType: 'fixo', totalOrders: 156, createdAt: '2023-11-20' },
  { id: 'c3', name: 'Tech Solutions LTDA', email: 'logistica@tech.com', phone: '(11) 3333-0003', address: 'Rua Faria Lima, 800 - São Paulo', cnpj: '34.567.890/0001-03', contractType: 'avulso', totalOrders: 34, createdAt: '2024-03-10' },
  { id: 'c4', name: 'Farmácia Saúde Total', email: 'entregas@saude.com', phone: '(11) 3333-0004', address: 'Rua Oscar Freire, 300 - São Paulo', cnpj: '45.678.901/0001-04', contractType: 'fixo', totalOrders: 210, createdAt: '2023-08-05' },
  { id: 'c5', name: 'E-commerce FastShop', email: 'logistica@fastshop.com', phone: '(11) 3333-0005', address: 'Av. Brasil, 2000 - São Paulo', cnpj: '56.789.012/0001-05', contractType: 'fixo', totalOrders: 178, createdAt: '2023-09-12' },
  { id: 'c6', name: 'Padaria Pão Quente', email: 'entregas@paoquente.com', phone: '(11) 3333-0006', address: 'Rua da Consolação, 450 - São Paulo', cnpj: '67.890.123/0001-06', contractType: 'avulso', totalOrders: 22, createdAt: '2024-05-01' },
];

export const mockDeliveries: Delivery[] = [
  { id: 'e1', clientName: 'Loja ABC Materiais', clientId: 'c1', driverId: 'd2', driverName: 'Roberto Santos', origin: 'Rua Augusta, 500', destination: 'Av. Paulista, 1500', status: 'in_transit', date: '2024-12-19', value: 45.00, type: 'contrato' },
  { id: 'e2', clientName: 'Restaurante Sabor & Cia', clientId: 'c2', driverId: 'd4', driverName: 'Felipe Costa', origin: 'Av. Paulista, 1200', destination: 'Rua Oscar Freire, 800', status: 'in_transit', date: '2024-12-19', value: 32.00, type: 'contrato' },
  { id: 'e3', clientName: 'Tech Solutions LTDA', clientId: 'c3', driverId: 'd1', driverName: 'Carlos Silva', origin: 'Rua Faria Lima, 800', destination: 'Av. Berrini, 1200', status: 'pending', date: '2024-12-19', value: 58.00, type: 'avulsa' },
  { id: 'e4', clientName: 'Farmácia Saúde Total', clientId: 'c4', driverId: 'd7', driverName: 'Diego Almeida', origin: 'Rua Oscar Freire, 300', destination: 'Rua Augusta, 1000', status: 'in_transit', date: '2024-12-19', value: 28.00, type: 'contrato' },
  { id: 'e5', clientName: 'E-commerce FastShop', clientId: 'c5', driverId: 'd6', driverName: 'Lucas Pereira', origin: 'Av. Brasil, 2000', destination: 'Rua Haddock Lobo, 500', status: 'delivered', date: '2024-12-18', value: 65.00, type: 'contrato' },
  { id: 'e6', clientName: 'Padaria Pão Quente', clientId: 'c6', driverId: 'd8', driverName: 'Thiago Souza', origin: 'Rua da Consolação, 450', destination: 'Av. Rebouças, 200', status: 'delivered', date: '2024-12-18', value: 22.00, type: 'avulsa' },
  { id: 'e7', clientName: 'Loja ABC Materiais', clientId: 'c1', driverId: 'd3', driverName: 'André Oliveira', origin: 'Rua Augusta, 500', destination: 'Rua Pamplona, 300', status: 'delivered', date: '2024-12-17', value: 40.00, type: 'contrato' },
  { id: 'e8', clientName: 'Restaurante Sabor & Cia', clientId: 'c2', driverId: 'd2', driverName: 'Roberto Santos', origin: 'Av. Paulista, 1200', destination: 'Rua Bela Cintra, 600', status: 'delivered', date: '2024-12-17', value: 35.00, type: 'contrato' },
  { id: 'e9', clientName: 'Tech Solutions LTDA', clientId: 'c3', driverId: 'd4', driverName: 'Felipe Costa', origin: 'Rua Faria Lima, 800', destination: 'Av. Nações Unidas, 1400', status: 'delivered', date: '2024-12-16', value: 72.00, type: 'avulsa' },
  { id: 'e10', clientName: 'Farmácia Saúde Total', clientId: 'c4', driverId: 'd1', driverName: 'Carlos Silva', origin: 'Rua Oscar Freire, 300', destination: 'Rua Peixoto Gomide, 100', status: 'cancelled', date: '2024-12-16', value: 30.00, type: 'contrato' },
  { id: 'e11', clientName: 'E-commerce FastShop', clientId: 'c5', driverId: 'd8', driverName: 'Thiago Souza', origin: 'Av. Brasil, 2000', destination: 'Rua Teodoro Sampaio, 700', status: 'delivered', date: '2024-12-15', value: 55.00, type: 'contrato' },
  { id: 'e12', clientName: 'Loja ABC Materiais', clientId: 'c1', driverId: 'd6', driverName: 'Lucas Pereira', origin: 'Rua Augusta, 500', destination: 'Av. Ipiranga, 900', status: 'delivered', date: '2024-12-15', value: 48.00, type: 'contrato' },
];

export const mockFinancials: FinancialEntry[] = [
  { id: 'f1', type: 'revenue', category: 'Entregas Avulsas', description: 'Entregas avulsas - Semana 1', value: 3200, date: '2024-12-01' },
  { id: 'f2', type: 'revenue', category: 'Contratos Fixos', description: 'Contrato Farmácia Saúde Total', value: 8500, date: '2024-12-01' },
  { id: 'f3', type: 'revenue', category: 'Contratos Fixos', description: 'Contrato E-commerce FastShop', value: 12000, date: '2024-12-01' },
  { id: 'f4', type: 'revenue', category: 'Contratos Fixos', description: 'Contrato Restaurante Sabor & Cia', value: 6800, date: '2024-12-01' },
  { id: 'f5', type: 'revenue', category: 'Entregas Avulsas', description: 'Entregas avulsas - Semana 2', value: 4100, date: '2024-12-08' },
  { id: 'f6', type: 'revenue', category: 'Contratos Fixos', description: 'Contrato Loja ABC Materiais', value: 5500, date: '2024-12-01' },
  { id: 'f7', type: 'expense', category: 'Combustível', description: 'Combustível frota', value: 4200, date: '2024-12-05' },
  { id: 'f8', type: 'expense', category: 'Manutenção', description: 'Manutenção veículos', value: 1800, date: '2024-12-10' },
  { id: 'f9', type: 'expense', category: 'Folha de Pagamento', description: 'Salários motoristas', value: 16000, date: '2024-12-05' },
  { id: 'f10', type: 'expense', category: 'Seguro', description: 'Seguro frota', value: 2500, date: '2024-12-01' },
  { id: 'f11', type: 'expense', category: 'Aluguel', description: 'Aluguel escritório', value: 3000, date: '2024-12-01' },
  { id: 'f12', type: 'expense', category: 'Telefonia', description: 'Planos celulares', value: 800, date: '2024-12-01' },
  { id: 'f13', type: 'revenue', category: 'Entregas Avulsas', description: 'Entregas avulsas - Semana 3', value: 3800, date: '2024-12-15' },
  { id: 'f14', type: 'expense', category: 'Combustível', description: 'Combustível frota - Quinzena 2', value: 3900, date: '2024-12-15' },
];

export const mockPayroll: PayrollEntry[] = [
  { id: 'p1', driverId: 'd1', driverName: 'Carlos Silva', month: '2024-12', baseSalary: 2200, bonus: 450, deductions: 220, total: 2430 },
  { id: 'p2', driverId: 'd2', driverName: 'Roberto Santos', month: '2024-12', baseSalary: 2000, bonus: 680, deductions: 200, total: 2480 },
  { id: 'p3', driverId: 'd3', driverName: 'André Oliveira', month: '2024-12', baseSalary: 2200, bonus: 280, deductions: 220, total: 2260 },
  { id: 'p4', driverId: 'd4', driverName: 'Felipe Costa', month: '2024-12', baseSalary: 2000, bonus: 720, deductions: 200, total: 2520 },
  { id: 'p5', driverId: 'd5', driverName: 'Marcos Lima', month: '2024-12', baseSalary: 2200, bonus: 180, deductions: 220, total: 2160 },
  { id: 'p6', driverId: 'd6', driverName: 'Lucas Pereira', month: '2024-12', baseSalary: 2000, bonus: 520, deductions: 200, total: 2320 },
  { id: 'p7', driverId: 'd7', driverName: 'Diego Almeida', month: '2024-12', baseSalary: 2200, bonus: 400, deductions: 220, total: 2380 },
  { id: 'p8', driverId: 'd8', driverName: 'Thiago Souza', month: '2024-12', baseSalary: 2000, bonus: 620, deductions: 200, total: 2420 },
];

export const weeklyPerformance = [
  { day: 'Seg', entregas: 18 },
  { day: 'Ter', entregas: 24 },
  { day: 'Qua', entregas: 22 },
  { day: 'Qui', entregas: 28 },
  { day: 'Sex', entregas: 32 },
  { day: 'Sáb', entregas: 15 },
  { day: 'Dom', entregas: 5 },
];

export const monthlyRevVsExp = [
  { month: 'Jul', receitas: 32000, despesas: 24000 },
  { month: 'Ago', receitas: 35000, despesas: 25500 },
  { month: 'Set', receitas: 38000, despesas: 26000 },
  { month: 'Out', receitas: 41000, despesas: 27000 },
  { month: 'Nov', receitas: 39000, despesas: 28000 },
  { month: 'Dez', receitas: 43900, despesas: 32200 },
];

export const dailyRequests = [
  { date: '13/12', solicitacoes: 12 },
  { date: '14/12', solicitacoes: 18 },
  { date: '15/12', solicitacoes: 15 },
  { date: '16/12', solicitacoes: 22 },
  { date: '17/12', solicitacoes: 20 },
  { date: '18/12', solicitacoes: 25 },
  { date: '19/12', solicitacoes: 19 },
];
