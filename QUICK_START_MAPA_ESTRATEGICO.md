# ⚡ Quick Start - Mapa Estratégico

## Ativação Rápida (3 passos)

### 1️⃣ Executar Migração
```bash
# Copie todo o conteúdo de:
supabase/migrations/032_create_strategic_map_tables.sql

# Cole no Supabase Dashboard > SQL Editor
# Clique em "Run"
```

### 2️⃣ Popular Dados
```bash
# Copie todo o conteúdo de:
scripts/populate-boussole-strategic-map.sql

# Cole no Supabase Dashboard > SQL Editor
# Clique em "Run"
```

### 3️⃣ Testar
```bash
# Login com credenciais da Boussolé:
Email: financeiro.brooftop@gmail.com
Senha: [sua senha]

# Acesse:
http://localhost:3003/dashboard/empresa
```

---

## 📁 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `supabase/migrations/032_create_strategic_map_tables.sql` | Tabelas, ENUMs, índices, RLS |
| `app/api/strategic-maps/route.ts` | API GET/POST/PUT |
| `app/api/strategic-maps/sections/route.ts` | API para seções |
| `app/(dashboard)/dashboard/empresa/page.tsx` | Página frontend |
| `scripts/populate-boussole-strategic-map.sql` | Dados de teste |
| `scripts/validate-strategic-map-setup.sql` | Script de validação |

---

## 🔍 Validação Rápida

### Via SQL
```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('strategic_maps', 'strategic_map_sections');

-- Verificar dados do Boussolé
SELECT COUNT(*) FROM strategic_maps
WHERE business_id LIKE '%bouss%';

-- Ver seções
SELECT section_type, COUNT(*)
FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps WHERE business_id LIKE '%bouss%'
)
GROUP BY section_type;
```

### Via API
```bash
# Substituir {BUSINESS_ID} pelo ID da Boussolé
curl "http://localhost:3003/api/strategic-maps?business_id={BUSINESS_ID}&quarter=2025-Q4"

# Resposta esperada:
{
  "strategic_map": { ... },
  "sections": [ ... ]
}
```

---

## 📊 8 Seções do Mapa

| # | Tipo | Descrição |
|---|------|-----------|
| 1 | `metrics_overview` | Métricas de presença digital |
| 2 | `market_analysis` | Análise de mercado |
| 3 | `business_diagnosis` | Diagnóstico do negócio |
| 4 | `swot` | Análise SWOT |
| 5 | `product_analysis` | Análise de produtos |
| 6 | `icp_personas` | Clientes ideais |
| 7 | `kpi_table` | Indicadores de performance |
| 8 | `objectives` | Objetivos e ações |

---

## 🚨 Troubleshooting Rápido

| Erro | Solução |
|------|---------|
| "relation strategic_maps does not exist" | Execute migração 032 |
| "invalid input value for enum section_type" | Use um dos 8 valores acima |
| "No map found" na página | Execute script de população |
| Página carregando infinitamente | Verifique se user.business_id existe |
| API retorna vazio | Confirme business_id e quarter corretos |

---

## 📋 Dados Inseridos (Boussolé)

- **Mapas**: 1 (Q4 2025)
- **Seções**: 8 (uma de cada tipo)
- **Status**: completed
- **Dados**: Realistas para restaurante rooftop em Londrina/PR

---

## 🔐 Segurança

- ✅ RLS habilitado
- ✅ Acesso por organização
- ✅ Apenas managers criam mapas
- ✅ Audit trail (created_by, timestamps)

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `INSTRUÇÕES_IMPLEMENTAÇÃO_MAPA_ESTRATÉGICO.md` - Guia completo
- `CHANGELOG_MAPA_ESTRATEGICO.md` - Todas as mudanças
- `RESUMO_SOLUÇÃO.txt` - Visão geral visual

---

## ✅ Checklist

- [ ] Migração SQL executada
- [ ] Dados do Boussolé carregados
- [ ] Página `/dashboard/empresa` carregada
- [ ] Login com credenciais da Boussolé realizado
- [ ] Mapa estratégico exibido com 8 seções
- [ ] Dados corretos aparecem na página

---

## 🎯 Próximas Ações

1. Ativar para outras empresas (execute script com seus dados)
2. Implementar edição de seções
3. Integrar com IA para análises automáticas
4. Adicionar exportação em PDF

---

**Status**: ✅ Pronto para uso
