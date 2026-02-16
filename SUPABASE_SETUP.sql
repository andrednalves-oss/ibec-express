-- ============================================
-- IBEC EXPRESS - Script de Criação do Banco
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operacional', 'cliente', 'colaborador')),
  password_hash TEXT NOT NULL DEFAULT '123456',
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE MOTORISTAS
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  plate TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('motorista', 'motoboy')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  deliveries_count INTEGER DEFAULT 0,
  rating NUMERIC(3,1) DEFAULT 5.0,
  photo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('avulso', 'fixo')),
  total_orders INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELA DE ENTREGAS
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  client_name TEXT NOT NULL,
  driver_id UUID REFERENCES drivers(id),
  driver_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  delivery_date DATE DEFAULT CURRENT_DATE,
  value NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('avulsa', 'contrato')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABELA FINANCEIRA
CREATE TABLE IF NOT EXISTS financial_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('revenue', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABELA DE FOLHA DE PAGAMENTO
CREATE TABLE IF NOT EXISTS payroll (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id),
  driver_name TEXT NOT NULL,
  month TEXT NOT NULL,
  base_salary NUMERIC(10,2) NOT NULL,
  bonus NUMERIC(10,2) DEFAULT 0,
  deductions NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (para começar - ajuste conforme necessidade)
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for drivers" ON drivers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for deliveries" ON deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for financial_entries" ON financial_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for payroll" ON payroll FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Usuários padrão
INSERT INTO users (name, email, role, password_hash) VALUES
  ('Admin IBEC', 'admin@ibecexpress.com', 'admin', '123456'),
  ('João Operacional', 'operacional@ibecexpress.com', 'operacional', '123456'),
  ('Cliente ABC', 'cliente@abc.com', 'cliente', '123456'),
  ('Carlos Colaborador', 'carlos@ibecexpress.com', 'colaborador', '123456');

-- Motoristas
INSERT INTO drivers (name, phone, vehicle, plate, type, status, deliveries_count, rating) VALUES
  ('Carlos Silva', '(11) 99999-0001', 'Fiorino', 'ABC-1234', 'motorista', 'available', 145, 4.8),
  ('Roberto Santos', '(11) 99999-0002', 'Honda CG 160', 'DEF-5678', 'motoboy', 'busy', 230, 4.9),
  ('André Oliveira', '(11) 99999-0003', 'Saveiro', 'GHI-9012', 'motorista', 'available', 89, 4.5),
  ('Felipe Costa', '(11) 99999-0004', 'Yamaha Factor', 'JKL-3456', 'motoboy', 'busy', 312, 4.7),
  ('Marcos Lima', '(11) 99999-0005', 'Kangoo', 'MNO-7890', 'motorista', 'offline', 67, 4.3),
  ('Lucas Pereira', '(11) 99999-0006', 'Honda Bros', 'PQR-1234', 'motoboy', 'available', 198, 4.6),
  ('Diego Almeida', '(11) 99999-0007', 'Strada', 'STU-5678', 'motorista', 'busy', 156, 4.4),
  ('Thiago Souza', '(11) 99999-0008', 'Honda XRE', 'VWX-9012', 'motoboy', 'available', 276, 4.8);

-- Clientes
INSERT INTO clients (name, email, phone, address, cnpj, contract_type, total_orders) VALUES
  ('Loja ABC Materiais', 'contato@abc.com', '(11) 3333-0001', 'Rua Augusta, 500 - São Paulo', '12.345.678/0001-01', 'fixo', 89),
  ('Restaurante Sabor & Cia', 'pedidos@sabor.com', '(11) 3333-0002', 'Av. Paulista, 1200 - São Paulo', '23.456.789/0001-02', 'fixo', 156),
  ('Tech Solutions LTDA', 'logistica@tech.com', '(11) 3333-0003', 'Rua Faria Lima, 800 - São Paulo', '34.567.890/0001-03', 'avulso', 34),
  ('Farmácia Saúde Total', 'entregas@saude.com', '(11) 3333-0004', 'Rua Oscar Freire, 300 - São Paulo', '45.678.901/0001-04', 'fixo', 210),
  ('E-commerce FastShop', 'logistica@fastshop.com', '(11) 3333-0005', 'Av. Brasil, 2000 - São Paulo', '56.789.012/0001-05', 'fixo', 178),
  ('Padaria Pão Quente', 'entregas@paoquente.com', '(11) 3333-0006', 'Rua da Consolação, 450 - São Paulo', '67.890.123/0001-06', 'avulso', 22);

-- Lançamentos financeiros
INSERT INTO financial_entries (type, category, description, value, entry_date) VALUES
  ('revenue', 'Entregas Avulsas', 'Entregas avulsas - Semana 1', 3200, '2024-12-01'),
  ('revenue', 'Contratos Fixos', 'Contrato Farmácia Saúde Total', 8500, '2024-12-01'),
  ('revenue', 'Contratos Fixos', 'Contrato E-commerce FastShop', 12000, '2024-12-01'),
  ('revenue', 'Contratos Fixos', 'Contrato Restaurante Sabor & Cia', 6800, '2024-12-01'),
  ('revenue', 'Entregas Avulsas', 'Entregas avulsas - Semana 2', 4100, '2024-12-08'),
  ('revenue', 'Contratos Fixos', 'Contrato Loja ABC Materiais', 5500, '2024-12-01'),
  ('expense', 'Combustível', 'Combustível frota', 4200, '2024-12-05'),
  ('expense', 'Manutenção', 'Manutenção veículos', 1800, '2024-12-10'),
  ('expense', 'Folha de Pagamento', 'Salários motoristas', 16000, '2024-12-05'),
  ('expense', 'Seguro', 'Seguro frota', 2500, '2024-12-01'),
  ('expense', 'Aluguel', 'Aluguel escritório', 3000, '2024-12-01'),
  ('expense', 'Telefonia', 'Planos celulares', 800, '2024-12-01'),
  ('revenue', 'Entregas Avulsas', 'Entregas avulsas - Semana 3', 3800, '2024-12-15'),
  ('expense', 'Combustível', 'Combustível frota - Quinzena 2', 3900, '2024-12-15');

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_client ON deliveries(client_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_type ON drivers(type);
CREATE INDEX IF NOT EXISTS idx_clients_contract ON clients(contract_type);
CREATE INDEX IF NOT EXISTS idx_financial_type ON financial_entries(type);
CREATE INDEX IF NOT EXISTS idx_financial_date ON financial_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_payroll_month ON payroll(month);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
