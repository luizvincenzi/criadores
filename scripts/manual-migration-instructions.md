# Manual Migration Instructions

## Problema Identificado
Erro: `cannot cast type campaign_status to jornada_stage` no drag & drop da aba jornada.

## Causa
Dois enums duplicados com os mesmos valores:
- `campaign_status`: 'Reunião de briefing' | 'Agendamentos' | 'Entrega final' | 'Finalizado'
- `jornada_stage`: 'Reunião de briefing' | 'Agendamentos' | 'Entrega final' | 'Finalizado'

## Solução
Unificar os enums usando apenas `campaign_status`.

## Instruções para Aplicar no Supabase Dashboard

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Acesse o projeto: ecbhcalmulaiszslwhqz
- Vá para SQL Editor

### 2. Execute os comandos SQL na ordem:

#### Passo 1: Recriar função create_automatic_jornada_tasks
```sql
DROP FUNCTION IF EXISTS create_automatic_jornada_tasks(character varying,character varying,jornada_stage,uuid,uuid,uuid,uuid);
CREATE OR REPLACE FUNCTION create_automatic_jornada_tasks(
  p_business_name VARCHAR(255),
  p_campaign_month VARCHAR(50),
  p_journey_stage campaign_status,
  p_business_id UUID DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
  p_created_by UUID DEFAULT '00000000-0000-0000-0000-000000000001'
) RETURNS INTEGER AS $$
DECLARE
  tasks_created INTEGER := 0;
  task_templates RECORD;
BEGIN
  -- Verificar se já existem tarefas automáticas para esta jornada/estágio
  IF EXISTS (
    SELECT 1 FROM jornada_tasks 
    WHERE organization_id = p_organization_id
      AND business_name = p_business_name
      AND campaign_month = p_campaign_month
      AND journey_stage = p_journey_stage
      AND is_auto_generated = true
  ) THEN
    RETURN 0; -- Já existem tarefas automáticas
  END IF;

  -- Criar tarefas baseadas no estágio
  IF p_journey_stage = 'Reunião de briefing' THEN
    -- Tarefas para estágio de briefing
    INSERT INTO jornada_tasks (
      organization_id, business_name, campaign_month, journey_stage,
      title, description, task_type, priority, is_auto_generated,
      blocks_stage_progression, created_by, business_id, campaign_id
    ) VALUES 
    (p_organization_id, p_business_name, p_campaign_month, p_journey_stage,
     'Preparar briefing da campanha', 'Reunir informações e preparar briefing detalhado',
     'briefing_preparation', 'high', true, true, p_created_by, p_business_id, p_campaign_id),
    (p_organization_id, p_business_name, p_campaign_month, p_journey_stage,
     'Agendar reunião de briefing', 'Coordenar agenda com cliente para reunião',
     'briefing_meeting', 'high', true, false, p_created_by, p_business_id, p_campaign_id);
    tasks_created := 2;
    
  ELSIF p_journey_stage = 'Agendamentos' THEN
    -- Tarefas para estágio de agendamentos
    INSERT INTO jornada_tasks (
      organization_id, business_name, campaign_month, journey_stage,
      title, description, task_type, priority, is_auto_generated,
      blocks_stage_progression, created_by, business_id, campaign_id
    ) VALUES 
    (p_organization_id, p_business_name, p_campaign_month, p_journey_stage,
     'Selecionar criadores para campanha', 'Escolher criadores adequados ao perfil da campanha',
     'creator_selection', 'high', true, true, p_created_by, p_business_id, p_campaign_id),
    (p_organization_id, p_business_name, p_campaign_month, p_journey_stage,
     'Entrar em contato com criadores', 'Fazer contato inicial e negociar termos',
     'creator_contact', 'high', true, true, p_created_by, p_business_id, p_campaign_id),
    (p_organization_id, p_business_name, p_campaign_month, p_journey_stage,
     'Coordenar agendamentos', 'Organizar cronograma de visitas e gravações',
     'scheduling_coordination', 'medium', true, false, p_created_by, p_business_id, p_campaign_id);
    tasks_created := 3;
    
  ELSIF p_journey_stage = 'Entrega final' THEN
    -- Tarefas para estágio de entrega
    INSERT INTO jornada_tasks (
      organization_id, business_name, campaign_month, journey_stage,
      title, description, task_type, priority, is_auto_generated,
      blocks_stage_progression, created_by, business_id, campaign_id
    ) VALUES 
    (p_organization_id, p_business_name, p_campaign_month, p_journey_stage,
     'Revisar entregas dos criadores', 'Verificar qualidade e conformidade do conteúdo',
     'delivery_review', 'high', true, true, p_created_by, p_business_id, p_campaign_id),
    (p_organization_id, p_business_name, p_campaign_month, p_journey_stage,
     'Aprovar conteúdo final', 'Dar aprovação final para publicação',
     'final_approval', 'high', true, true, p_created_by, p_business_id, p_campaign_id);
    tasks_created := 2;
    
  ELSIF p_journey_stage = 'Finalizado' THEN
    -- Tarefas para estágio finalizado
    INSERT INTO jornada_tasks (
      organization_id, business_name, campaign_month, journey_stage,
      title, description, task_type, priority, is_auto_generated,
      blocks_stage_progression, created_by, business_id, campaign_id
    ) VALUES 
    (p_organization_id, p_business_name, p_campaign_month, p_journey_stage,
     'Fechar campanha', 'Finalizar campanha e documentar resultados',
     'campaign_closure', 'medium', true, false, p_created_by, p_business_id, p_campaign_id),
    (p_organization_id, p_business_name, p_campaign_month, p_journey_stage,
     'Follow-up com cliente', 'Acompanhar satisfação e resultados',
     'follow_up', 'low', true, false, p_created_by, p_business_id, p_campaign_id);
    tasks_created := 2;
  END IF;

  RETURN tasks_created;
END;
$$ LANGUAGE plpgsql;
```

#### Passo 2: Recriar função can_progress_to_next_stage
```sql
DROP FUNCTION IF EXISTS can_progress_to_next_stage(character varying,character varying,jornada_stage);
CREATE OR REPLACE FUNCTION can_progress_to_next_stage(
  p_business_name VARCHAR(255),
  p_campaign_month VARCHAR(50),
  p_current_stage campaign_status
) RETURNS BOOLEAN AS $$
DECLARE
  blocking_tasks_count INTEGER;
BEGIN
  -- Verificar se existem tarefas bloqueantes não concluídas
  SELECT COUNT(*) INTO blocking_tasks_count
  FROM jornada_tasks
  WHERE business_name = p_business_name
    AND campaign_month = p_campaign_month
    AND journey_stage = p_current_stage
    AND blocks_stage_progression = true
    AND status != 'done';
  
  -- Se não há tarefas bloqueantes, pode avançar
  RETURN blocking_tasks_count = 0;
END;
$$ LANGUAGE plpgsql;
```

#### Passo 3: Recriar função get_jornada_tasks_by_stage
```sql
DROP FUNCTION IF EXISTS get_jornada_tasks_by_stage(uuid,character varying,character varying,jornada_stage);
CREATE OR REPLACE FUNCTION get_jornada_tasks_by_stage(
  p_organization_id UUID,
  p_business_name VARCHAR(255),
  p_campaign_month VARCHAR(50),
  p_journey_stage campaign_status
) RETURNS TABLE(
  id UUID,
  title VARCHAR(255),
  description TEXT,
  status task_status,
  priority task_priority
) AS $$
BEGIN
  RETURN QUERY
  SELECT jt.id, jt.title, jt.description, jt.status, jt.priority
  FROM jornada_tasks jt
  WHERE jt.organization_id = p_organization_id
    AND jt.business_name = p_business_name
    AND jt.campaign_month = p_campaign_month
    AND jt.journey_stage = p_journey_stage;
END;
$$ LANGUAGE plpgsql;
```

#### Passo 4: Atualizar tabela jornada_tasks
```sql
ALTER TABLE jornada_tasks 
ALTER COLUMN journey_stage TYPE campaign_status 
USING journey_stage::text::campaign_status;

ALTER TABLE jornada_tasks 
ALTER COLUMN auto_trigger_stage TYPE campaign_status 
USING auto_trigger_stage::text::campaign_status;
```

#### Passo 5: Remover enum jornada_stage
```sql
DROP TYPE IF EXISTS jornada_stage;
```

#### Passo 6: Adicionar comentário
```sql
COMMENT ON TYPE campaign_status IS 'Status unificado para campanhas e jornadas: Reunião de briefing, Agendamentos, Entrega final, Finalizado';
```

### 3. Verificar se funcionou
Após executar todos os comandos, teste o drag & drop na aba jornada. O erro deve ter sido resolvido.

### 4. Próximos passos
1. Testar funcionalidade de drag & drop
2. Verificar se as tarefas automáticas ainda funcionam
3. Confirmar que não há outros erros de tipo

## Arquivos Atualizados
- ✅ `lib/database.types.ts` - Tipos TypeScript atualizados
- ✅ `lib/supabase.ts` - Remoção de JornadaStage
- ✅ `docs/jornada-tasks-infrastructure.md` - Documentação atualizada
- ✅ `supabase/migrations/027_unify_status_enums.sql` - Migration criada
