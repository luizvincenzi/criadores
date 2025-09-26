-- ========================================
-- SETUP SEGURO DO DASHBOARD EMPRESARIAL
-- ========================================
-- Este script verifica se a tabela já existe antes de criar

-- 1. VERIFICAR SE A TABELA JÁ EXISTE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'business_quarterly_snapshots'
    ) THEN
        -- Criar tabela apenas se não existir
        CREATE TABLE business_quarterly_snapshots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
          quarter VARCHAR(10) NOT NULL,
          year INTEGER NOT NULL,
          quarter_number INTEGER NOT NULL CHECK (quarter_number BETWEEN 1 AND 4),
          
          -- PRESENÇA DIGITAL
          digital_presence JSONB DEFAULT '{
            "google": {"rating": 0, "reviews": 0},
            "instagram": 0,
            "facebook": 0,
            "tiktok": 0,
            "tripadvisor": {"rating": 0, "rank": 0}
          }'::jsonb,
          
          -- KPIs PRINCIPAIS
          kpis JSONB DEFAULT '{
            "ocupacao": 0,
            "ticket": 0,
            "margemPorcoes": 0,
            "nps": 0,
            "ruido": 0
          }'::jsonb,
          
          -- 4 PS DO MARKETING
          four_ps_status JSONB DEFAULT '{
            "produto": "gray",
            "preco": "gray", 
            "praca": "gray",
            "promocao": "gray"
          }'::jsonb,
          
          -- FORÇAS DE PORTER
          porter_forces JSONB DEFAULT '{
            "rivalidade": {"score": 5, "status": "yellow"},
            "entrantes": {"score": 5, "status": "yellow"},
            "fornecedores": {"score": 5, "status": "yellow"},
            "clientes": {"score": 5, "status": "yellow"},
            "substitutos": {"score": 5, "status": "yellow"}
          }'::jsonb,
          
          -- SUMÁRIO EXECUTIVO
          executive_summary JSONB DEFAULT '{
            "green": [],
            "yellow": [],
            "red": []
          }'::jsonb,
          
          -- CAMPOS DE CONTROLE
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- CONSTRAINT ÚNICA POR EMPRESA/TRIMESTRE
          UNIQUE(business_id, quarter)
        );
        
        RAISE NOTICE 'Tabela business_quarterly_snapshots criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela business_quarterly_snapshots já existe, pulando criação.';
    END IF;
END $$;

-- 2. CRIAR ÍNDICES SE NÃO EXISTIREM
CREATE INDEX IF NOT EXISTS idx_business_quarterly_snapshots_business_id 
ON business_quarterly_snapshots(business_id);

CREATE INDEX IF NOT EXISTS idx_business_quarterly_snapshots_quarter 
ON business_quarterly_snapshots(quarter);

CREATE INDEX IF NOT EXISTS idx_business_quarterly_snapshots_year_quarter 
ON business_quarterly_snapshots(year, quarter_number);

-- 3. HABILITAR RLS SE NÃO ESTIVER HABILITADO
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'business_quarterly_snapshots' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE business_quarterly_snapshots ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para business_quarterly_snapshots';
    ELSE
        RAISE NOTICE 'RLS já está habilitado para business_quarterly_snapshots';
    END IF;
END $$;

-- 4. CRIAR POLÍTICAS RLS SE NÃO EXISTIREM
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'business_quarterly_snapshots' 
        AND policyname = 'Users can view snapshots of their businesses'
    ) THEN
        CREATE POLICY "Users can view snapshots of their businesses" 
        ON business_quarterly_snapshots FOR SELECT 
        USING (business_id IN (
            SELECT id FROM businesses 
            WHERE organization_id = (
                SELECT organization_id FROM users 
                WHERE id = auth.uid()
            )
        ));
        RAISE NOTICE 'Política SELECT criada para business_quarterly_snapshots';
    END IF;
    
    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'business_quarterly_snapshots' 
        AND policyname = 'Users can insert snapshots for their businesses'
    ) THEN
        CREATE POLICY "Users can insert snapshots for their businesses" 
        ON business_quarterly_snapshots FOR INSERT 
        WITH CHECK (business_id IN (
            SELECT id FROM businesses 
            WHERE organization_id = (
                SELECT organization_id FROM users 
                WHERE id = auth.uid()
            )
        ));
        RAISE NOTICE 'Política INSERT criada para business_quarterly_snapshots';
    END IF;
    
    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'business_quarterly_snapshots' 
        AND policyname = 'Users can update snapshots of their businesses'
    ) THEN
        CREATE POLICY "Users can update snapshots of their businesses" 
        ON business_quarterly_snapshots FOR UPDATE 
        USING (business_id IN (
            SELECT id FROM businesses 
            WHERE organization_id = (
                SELECT organization_id FROM users 
                WHERE id = auth.uid()
            )
        ));
        RAISE NOTICE 'Política UPDATE criada para business_quarterly_snapshots';
    END IF;
END $$;

-- 5. CRIAR TRIGGER PARA UPDATED_AT SE NÃO EXISTIR
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_business_quarterly_snapshots_updated_at'
    ) THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $trigger$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $trigger$ LANGUAGE plpgsql;
        
        CREATE TRIGGER update_business_quarterly_snapshots_updated_at
            BEFORE UPDATE ON business_quarterly_snapshots
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'Trigger de updated_at criado para business_quarterly_snapshots';
    ELSE
        RAISE NOTICE 'Trigger de updated_at já existe para business_quarterly_snapshots';
    END IF;
END $$;

-- 6. VERIFICAÇÃO FINAL
SELECT 
    'Setup do Dashboard Empresarial concluído com sucesso!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'business_quarterly_snapshots') as table_exists,
    (SELECT COUNT(*) FROM businesses) as total_businesses,
    NOW() as completed_at;
