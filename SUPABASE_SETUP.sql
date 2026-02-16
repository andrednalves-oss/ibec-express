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
-- DADOS INICIAIS (APENAS ADMIN)
-- ============================================

-- Usuário administrador padrão
INSERT INTO users (name, email, role, password_hash) VALUES
  ('Admin IBEC', 'admin@ibecexpress.com.br', 'admin', 'admin123');

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
