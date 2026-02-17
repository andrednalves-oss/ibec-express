-- =============================================
-- IBEC EXPRESS - SQL UNICO PARA SUPABASE
-- Execute este arquivo inteiro no SQL Editor
-- =============================================

-- 1. REMOVER TABELAS EXISTENTES
DROP TABLE IF EXISTS delivery_stops CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS financial CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. REMOVER TIPOS EXISTENTES
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS delivery_priority CASCADE;
DROP TYPE IF EXISTS vehicle_category CASCADE;
DROP TYPE IF EXISTS financial_type CASCADE;
DROP TYPE IF EXISTS financial_category CASCADE;

-- 3. CRIAR TIPOS
CREATE TYPE user_role AS ENUM ('admin', 'operacional', 'cliente', 'colaborador');
CREATE TYPE delivery_status AS ENUM ('pending', 'in_progress', 'delivered', 'cancelled');
CREATE TYPE delivery_priority AS ENUM ('normal', 'urgent', 'scheduled');
CREATE TYPE vehicle_category AS ENUM ('moto', 'carro_passeio', 'utilitario', 'caminhao', 'presskit');
CREATE TYPE financial_type AS ENUM ('revenue', 'expense');
CREATE TYPE financial_category AS ENUM ('entrega_avulsa', 'contrato_fixo', 'combustivel', 'manutencao', 'salario', 'outros');

-- 4. CRIAR TABELA USERS
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'colaborador',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR TABELA DRIVERS
CREATE TABLE drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    vehicle_plate VARCHAR(10),
    vehicle_category vehicle_category DEFAULT 'moto',
    cnh VARCHAR(20),
    status VARCHAR(20) DEFAULT 'available',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR TABELA CLIENTS
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    document VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    payment_day INTEGER DEFAULT 10,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CRIAR TABELA DELIVERIES
CREATE TABLE deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status delivery_status DEFAULT 'pending',
    priority delivery_priority DEFAULT 'normal',
    delivery_type VARCHAR(50) DEFAULT 'avulsa',
    value DECIMAL(10,2) DEFAULT 0,
    distance_km DECIMAL(10,2),
    estimated_time VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CRIAR TABELA DELIVERY_STOPS
CREATE TABLE delivery_stops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(20),
    description TEXT,
    sequence INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CRIAR TABELA FINANCIAL
CREATE TABLE financial (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type financial_type NOT NULL,
    category financial_category NOT NULL,
    description VARCHAR(255) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. DESABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial ENABLE ROW LEVEL SECURITY;

-- 11. CRIAR POLITICAS DE ACESSO PUBLICO
CREATE POLICY "Acesso total users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total drivers" ON drivers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total deliveries" ON deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total delivery_stops" ON delivery_stops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total financial" ON financial FOR ALL USING (true) WITH CHECK (true);

-- 12. CRIAR INDICES
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_client ON deliveries(client_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_financial_type ON financial(type);
CREATE INDEX IF NOT EXISTS idx_financial_date ON financial(date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 13. CRIAR USUARIO ADMIN
INSERT INTO users (name, email, password_hash, role, active)
VALUES ('Administrador', 'admin@ibecexpress.com.br', 'admin123', 'admin', true);

-- PRONTO! Banco de dados configurado com sucesso!