-- =============================================
-- IBEC EXPRESS - PASSO 2: CRIAR TUDO
-- Execute DEPOIS do Passo 1
-- =============================================

-- Criar tipos ENUM
CREATE TYPE user_role AS ENUM ('admin', 'operacional', 'cliente', 'colaborador');
CREATE TYPE delivery_status AS ENUM ('pendente', 'coletado', 'em_transito', 'entregue', 'cancelado');
CREATE TYPE delivery_priority AS ENUM ('normal', 'urgente', 'agendado');
CREATE TYPE vehicle_type AS ENUM ('moto', 'carro', 'van', 'caminhao');
CREATE TYPE driver_status AS ENUM ('disponivel', 'em_entrega', 'indisponivel');
CREATE TYPE financial_type AS ENUM ('receita', 'despesa');
CREATE TYPE financial_category AS ENUM (
    'entrega_avulsa', 
    'contrato_fixo', 
    'combustivel', 
    'manutencao', 
    'salario', 
    'aluguel', 
    'imposto', 
    'outros'
);

-- TABELA: USERS
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'colaborador' NOT NULL,
    phone VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: DRIVERS
CREATE TABLE public.drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    cpf VARCHAR(14),
    cnh VARCHAR(20),
    vehicle_type vehicle_type DEFAULT 'moto' NOT NULL,
    vehicle_plate VARCHAR(10),
    vehicle_model VARCHAR(100),
    status driver_status DEFAULT 'disponivel' NOT NULL,
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_deliveries INTEGER DEFAULT 0,
    base_salary DECIMAL(10,2) DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 10,
    pix_key VARCHAR(255),
    address TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: CLIENTS
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    document VARCHAR(20),
    company VARCHAR(255),
    address TEXT,
    contract_type VARCHAR(50) DEFAULT 'avulso',
    contract_value DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: DELIVERIES
CREATE TABLE public.deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    driver_name VARCHAR(255),
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status delivery_status DEFAULT 'pendente' NOT NULL,
    priority delivery_priority DEFAULT 'normal' NOT NULL,
    delivery_type VARCHAR(50) DEFAULT 'avulsa',
    package_description TEXT,
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(20),
    distance_km DECIMAL(10,2) DEFAULT 0,
    estimated_time VARCHAR(50),
    value DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    collected_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: DELIVERY_STOPS
CREATE TABLE public.delivery_stops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL,
    address TEXT NOT NULL,
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(20),
    package_description TEXT,
    status delivery_status DEFAULT 'pendente',
    delivered_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: FINANCIAL_RECORDS
CREATE TABLE public.financial_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type financial_type NOT NULL,
    category financial_category NOT NULL,
    description VARCHAR(255) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    delivery_id UUID REFERENCES public.deliveries(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    payment_method VARCHAR(50),
    paid BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: PAYROLL
CREATE TABLE public.payroll (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    driver_name VARCHAR(255) NOT NULL,
    month VARCHAR(7) NOT NULL,
    base_salary DECIMAL(10,2) DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    commission_value DECIMAL(10,2) DEFAULT 0,
    bonuses DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    total_payment DECIMAL(10,2) DEFAULT 0,
    paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- FUNCTION: Atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_updated_at BEFORE UPDATE ON public.financial_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON public.payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Acesso total users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total drivers" ON public.drivers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total deliveries" ON public.deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total delivery_stops" ON public.delivery_stops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total financial_records" ON public.financial_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total payroll" ON public.payroll FOR ALL USING (true) WITH CHECK (true);

-- INDICES
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_client ON public.deliveries(client_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON public.deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON public.deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_stops_delivery ON public.delivery_stops(delivery_id);
CREATE INDEX IF NOT EXISTS idx_financial_type ON public.financial_records(type);
CREATE INDEX IF NOT EXISTS idx_financial_date ON public.financial_records(date);
CREATE INDEX IF NOT EXISTS idx_financial_category ON public.financial_records(category);
CREATE INDEX IF NOT EXISTS idx_payroll_driver ON public.payroll(driver_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month ON public.payroll(month);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);

-- ADMIN PADRAO
INSERT INTO public.users (name, email, password, role, phone)
VALUES ('Administrador', 'admin@ibecexpress.com.br', 'admin123', 'admin', '(11) 99999-9999');

SELECT 'BANCO DE DADOS CRIADO COM SUCESSO!' AS resultado;
