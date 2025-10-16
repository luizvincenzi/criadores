# 🏢 Adicionar Mapa Estratégico para Outras Empresas

Este guia explica como criar mapas estratégicos para outras empresas além da Boussolé.

## Pré-Requisitos

- ✅ Migração 032 já foi executada (tabelas criadas)
- ✅ Empresa está cadastrada no banco de dados (tabela `businesses`)
- ✅ Usuário responsável está criado (tabela `users`)
- ✅ Dados reais ou realistas sobre a empresa disponível

## Opção 1: Usar o Template (RECOMENDADO)

### Passo 1: Copiar o Template

Copie o arquivo:
```
scripts/template-populate-strategic-map.sql
```

### Passo 2: Substituir Variáveis

Substitua TODAS as variáveis entre `[COLCHETES]` pelos dados reais da empresa:

#### Informações Básicas

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `[EMPRESA_NOME]` | "Restaurante XYZ" | Nome exato da empresa no banco |
| `[EMPRESA_EMAIL]` | "gerente@empresa.com" | Email do usuário responsável |
| `[TRIMESTRE]` | "2025-Q4" | Formato YYYY-QN |
| `[ANO]` | 2025 | Ano (número) |
| `[NUMERO_TRIMESTRE]` | 4 | 1, 2, 3 ou 4 |

#### Informações da Empresa

| Variável | Exemplo |
|----------|---------|
| `[CATEGORIA_EMPRESA]` | "Alimentação - Restaurante" |
| `[PUBLICO_ALVO]` | "Jovens profissionais 25-40 anos" |
| `[CIDADE]` | "São Paulo" |
| `[ESTADO]` | "SP" |
| `[COMPETIDOR_1]` | "Restaurante A" |
| `[COMPETIDOR_2]` | "Restaurante B" |

#### Redes Sociais

| Variável | Exemplo |
|----------|---------|
| `[URL_INSTAGRAM]` | "https://instagram.com/empresa" |
| `[FOLLOWERS_INSTA]` | 5000 |
| `[ENGAGEMENT_INSTA]` | 3.5 |
| `[URL_FACEBOOK]` | "https://facebook.com/empresa" |
| `[FOLLOWERS_FB]` | 2000 |
| `[ENGAGEMENT_FB]` | 2.1 |
| `[URL_TIKTOK]` | "https://tiktok.com/@empresa" |
| `[FOLLOWERS_TIKTOK]` | 1500 |
| `[ENGAGEMENT_TIKTOK]` | 4.2 |
| `[RATING_GOOGLE]` | 4.5 |
| `[TOTAL_REVIEWS]` | 250 |

#### Análises e Insights

| Variável | Exemplo |
|----------|---------|
| `[OPORTUNIDADE_PRINCIPAL]` | "Presença forte em Instagram com alto engajamento" |
| `[VANTAGEM_COMPETITIVA]` | "Único restaurante premium na região com menu fusion" |
| `[ANALISE_METRICAS]` | "Presença digital sólida com destaque para Instagram..." |

#### Performance (KPIs)

| Variável | Exemplo |
|----------|---------|
| `[OCUPACAO]` | 75 (percentual) |
| `[TICKET]` | 120 (em reais) |
| `[MARGEM]` | 28 (percentual) |
| `[NPS]` | 82 (score) |

#### Seção KPIs (Completa)

```json
"kpis": [
  {
    "name": "Ocupação Média",
    "current": 75,
    "target": 80,
    "unit": "%",
    "trend": "up",
    "frequency": "monthly"
  },
  ...
]
```

### Passo 3: Executar no Supabase

1. Abra Supabase Dashboard
2. Vá para SQL Editor
3. Cole o script (com variáveis já substituídas)
4. Clique em "Run"

### Passo 4: Verificar

```sql
SELECT COUNT(*) as total_sections
FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (
    SELECT id FROM businesses
    WHERE name ILIKE '%[EMPRESA_NOME]%' LIMIT 1
  )
);

-- Deve retornar: 8
```

## Opção 2: Usar Scripts Específicos

Se preferir ter controle total, crie 8 INSERTs separados (um para cada seção):

```sql
-- Exemplo para Seção 1 (Métricas)
INSERT INTO strategic_map_sections (
  strategic_map_id,
  section_type,
  section_order,
  content,
  ai_generated_content,
  is_ai_generated
)
SELECT
  sm.id,
  'metrics_overview'::section_type,
  1,
  '{"instagram": {...}, "facebook": {...}}'::jsonb,
  '{"analysis": "..."}'::jsonb,
  true
FROM strategic_maps sm
WHERE sm.business_id = (
  SELECT id FROM businesses WHERE name ILIKE '%EMPRESA_NOME%' LIMIT 1
)
LIMIT 1;
```

## Estrutura de Dados por Seção

### 1. Métricas Overview

```json
{
  "instagram": {
    "followers": 5000,
    "growth_rate": 3.2
  },
  "facebook": { "followers": 2000, "growth_rate": 1.5 },
  "tiktok": { "followers": 1500, "growth_rate": 4.5 },
  "google_reviews": { "rating": 4.5, "total": 250 },
  "main_opportunity": "...",
  "competitive_advantage": "..."
}
```

### 2. Market Analysis

```json
{
  "market_size": "R$ 1 bilhão anual",
  "growth_rate": "8% ao ano",
  "competition_level": "Média-Alta",
  "main_trends": ["...", "..."],
  "target_segments": ["...", "..."],
  "market_share": "2.5%"
}
```

### 3. Business Diagnosis

```json
{
  "current_situation": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "performance_indicators": {
    "ocupacao_media": 75,
    "ticket_medio": 120,
    "margem_lucro": 28,
    "nps": 82
  }
}
```

### 4. SWOT

```json
{
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "..."],
  "opportunities": ["...", "..."],
  "threats": ["...", "..."]
}
```

### 5. Product Analysis

```json
{
  "product_lines": [
    {
      "name": "Produto A",
      "description": "...",
      "price_range": "R$ 50-100",
      "popularity": 85,
      "margin": 40
    }
  ],
  "best_sellers": ["...", "..."],
  "seasonal_menu": true,
  "customer_feedback": "..."
}
```

### 6. ICP & Personas

```json
{
  "primary_persona": {
    "name": "João Silva",
    "age": "30-45",
    "occupation": "Empresário",
    "income": "R$ 10.000-20.000",
    "behaviors": ["...", "..."],
    "pain_points": ["...", "..."],
    "preferred_channels": ["LinkedIn", "WhatsApp"]
  },
  "secondary_persona": { ... }
}
```

### 7. KPI Table

```json
{
  "kpis": [
    {
      "name": "Ocupação Média",
      "current": 75,
      "target": 80,
      "unit": "%",
      "trend": "up",
      "frequency": "monthly"
    }
  ],
  "monitoring_frequency": "Semanal/Mensal",
  "responsible_team": "Gerente de Operações"
}
```

### 8. Objectives

```json
{
  "quarterly_objectives": [
    {
      "objective": "Aumentar ocupação para 80%",
      "key_results": ["...", "..."],
      "timeline": "Q4 2025",
      "responsible": "Gerente de Marketing",
      "budget": "R$ 15.000"
    }
  ],
  "long_term_vision": "...",
  "success_metrics": ["...", "..."]
}
```

## Exemplo Prático: Adicionar Empresa "XYZ Café"

### Dados da Empresa

- Nome: "XYZ Café"
- Email responsável: "cafe@xyz.com.br"
- Trimestre: 2025-Q4
- Cidade: Salvador
- Estado: BA

### Passo 1: Copiar Template

```bash
cp scripts/template-populate-strategic-map.sql scripts/populate-xyz-cafe.sql
```

### Passo 2: Editar Arquivo

Substituir no arquivo:
```
[EMPRESA_NOME] → XYZ Café
[EMPRESA_EMAIL] → cafe@xyz.com.br
[TRIMESTRE] → 2025-Q4
[ANO] → 2025
[NUMERO_TRIMESTRE] → 4
[CATEGORIA_EMPRESA] → Alimentação - Café Gourmet
[PUBLICO_ALVO] → Profissionais e estudantes 20-50 anos
[CIDADE] → Salvador
[ESTADO] → BA
... (continuar substituindo todos os valores)
```

### Passo 3: Executar

```sql
-- No Supabase SQL Editor
-- Copiar todo o conteúdo do arquivo populate-xyz-cafe.sql
-- Colar e executar
```

### Passo 4: Verificar

```sql
SELECT COUNT(*) FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (
    SELECT id FROM businesses
    WHERE name ILIKE '%XYZ Café%' LIMIT 1
  )
);
-- Deve retornar: 8
```

### Passo 5: Testar no Frontend

1. Login com credenciais do responsável
2. Acesse: `http://localhost:3003/dashboard/empresa`
3. Mapa estratégico deve aparecer com 8 seções

## Troubleshooting

### Erro: "relation strategic_maps does not exist"

**Causa**: Migração 032 não foi executada

**Solução**: Execute `supabase/migrations/032_create_strategic_map_tables.sql` primeiro

### Erro: "violates check constraint"

**Causa**: Constraint CHECK antiga em conflito

**Solução**: Execute `scripts/clean-and-repopulate-strategic-map.sql` primeiro

### Erro: "no rows affected"

**Causa**: Empresa não encontrada no banco

**Solução**: Verifique se a empresa existe:
```sql
SELECT id, name FROM businesses
WHERE name ILIKE '%XYZ Café%';
```

### Erro: "duplicate key value violates unique constraint"

**Causa**: Mapa para este trimestre já existe

**Solução**: Delete dados antigos:
```sql
DELETE FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%XYZ Café%' LIMIT 1)
  AND quarter = '2025-Q4'
);

DELETE FROM strategic_maps
WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%XYZ Café%' LIMIT 1)
AND quarter = '2025-Q4';
```

Depois execute o script novamente.

## Checklist para Adicionar Nova Empresa

- [ ] Empresa existe no banco (verificar em `businesses`)
- [ ] Usuário responsável existe (verificar em `users`)
- [ ] Todos os dados da empresa estão disponíveis
- [ ] Template copiado e renomeado
- [ ] Todas as variáveis foram substituídas
- [ ] Script executado sem erros
- [ ] Verificação SQL mostra 8 seções
- [ ] Frontend carrega dados corretamente
- [ ] Validação passou: `scripts/validate-strategic-map-setup.sql`

## Automação Futura

Para facilitar ainda mais, considere:

1. **Script Python**: Gerar script SQL a partir de CSV
2. **API de importação**: Upload de JSON com dados da empresa
3. **Integração com IA**: Gerar análises automaticamente
4. **Sincronização**: Atualizar dados automaticamente de APIs externas

---

**Status**: ✅ Pronto para usar
**Tempo por empresa**: 10-15 minutos
