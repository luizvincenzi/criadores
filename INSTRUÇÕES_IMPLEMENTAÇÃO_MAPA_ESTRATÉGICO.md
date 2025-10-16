# Implementação do Mapa Estratégico para Empresas

## Resumo do que foi feito

✅ **Parte 1: Criação das Tabelas do Banco de Dados**
- Migração SQL criada: `supabase/migrations/032_create_strategic_map_tables.sql`
- Cria tabelas:
  - `strategic_maps`: Armazena mapas estratégicos por trimestre
  - `strategic_map_sections`: Armazena as 8 seções do mapa
- Inclui:
  - Enum `section_type` com valores válidos (metrics_overview, market_analysis, business_diagnosis, swot, product_analysis, icp_personas, kpi_table, objectives)
  - Índices para performance
  - RLS Policies para segurança
  - Triggers para atualizar timestamps

✅ **Parte 2: Criação da API de Strategic Maps**
- Rotas criadas:
  - `/api/strategic-maps` (GET, POST, PUT): Gerenciar mapas estratégicos
  - `/api/strategic-maps/sections` (POST, PUT, DELETE): Gerenciar seções

✅ **Parte 3: Atualização da Página do Dashboard**
- Arquivo: `app/(dashboard)/dashboard/empresa/page.tsx`
- Agora busca o `business_id` do usuário logado via `useAuthStore`
- Exibe o nome correto da empresa no cabeçalho

✅ **Parte 4: Script de População de Dados**
- Script criado: `scripts/populate-boussole-strategic-map.sql`
- Insere dados realistas para a Boussolé (restaurante rooftop em Londrina/PR)
- Popula todas as 8 seções do mapa estratégico

## ⚠️ Problemas Resolvidos

### ❌ Problema 1: "relation ai_analysis does not exist"
**Causa**: O script original tentava usar dados de IA que não existiam na estrutura
**Solução**: Criamos um novo script que insere dados diretamente sem dependências externas

### ❌ Problema 2: "Check constraint violation for section_type"
**Causa**: A constraint `CHECK` na coluna `section_type` aceitava apenas valores específicos
**Solução**: Criamos a ENUM `section_type` com os valores válidos na migração

### ❌ Problema 3: "business_id hardcoded como 'criadores'"
**Causa**: A página sempre buscava dados da empresa 'criadores'
**Solução**: Atualizamos para buscar o `business_id` do usuário autenticado

## 🔧 Como Executar

### Passo 1: Executar a Migração no Supabase
1. Acesse: https://supabase.com/dashboard
2. Vá para SQL Editor
3. Copie o conteúdo de `supabase/migrations/032_create_strategic_map_tables.sql`
4. Execute o script

**Verificar se funcionou:**
```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('strategic_maps', 'strategic_map_sections');

-- Verificar ENUM
SELECT enum_range(NULL::section_type);
```

### Passo 2: Popular Dados do Boussolé
1. Copie o conteúdo de `scripts/populate-boussole-strategic-map.sql`
2. Execute no Supabase SQL Editor

**Verificar se funcionou:**
```sql
-- Ver mapas criados
SELECT * FROM strategic_maps WHERE business_id LIKE '%bouss%';

-- Ver seções
SELECT section_type, section_order FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id LIKE '%bouss%'
)
ORDER BY section_order;
```

### Passo 3: Testar no Aplicativo
1. Login com credenciais da empresa Boussolé (financeiro.brooftop@gmail.com)
2. Acesse: http://localhost:3003/dashboard/empresa
3. Você deve ver o Mapa Estratégico carregado

## 📋 Estrutura de Dados

### Tabela: strategic_maps
```
id: UUID (PK)
organization_id: UUID (FK)
business_id: UUID (FK)
quarter: VARCHAR(10) -- Ex: '2025-Q4'
year: INTEGER
quarter_number: INTEGER (1-4)
status: VARCHAR(50) -- 'draft', 'in_progress', 'completed'
generation_progress: INTEGER (0-100)
input_data: JSONB
created_by: UUID (FK)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Tabela: strategic_map_sections
```
id: UUID (PK)
strategic_map_id: UUID (FK)
section_type: section_type ENUM
section_order: INTEGER
content: JSONB
ai_generated_content: JSONB
is_ai_generated: BOOLEAN
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Enum: section_type
- `metrics_overview`: Visão Geral das Métricas
- `market_analysis`: Análise de Mercado
- `business_diagnosis`: Diagnóstico do Negócio
- `swot`: Análise SWOT
- `product_analysis`: Análise de Produto
- `icp_personas`: Perfis de Clientes Ideais
- `kpi_table`: Indicadores de Performance
- `objectives`: Objetivos e Plano de Ação

## 🔒 Segurança (RLS Policies)

As tabelas têm RLS habilitado com as seguintes políticas:

**strategic_maps:**
- SELECT: Usuários podem ver mapas de sua organização
- INSERT: Apenas managers/admins podem inserir
- UPDATE: Usuários podem atualizar mapas de sua organização

**strategic_map_sections:**
- SELECT: Usuários podem ver seções se têm acesso ao mapa pai
- INSERT: Usuários podem inserir seções se têm acesso ao mapa pai
- UPDATE: Usuários podem atualizar seções se têm acesso ao mapa pai

## 🧪 Testes

### Teste 1: Verificar se tabelas foram criadas
```bash
curl http://localhost:3003/api/strategic-maps?business_id=55310ebd-0e0d-492e-8c34-cd4740000000&quarter=2025-Q4
```

Resposta esperada:
```json
{
  "strategic_map": {
    "id": "...",
    "business_id": "...",
    "quarter": "2025-Q4",
    ...
  },
  "sections": [...]
}
```

### Teste 2: Verificar no Aplicativo
1. Login com a empresa
2. A página `/dashboard/empresa` deve carregar sem erros
3. Deve mostrar os dados do Boussolé

## 📝 Próximos Passos (Opcional)

1. **Adicionar mais empresas**: Execute o script de população para outras empresas
2. **Implementar edição**: Criar componentes para editar as seções
3. **Adicionar histórico**: Guardar versões anteriores dos mapas
4. **Integrar com IA**: Conectar com um serviço de IA para gerar análises automaticamente
5. **Exportar relatórios**: Criar funcionalidade de exportar o mapa em PDF

## 🆘 Troubleshooting

### Erro: "relation strategic_maps does not exist"
- A migração não foi executada
- Solução: Execute a migração 032 no Supabase

### Erro: "invalid input value for enum section_type"
- Você tentou inserir um valor inválido para section_type
- Solução: Use apenas os valores do ENUM listados acima

### Erro: "No map found" na página
- Não há dados para o business_id e trimestre selecionado
- Solução: Execute o script de população do Boussolé

### Página carregando infinitamente
- O usuário não tem `business_id` definido
- Solução: Verificar se o usuário foi criado corretamente no banco
