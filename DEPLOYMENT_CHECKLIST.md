# ✅ Checklist de Deployment - Mapa Estratégico

Use este checklist para garantir que tudo está funcionando corretamente antes de colocar em produção.

## Fase 1: Preparação do Banco de Dados

- [ ] **Backup do banco**: Faça backup do Supabase antes de começar
- [ ] **Executar Migração 032**:
  - [ ] Copie: `supabase/migrations/032_create_strategic_map_tables.sql`
  - [ ] Execute no Supabase SQL Editor
  - [ ] Verifique se não houve erros
- [ ] **Verificar tabelas criadas**:
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('strategic_maps', 'strategic_map_sections');
  ```
  - [ ] Ambas as tabelas devem aparecer
- [ ] **Verificar ENUM criado**:
  ```sql
  SELECT enum_range(NULL::section_type);
  ```
  - [ ] Deve retornar os 8 valores (metrics_overview, market_analysis, etc.)

## Fase 2: Verificação de Índices e Constraints

- [ ] **Verificar RLS habilitado**:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables
  WHERE tablename IN ('strategic_maps', 'strategic_map_sections');
  ```
  - [ ] Ambas devem ter `rowsecurity = true`

- [ ] **Verificar índices criados**:
  ```sql
  SELECT indexname FROM pg_indexes
  WHERE tablename IN ('strategic_maps', 'strategic_map_sections')
  ORDER BY tablename;
  ```
  - [ ] Deve haver vários índices criados

- [ ] **Verificar triggers criados**:
  ```sql
  SELECT trigger_name FROM information_schema.triggers
  WHERE event_object_table IN ('strategic_maps', 'strategic_map_sections');
  ```
  - [ ] Deve haver triggers de `updated_at`

## Fase 3: População de Dados

- [ ] **Tentar popular com script principal**:
  - [ ] Copie: `scripts/populate-boussole-strategic-map.sql`
  - [ ] Execute no Supabase SQL Editor

- [ ] **Se receber erro de constraint**:
  - [ ] Copie: `scripts/clean-and-repopulate-strategic-map.sql`
  - [ ] Execute no Supabase SQL Editor
  - [ ] Espere a mensagem "Dados inseridos com sucesso!"

- [ ] **Verificar dados inseridos**:
  ```sql
  SELECT COUNT(*) as total_sections
  FROM strategic_map_sections
  WHERE strategic_map_id IN (
    SELECT id FROM strategic_maps
    WHERE business_id = (
      SELECT id FROM businesses WHERE name ILIKE '%boussolé%' LIMIT 1
    )
  );
  ```
  - [ ] Deve retornar: **8 seções**

- [ ] **Verificar que todas as seções estão presentes**:
  ```sql
  SELECT section_type, COUNT(*)
  FROM strategic_map_sections
  WHERE strategic_map_id IN (
    SELECT id FROM strategic_maps
    WHERE business_id = (
      SELECT id FROM businesses WHERE name ILIKE '%boussolé%' LIMIT 1
    )
  )
  GROUP BY section_type
  ORDER BY section_type;
  ```
  - [ ] Deve retornar 8 linhas (uma de cada tipo)

## Fase 4: Verificação da API

- [ ] **Teste GET da API**:
  ```bash
  curl "http://localhost:3003/api/strategic-maps?business_id=<BOUSSOLE_BUSINESS_ID>&quarter=2025-Q4"
  ```
  - [ ] Deve retornar JSON com `strategic_map` e `sections`
  - [ ] `strategic_map` deve ter dados da Boussolé
  - [ ] `sections` deve ter 8 itens

- [ ] **Verificar estrutura de resposta**:
  - [ ] Response tem `strategic_map.id`
  - [ ] Response tem `strategic_map.business_id`
  - [ ] Response tem `strategic_map.quarter` = "2025-Q4"
  - [ ] Response tem `sections` array com 8 itens
  - [ ] Cada seção tem `section_type`, `content`, `ai_generated_content`

## Fase 5: Teste no Frontend

- [ ] **Login com credenciais da Boussolé**:
  - [ ] Email: `financeiro.brooftop@gmail.com`
  - [ ] Digite a senha correta
  - [ ] Clique em "Entrar"
  - [ ] Deve fazer login com sucesso

- [ ] **Acessar página do Mapa Estratégico**:
  - [ ] Acesse: `http://localhost:3003/dashboard/empresa`
  - [ ] Página deve carregar sem erros
  - [ ] Deve mostrar "Mapa Estratégico" como título

- [ ] **Verificar conteúdo exibido**:
  - [ ] Nome da empresa mostrado: "Boussolé" (ou equivalente)
  - [ ] Período selecionável: "2025-Q4" deve estar disponível
  - [ ] Status mostrado: "✅ Completo"

- [ ] **Verificar cada seção aparece**:
  - [ ] [ ] Visão Geral das Métricas (section_order 1)
  - [ ] [ ] Análise de Mercado (section_order 2)
  - [ ] [ ] Diagnóstico do Negócio (section_order 3)
  - [ ] [ ] Análise SWOT (section_order 4)
  - [ ] [ ] Análise de Produto (section_order 5)
  - [ ] [ ] ICP & Personas (section_order 6)
  - [ ] [ ] KPIs e Indicadores (section_order 7)
  - [ ] [ ] Objetivos e Plano de Ação (section_order 8)

- [ ] **Verificar dados nas seções**:
  - [ ] Métricas: Instagram 8.750 seguidores, 4.8% engagement
  - [ ] Mercado: "R$ 850 milhões anuais"
  - [ ] Negócio: Ocupação 68%, Ticket R$ 85
  - [ ] SWOT: 5 forças, 4 fraquezas, 4 oportunidades, 4 ameaças
  - [ ] Produto: 3 linhas (Drinks, Menu, Petiscos)
  - [ ] Personas: Mariana Silva, Roberto Santos
  - [ ] KPIs: 4 indicadores (Ocupação, Ticket, Margem, NPS)
  - [ ] Objetivos: 3 objetivos trimestrais

- [ ] **Testar mudança de trimestre** (se houver dados para outro período)
  - [ ] Selecionar outro trimestre no dropdown
  - [ ] Página deve recarregar com novos dados

## Fase 6: Testes de Segurança e Performance

- [ ] **Testar RLS (Row Level Security)**:
  - [ ] Fazer login com usuário de OUTRA empresa
  - [ ] Acessar `/dashboard/empresa`
  - [ ] Deve ver dados da SUA empresa, não da Boussolé
  - [ ] (Ou nenhum dado se não tiver mapa estratégico)

- [ ] **Testar sem autenticação**:
  - [ ] Sair da conta
  - [ ] Tentar acessar `/dashboard/empresa`
  - [ ] Deve ser redirecionado para login

- [ ] **Performance**:
  - [ ] Pagina deve carregar em < 2 segundos
  - [ ] Mudar de trimestre deve ser rápido (< 1 segundo)
  - [ ] Console do navegador não deve ter erros críticos

## Fase 7: Documentação e Handoff

- [ ] **Documentação lida e entendida**:
  - [ ] [ ] `QUICK_START_MAPA_ESTRATEGICO.md`
  - [ ] [ ] `INSTRUÇÕES_IMPLEMENTAÇÃO_MAPA_ESTRATÉGICO.md`
  - [ ] [ ] `FIX_SECTION_TYPE_CONSTRAINT_ERROR.md`
  - [ ] [ ] `CHANGELOG_MAPA_ESTRATEGICO.md`

- [ ] **Scripts de validação**:
  - [ ] [ ] Executar `scripts/validate-strategic-map-setup.sql`
  - [ ] [ ] Todos os checks passaram

- [ ] **Git commits realizados**:
  - [ ] [ ] Verificar que todos os commits foram feitos
  - [ ] [ ] `git log` mostra as mudanças recentes
  - [ ] [ ] Tudo está na branch `main`

## Fase 8: Próximos Passos

- [ ] **Para adicionar mais empresas**:
  - [ ] [ ] Criar script baseado em `populate-boussole-strategic-map.sql`
  - [ ] [ ] Ajustar dados específicos da empresa
  - [ ] [ ] Executar script de população

- [ ] **Para futuras melhorias**:
  - [ ] [ ] Implementar edição de seções
  - [ ] [ ] Integrar com IA para gerar análises
  - [ ] [ ] Adicionar exportação em PDF
  - [ ] [ ] Criar comparação entre trimestres

## Resumo Final

### Status dos Componentes

| Componente | Status | Observação |
|-----------|--------|-----------|
| Banco de Dados | ✅ | Tabelas, ENUMs, índices criados |
| API REST | ✅ | Routes implementadas e testadas |
| Frontend | ✅ | Página carregando dados corretamente |
| Segurança (RLS) | ✅ | Habilitada em ambas tabelas |
| Dados Boussolé | ✅ | 8 seções populadas |
| Documentação | ✅ | Completa e atualizada |

### Pontos Críticos Monitorar

1. **Constraint CHECK**: Se houver erro, use `scripts/clean-and-repopulate-strategic-map.sql`
2. **RLS Policies**: Garantir que cada usuário vê apenas sua organização
3. **Performance**: Índices estão otimizando queries
4. **Dados**: Sempre validar com `validate-strategic-map-setup.sql` após mudanças

---

## Execução do Checklist

**Data de Execução**: _______________

**Executado por**: _______________

**Status Final**:
- [ ] ✅ TUDO OK - Pronto para produção
- [ ] ⚠️ COM RESSALVAS - Verificar itens marcados
- [ ] ❌ NÃO PRONTO - Revisar documentação

**Observações**:
```
[Adicione aqui qualquer observação relevante]
```

---

**Próximo revisor**: _______________
**Data da próxima revisão**: _______________
