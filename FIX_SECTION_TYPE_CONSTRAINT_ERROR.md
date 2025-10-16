# Solução: Erro "violates check constraint strategic_map_sections_section_type_check"

## Problema

Ao executar o script de população do Boussolé, você recebe o erro:

```
ERROR: 23514: new row for relation "strategic_map_sections" violates check constraint "strategic_map_sections_section_type_check"
```

## Causa

Este erro ocorre porque:

1. **Existe uma constraint CHECK antiga** criada diretamente no Supabase que valida apenas alguns valores específicos
2. **A ENUM foi criada na migração 032**, mas o Supabase ainda tem a constraint CHECK antiga
3. **Conflito de tipos**: A coluna `section_type` está tentando aceitar valores ENUM, mas a constraint CHECK rejeita

## Solução (3 opções)

### Opção 1: Usar o Script de Limpeza (RECOMENDADO)

Execute este script que limpa os dados antigos e reinsere tudo:

```bash
# Copie todo o conteúdo de:
scripts/clean-and-repopulate-strategic-map.sql

# Execute no Supabase SQL Editor
```

**Vantagens:**
- Remove dados problemáticos do Boussolé
- Reinsere tudo de uma vez
- Funciona mesmo com a constraint antiga

**Desvantagens:**
- Perde dados anteriores (mas como é a primeira vez, não há problema)

---

### Opção 2: Remover a Constraint CHECK Manualmente

Execute no Supabase SQL Editor:

```sql
-- 1. Remover a constraint CHECK problemática
ALTER TABLE strategic_map_sections
DROP CONSTRAINT IF EXISTS strategic_map_sections_section_type_check;

-- 2. Verificar que foi removida
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'strategic_map_sections';

-- 3. Agora execute o script de população normalmente
-- (Copie scripts/populate-boussole-strategic-map.sql)
```

**Vantagens:**
- Resolve o problema de raiz
- A constraint deixa de existir

**Desvantagens:**
- Requer conhecimento de SQL
- Se houver dados antigos conflitantes, precisa limpá-los antes

---

### Opção 3: Converter a Coluna para ENUM Explicitamente

Execute no Supabase SQL Editor:

```sql
-- 1. Fazer backup dos dados
CREATE TEMP TABLE backup_sections AS SELECT * FROM strategic_map_sections;

-- 2. Remover dados da tabela (ou deletar apenas os antigos)
DELETE FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%boussolé%' LIMIT 1)
);

-- 3. Remover a constraint
ALTER TABLE strategic_map_sections
DROP CONSTRAINT IF EXISTS strategic_map_sections_section_type_check;

-- 4. Reconverter a coluna para ENUM
ALTER TABLE strategic_map_sections
ALTER COLUMN section_type TYPE section_type USING section_type::text::section_type;

-- 5. Agora execute o script de população
-- (Copie scripts/populate-boussole-strategic-map.sql)
```

---

## Qual Opção Escolher?

| Situação | Recomendação |
|----------|-------------|
| Primeira vez executando | **Opção 1** (Script de limpeza) |
| Já tentou antes e tem dados ruins | **Opção 1** (Script de limpeza) |
| Tem dados antigos que quer manter | **Opção 2** (Remover constraint) |
| Quer máxima segurança | **Opção 3** (Converter coluna) |

---

## Passo a Passo com a Opção 1 (Mais Rápida)

### Passo 1: Limpeza
```sql
-- Copie todo o conteúdo de scripts/clean-and-repopulate-strategic-map.sql
-- Cole no Supabase SQL Editor
-- Clique em "Run"
```

### Passo 2: Verificar
```sql
-- Verificar se funcionou
SELECT COUNT(*) FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%boussolé%' LIMIT 1)
);

-- Deve retornar: 8 (8 seções do Boussolé)
```

### Passo 3: Testar
- Login: financeiro.brooftop@gmail.com
- Acesse: http://localhost:3003/dashboard/empresa
- Você deve ver o Mapa Estratégico carregado!

---

## Verificar o Status

### Ver se a constraint ainda existe
```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'strategic_map_sections'
ORDER BY constraint_name;
```

### Ver valores válidos do ENUM
```sql
SELECT enum_range(NULL::section_type);
```

### Ver dados do Boussolé
```sql
SELECT section_type, COUNT(*) as count
FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%boussolé%' LIMIT 1)
)
GROUP BY section_type
ORDER BY section_type;

-- Deve retornar 8 linhas, uma para cada seção
```

---

## Se Nenhuma Solução Funcionar

### Debug: Verificar a definição da tabela

```sql
-- Ver definição completa da tabela
\d strategic_map_sections

-- Ver todas as constraints
SELECT constraint_name, constraint_definition
FROM information_schema.check_constraints
WHERE table_name = 'strategic_map_sections';

-- Ver o tipo de dados da coluna
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'strategic_map_sections'
AND column_name = 'section_type';
```

### Último recurso: Recriar a tabela

Se nada funcionar, recrie a tabela do zero:

```sql
-- 1. Fazer backup
CREATE TABLE strategic_map_sections_backup AS
SELECT * FROM strategic_map_sections;

-- 2. Remover constraints de FK que dependem disso
ALTER TABLE strategic_map_sections DROP CONSTRAINT IF EXISTS strategic_map_sections_strategic_map_id_fkey;

-- 3. Dropar a tabela
DROP TABLE IF EXISTS strategic_map_sections CASCADE;

-- 4. Recriar (use a SQL da migração 032_create_strategic_map_tables.sql)
CREATE TABLE strategic_map_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_map_id UUID NOT NULL REFERENCES strategic_maps(id) ON DELETE CASCADE,
  section_type section_type NOT NULL,
  section_order INTEGER NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  ai_generated_content JSONB DEFAULT '{}'::jsonb,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(strategic_map_id, section_type)
);

-- 5. Execute o script de população
-- (Copie scripts/clean-and-repopulate-strategic-map.sql)
```

---

## Próximas Vezes

Para evitar este erro novamente:

1. **Sempre execute a migração 032** antes de popular dados
2. **Use o script `clean-and-repopulate-strategic-map.sql`** se houver erro
3. **Valide com o script `validate-strategic-map-setup.sql`** após popular

---

**Status**: ✅ Solução disponível
**Tempo estimado**: 2-5 minutos
