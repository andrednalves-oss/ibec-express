-- =============================================
-- IBEC EXPRESS - PASSO 1: LIMPAR TUDO
-- Execute isto PRIMEIRO
-- =============================================

-- Remover policies (uma por uma para não dar erro)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Remover triggers
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', r.trigger_name, r.event_object_table);
    END LOOP;
END $$;

-- Remover indices customizados
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
    ) LOOP
        EXECUTE format('DROP INDEX IF EXISTS public.%I', r.indexname);
    END LOOP;
END $$;

-- Remover tabelas
DROP TABLE IF EXISTS public.delivery_stops CASCADE;
DROP TABLE IF EXISTS public.payroll CASCADE;
DROP TABLE IF EXISTS public.financial_records CASCADE;
DROP TABLE IF EXISTS public.deliveries CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Remover tipos enum
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS delivery_priority CASCADE;
DROP TYPE IF EXISTS vehicle_type CASCADE;
DROP TYPE IF EXISTS driver_status CASCADE;
DROP TYPE IF EXISTS financial_type CASCADE;
DROP TYPE IF EXISTS financial_category CASCADE;

-- Remover funcao
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

SELECT 'LIMPEZA CONCLUIDA COM SUCESSO!' AS resultado;
