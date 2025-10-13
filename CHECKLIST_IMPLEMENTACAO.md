# ✅ CHECKLIST DE IMPLEMENTAÇÃO - SISTEMA DE LPs DINÂMICAS

## 📋 FASE 0: PREPARAÇÃO (Hoje - 1 hora)

### Banco de Dados
- [ ] Acessar Supabase Dashboard
- [ ] Abrir SQL Editor
- [ ] Executar `database/migrations/001_landing_pages_system.sql`
- [ ] Executar `database/seeds/001_initial_templates.sql`
- [ ] Executar `database/seeds/002_initial_landing_pages.sql`
- [ ] Verificar que 5 tabelas foram criadas
- [ ] Verificar que 3 templates foram inseridos
- [ ] Verificar que 1 LP foi inserida

### Validação
```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'lp_%';

-- Deve retornar:
-- lp_templates
-- landing_pages (ou lp_landing_pages)
-- lp_products
-- lp_analytics
-- lp_versions

-- Verificar templates
SELECT id, name, slug FROM lp_templates;

-- Deve retornar 3 templates:
-- combo-completo
-- produto-unico
-- segmento-especifico

-- Verificar LP
SELECT id, slug, name, status FROM landing_pages;

-- Deve retornar 1 LP:
-- empresas | LP Principal - Combo Empresas | active
```

---

## 📋 FASE 1: SETUP CRIADORES.DIGITAL (Semana 1 - 8 horas)

### Dia 1: Criar Projeto (2 horas)

- [ ] Criar projeto Next.js
```bash
npx create-next-app@latest criadores-digital --typescript --tailwind --app
cd criadores-digital
```

- [ ] Instalar dependências
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @radix-ui/react-* # shadcn/ui dependencies
npx shadcn-ui@latest init
```

- [ ] Configurar `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] Configurar Tailwind com Material Design 3
- [ ] Criar estrutura de pastas base

### Dia 2: Supabase Client (2 horas)

- [ ] Criar `lib/supabase/client.ts`
- [ ] Criar `lib/supabase/server.ts`
- [ ] Criar tipos TypeScript em `lib/types/`
  - [ ] `landing-page.ts`
  - [ ] `template.ts`
  - [ ] `product.ts`
  - [ ] `analytics.ts`

### Dia 3: Autenticação (2 horas)

- [ ] Criar `middleware.ts` (proteção de rotas)
- [ ] Criar `app/(auth)/login/page.tsx`
- [ ] Criar `app/(auth)/layout.tsx`
- [ ] Configurar Supabase Auth
- [ ] Testar login/logout

### Dia 4: Layout Base (2 horas)

- [ ] Criar `app/(dashboard)/layout.tsx`
- [ ] Criar `components/dashboard/Sidebar.tsx`
- [ ] Criar `components/dashboard/Header.tsx`
- [ ] Instalar shadcn/ui components:
  - [ ] Button
  - [ ] Input
  - [ ] Textarea
  - [ ] Select
  - [ ] Card
  - [ ] Table
  - [ ] Dialog
  - [ ] Tabs
  - [ ] Toast

---

## 📋 FASE 2: SERVIÇOS E CRUD (Semana 2 - 16 horas)

### Dia 1-2: Serviço de Landing Pages (8 horas)

- [ ] Criar `lib/services/landingPagesService.ts`
- [ ] Implementar funções:
  - [ ] `getAllLandingPages()`
  - [ ] `getLandingPageById(id)`
  - [ ] `getLandingPageBySlug(slug)`
  - [ ] `createLandingPage(data)`
  - [ ] `updateLandingPage(id, data)`
  - [ ] `deleteLandingPage(id)`
  - [ ] `publishLandingPage(id)`
  - [ ] `duplicateLandingPage(id, newSlug)`
  - [ ] `getLandingPageVersions(id)`
  - [ ] `restoreLandingPageVersion(id, versionId)`

- [ ] Criar testes unitários
- [ ] Validar error handling

### Dia 3: Dashboard Principal (4 horas)

- [ ] Criar `app/(dashboard)/page.tsx`
- [ ] Implementar cards de métricas
- [ ] Implementar tabela de LPs
- [ ] Implementar filtros
- [ ] Implementar busca
- [ ] Botão "Nova LP"

### Dia 4: Lista e Visualização (4 horas)

- [ ] Criar `app/(dashboard)/landing-pages/page.tsx`
- [ ] Criar `app/(dashboard)/landing-pages/[id]/page.tsx`
- [ ] Implementar ações:
  - [ ] Editar
  - [ ] Duplicar
  - [ ] Deletar
  - [ ] Ver Analytics
  - [ ] Ver Versões

---

## 📋 FASE 3: EDITOR (Semana 3-4 - 32 horas)

### Semana 3: Estrutura do Editor

#### Dia 1-2: Editor Principal (8 horas)

- [ ] Criar `app/(dashboard)/landing-pages/[id]/edit/page.tsx`
- [ ] Criar `components/editor/LPEditor.tsx`
- [ ] Implementar layout split (editor | preview)
- [ ] Implementar tabs por seção
- [ ] Implementar auto-save (30s)
- [ ] Implementar botões Salvar/Publicar

#### Dia 3: Preview Panel (4 horas)

- [ ] Criar `components/editor/PreviewPanel.tsx`
- [ ] Implementar toggle desktop/mobile/tablet
- [ ] Implementar zoom
- [ ] Implementar scroll sincronizado

#### Dia 4: Componentes Base (4 horas)

- [ ] Criar `components/editor/ColorPicker.tsx`
- [ ] Criar `components/editor/ImageUploader.tsx`
- [ ] Criar `components/editor/ArrayEditor.tsx`
- [ ] Criar `components/editor/RichTextEditor.tsx`

### Semana 4: Editores de Seção

#### Dia 1: Hero + Problema (4 horas)

- [ ] Criar `components/editor/sections/HeroEditor.tsx`
  - [ ] Campo title (Input, max 100)
  - [ ] Campo subtitle (Textarea, max 500)
  - [ ] Campo cta_text (Input, max 50)
  - [ ] Campo cta_url (Select)
  - [ ] Campo urgency_badge (Input, max 100)
  - [ ] Grupo social_proof (3 inputs numéricos)
  - [ ] Array trust_badges
  - [ ] Tooltips com metodologias

- [ ] Criar `components/editor/sections/ProblemaEditor.tsx`
  - [ ] Campo title
  - [ ] Campo subtitle
  - [ ] Array problems (icon, title, description)

#### Dia 2: Soluções (4 horas)

- [ ] Criar `components/editor/sections/SolucoesEditor.tsx`
  - [ ] Array de soluções
  - [ ] Select product_id (buscar do banco)
  - [ ] Campo title
  - [ ] Campo description (RichText)
  - [ ] Array benefits
  - [ ] Campo urgency
  - [ ] Campos CTA
  - [ ] Drag & drop para reordenar

#### Dia 3: Combo + Depoimentos (4 horas)

- [ ] Criar `components/editor/sections/ComboEditor.tsx`
  - [ ] Campo title
  - [ ] Campo description
  - [ ] Campos de preço (monthly, semestral)
  - [ ] Cálculo automático de desconto
  - [ ] Array exclusive_benefits
  - [ ] Array bonus
  - [ ] Campo guarantee

- [ ] Criar `components/editor/sections/DepoimentosEditor.tsx`
  - [ ] Array de depoimentos
  - [ ] Upload de foto
  - [ ] Campos: name, company, role, text, result

#### Dia 4: FAQ + Tema (4 horas)

- [ ] Criar `components/editor/sections/FAQEditor.tsx`
  - [ ] Array de perguntas/respostas
  - [ ] Drag & drop para reordenar

- [ ] Criar `components/editor/sections/TemaEditor.tsx`
  - [ ] ColorPicker primary_color
  - [ ] ColorPicker secondary_color
  - [ ] Select font_family
  - [ ] Input border_radius

#### Dia 5: Integração e Testes (4 horas)

- [ ] Integrar todos os editores no LPEditor
- [ ] Testar auto-save
- [ ] Testar preview em tempo real
- [ ] Testar validações
- [ ] Corrigir bugs

---

## 📋 FASE 4: ANALYTICS (Semana 5 - 16 horas)

### Dia 1-2: Serviço de Analytics (8 horas)

- [ ] Criar `lib/services/analyticsService.ts`
- [ ] Implementar funções:
  - [ ] `getLPAnalytics(lpId, days)`
  - [ ] `getGlobalMetrics(days)`
  - [ ] `trackPageView(lpId)`
  - [ ] `trackCTAClick(lpId, section)`
  - [ ] `trackConversion(lpId)`

### Dia 3: Dashboard de Analytics (4 horas)

- [ ] Criar `app/(dashboard)/landing-pages/[id]/analytics/page.tsx`
- [ ] Implementar cards de métricas
- [ ] Implementar filtros de período
- [ ] Instalar Recharts
```bash
npm install recharts
```

### Dia 4: Gráficos (4 horas)

- [ ] Criar `components/analytics/ConversionChart.tsx` (LineChart)
- [ ] Criar `components/analytics/SectionsChart.tsx` (BarChart)
- [ ] Criar `components/analytics/DevicesChart.tsx` (PieChart)
- [ ] Criar `components/analytics/TrafficChart.tsx` (PieChart)
- [ ] Criar `components/analytics/MetricsGrid.tsx`

---

## 📋 FASE 5: INTEGRAÇÃO CRIADORES.APP (Semana 6 - 16 horas)

### Dia 1: Serviço de Leitura (4 horas)

- [ ] No criadores.app, criar `lib/services/landingPagesService.ts`
- [ ] Implementar funções (READ ONLY):
  - [ ] `getLandingPageBySlug(slug)`
  - [ ] `getActiveLandingPages()`
- [ ] Configurar cache (revalidate: 60)

### Dia 2: Componente Dinâmico (4 horas)

- [ ] Criar `components/DynamicLP.tsx`
- [ ] Criar `components/sections/HeroSection.tsx`
- [ ] Criar `components/sections/ProblemaSection.tsx`
- [ ] Criar `components/sections/SolucaoSection.tsx`
- [ ] Criar `components/sections/ComboSection.tsx`
- [ ] Criar `components/sections/DepoimentosSection.tsx`
- [ ] Criar `components/sections/FAQSection.tsx`

### Dia 3: Página Dinâmica (4 horas)

- [ ] Criar `app/[slug]/page.tsx`
- [ ] Implementar `generateMetadata()`
- [ ] Implementar `generateStaticParams()` (opcional)
- [ ] Integrar DynamicLP
- [ ] Testar com LP /empresas

### Dia 4: Migração de LPs (4 horas)

- [x] Migrar LP /empresas para o banco (002_initial_landing_pages.sql)
- [x] Migrar LP /empresas/mentoria para o banco (003_all_landing_pages.sql)
- [x] Migrar LP /empresas/social-media para o banco (003_all_landing_pages.sql)
- [x] Migrar LP /empresas/criadores para o banco (004_lp_criadores.sql)
- [x] Migrar LP /empresas/social-media-medicos para o banco (005_lp_medicos.sql)
- [x] Migrar LP /empresas/social-media-advogados para o banco (006_lp_advogados.sql)
- [ ] Executar seeds no Supabase
- [ ] Testar todas as 6 LPs

---

## 📋 FASE 6: TESTES E DEPLOY (Semana 7 - 16 horas)

### Dia 1-2: Testes (8 horas)

- [ ] Testes unitários dos serviços
- [ ] Testes de integração
- [ ] Testes E2E com Playwright
- [ ] Testes de performance
- [ ] Testes de responsividade
- [ ] Testes de SEO

### Dia 3: Deploy criadores.digital (4 horas)

- [ ] Configurar Vercel
- [ ] Configurar variáveis de ambiente
- [ ] Deploy de produção
- [ ] Testar em produção
- [ ] Configurar domínio criadores.digital

### Dia 4: Deploy criadores.app (4 horas)

- [ ] Atualizar código com DynamicLP
- [ ] Testar localmente
- [ ] Deploy de produção
- [ ] Testar todas as 6 LPs em produção
- [ ] Configurar redirecionamentos 301

---

## 📋 VALIDAÇÃO FINAL

### Funcionalidades Essenciais

- [ ] **CRUD de LPs**
  - [ ] Criar nova LP
  - [ ] Editar LP existente
  - [ ] Duplicar LP
  - [ ] Deletar LP
  - [ ] Publicar LP

- [ ] **Editor**
  - [ ] Editar todas as seções
  - [ ] Preview em tempo real
  - [ ] Auto-save funciona
  - [ ] Validações funcionam
  - [ ] Upload de imagens funciona
  - [ ] Color picker funciona

- [ ] **Analytics**
  - [ ] Dashboard mostra métricas
  - [ ] Gráficos renderizam
  - [ ] Filtros funcionam

- [ ] **Integração**
  - [ ] criadores.app lê do banco
  - [ ] LPs renderizam corretamente
  - [ ] SEO está correto
  - [ ] Performance está boa (Lighthouse > 90)

### LPs Migradas

- [ ] /empresas (Combo)
- [ ] /empresas/mentoria
- [ ] /empresas/social-media
- [ ] /empresas/criadores
- [ ] /empresas/social-media-medicos
- [ ] /empresas/social-media-advogados

### Metodologias Aplicadas

- [ ] Tooltips com dicas de Érico Rocha
- [ ] Tooltips com dicas de Ladeira
- [ ] Tooltips com dicas de Jeff Walker
- [ ] Templates seguem estrutura correta

---

## 🎯 MÉTRICAS DE SUCESSO

### Após 1 Semana
- [ ] Banco de dados configurado
- [ ] Projeto criadores.digital criado
- [ ] Autenticação funcionando

### Após 1 Mês
- [ ] Editor completo funcionando
- [ ] 6 LPs migradas
- [ ] Analytics básico funcionando

### Após 2 Meses
- [ ] 10+ LPs criadas
- [ ] A/B testing funcionando
- [ ] Equipe de marketing usando autonomamente

---

## 📞 SUPORTE

**Documentação:**
- `GUIA_DESENVOLVIMENTO_CRIADORES_DIGITAL.md`
- `PROMPTS_COMPONENTES_DETALHADOS.md`
- `ARQUITETURA_VISUAL.md`
- `RESUMO_EXECUTIVO_SISTEMA_LPS.md`

**Arquivos de Banco:**
- `database/migrations/001_landing_pages_system.sql`
- `database/schemas/lp_variables_schema.json`
- `database/seeds/001_initial_templates.sql`
- `database/seeds/002_initial_landing_pages.sql`

---

**Status:** ✅ Pronto para começar  
**Próximo Passo:** Aplicar migrations no Supabase

🚀 **Vamos começar!**

