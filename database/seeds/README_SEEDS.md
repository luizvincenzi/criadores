# 🌱 SEEDS - LANDING PAGES

Este diretório contém os dados iniciais (seeds) para popular o banco de dados com as 6 Landing Pages existentes.

---

## 📋 ORDEM DE EXECUÇÃO

Execute os arquivos SQL **nesta ordem exata** no Supabase SQL Editor:

### 1️⃣ Templates (OBRIGATÓRIO)
```sql
-- Arquivo: 001_initial_templates.sql
-- Cria os 3 templates base
```

### 2️⃣ LP Principal - Combo (OBRIGATÓRIO)
```sql
-- Arquivo: 002_initial_landing_pages.sql
-- Cria a LP /empresas (combo completo)
```

### 3️⃣ Demais LPs (OPCIONAL - mas recomendado)
```sql
-- Arquivo: 003_all_landing_pages.sql
-- Cria a LP /empresas/mentoria
-- Cria a LP /empresas/social-media

-- Arquivo: 004_lp_criadores.sql
-- Cria a LP /empresas/criadores

-- Arquivo: 005_lp_medicos.sql
-- Cria a LP /empresas/social-media-medicos

-- Arquivo: 006_lp_advogados.sql
-- Cria a LP /empresas/social-media-advogados
```

---

## 🎯 LANDING PAGES CRIADAS

| # | Slug | Nome | Template | Status |
|---|------|------|----------|--------|
| 1 | `empresas` | LP Principal - Combo Empresas | Combo Completo | ✅ Ativa |
| 2 | `empresas/mentoria` | LP Mentoria - Gabriel D'Ávila | Produto Único | ✅ Ativa |
| 3 | `empresas/social-media` | LP Social Media - Estrategista Dedicado | Produto Único | ✅ Ativa |
| 4 | `empresas/criadores` | LP Criadores - Marketing de Influência Local | Produto Único | ✅ Ativa |
| 5 | `empresas/social-media-medicos` | LP Social Media para Médicos | Segmento Específico | ✅ Ativa |
| 6 | `empresas/social-media-advogados` | LP Social Media para Advogados | Segmento Específico | ✅ Ativa |

---

## 📊 ESTRUTURA DE CADA LP

Cada LP contém:

### ✅ Dados Básicos
- `id` - UUID único
- `slug` - URL da LP
- `name` - Nome descritivo
- `category` - Categoria (combo, produto-unico, segmento-especifico)
- `template_id` - Referência ao template
- `status` - 'active' (publicada)
- `is_active` - true

### ✅ Variables (JSONB)
Conteúdo editável da LP:
- `hero` - Título, subtítulo, CTA, badges
- `problema` - Dores e agitação
- `solucoes` - Produtos e benefícios
- `combo` - Oferta combo (apenas LP principal)
- `processo` - Passos do processo
- `depoimentos` - Depoimentos de clientes
- `urgencia` - Gatilhos de urgência
- `faq` - Perguntas frequentes
- `cta_final` - CTA final
- `theme` - Cores e fontes
- `compliance` - Seção de compliance (médicos/advogados)

### ✅ Config (JSONB)
Configurações técnicas:
- `chatbot_url` - URL do chatbot
- `conversion_goal` - Objetivo de conversão
- `analytics` - IDs de tracking
- `features` - Features habilitadas
- `segment` - Segmento (médicos/advogados)

### ✅ SEO (JSONB)
Metadados para SEO:
- `title` - Título da página
- `description` - Meta description
- `keywords` - Palavras-chave
- `og_image` - Imagem Open Graph
- `canonical` - URL canônica
- `robots` - Diretivas para robôs

### ✅ Produtos Relacionados
Tabela `lp_products`:
- Relaciona LP com produtos do banco
- Define ordem de exibição
- Permite dados customizados por LP

---

## 🔍 VALIDAÇÃO

Após executar os seeds, valide com estas queries:

### Verificar Templates
```sql
SELECT id, name, slug, methodology 
FROM lp_templates 
ORDER BY created_at;
```
**Esperado:** 3 templates

### Verificar LPs
```sql
SELECT id, slug, name, category, status 
FROM landing_pages 
ORDER BY created_at;
```
**Esperado:** 6 LPs (todas com status 'active')

### Verificar Produtos Relacionados
```sql
SELECT 
  lp.slug,
  lp.name,
  COUNT(lpp.product_id) as total_produtos
FROM landing_pages lp
LEFT JOIN lp_products lpp ON lp.id = lpp.lp_id
GROUP BY lp.id, lp.slug, lp.name
ORDER BY lp.created_at;
```
**Esperado:**
- LP /empresas: 3 produtos
- Demais LPs: 1 produto cada

### Verificar Conteúdo de uma LP
```sql
SELECT 
  slug,
  variables->>'hero' as hero,
  variables->>'solucoes' as solucoes,
  seo->>'title' as seo_title
FROM landing_pages
WHERE slug = 'empresas';
```

---

## 🎨 METODOLOGIAS APLICADAS

Cada LP segue metodologias de conversão:

### LP Combo (/empresas)
- **Érico Rocha** - Funil completo
- **Ladeira** - Copy persuasivo
- **Jeff Walker** - PLF adaptado

### LPs Produto Único
- **Ladeira** - Headline + Benefícios + CTA direto
- Foco em conversão rápida

### LPs Segmento Específico (Médicos/Advogados)
- **Compliance** - Seção dedicada a normas
- **Autoridade** - Conteúdo educativo
- **Captação** - Formulários integrados

---

## 📝 NOTAS IMPORTANTES

### IDs Fixos
Os IDs das LPs são fixos para facilitar referências:
- `20000000-0000-0000-0000-000000000001` - /empresas
- `20000000-0000-0000-0000-000000000002` - /empresas/mentoria
- `20000000-0000-0000-0000-000000000003` - /empresas/social-media
- `20000000-0000-0000-0000-000000000004` - /empresas/criadores
- `20000000-0000-0000-0000-000000000005` - /empresas/social-media-medicos
- `20000000-0000-0000-0000-000000000006` - /empresas/social-media-advogados

### Product IDs
Certifique-se de que estes produtos existem na tabela `products`:
- `48835b46-53e6-4062-b763-841ced3bc0d9` - Mentoria
- `48835b46-53e6-4062-b763-841ced3bc0d8` - Social Media (Estrategista)
- `48835b46-53e6-4062-b763-841ced3bc0d7` - Marketing de Influência

Se os IDs forem diferentes, atualize nos arquivos de seed.

### Imagens
As LPs referenciam imagens em `/assets/`:
- `/assets/gabriel.jpg` - Foto do Gabriel D'Ávila
- `/assets/og-*.jpg` - Imagens Open Graph
- `/assets/depoimentos/*.jpg` - Fotos de depoimentos

Certifique-se de que essas imagens existem ou atualize os caminhos.

---

## 🚀 PRÓXIMOS PASSOS

Após executar os seeds:

1. ✅ Validar que todas as 6 LPs foram criadas
2. ✅ Testar acesso via API: `GET /api/landing-pages`
3. ✅ Testar renderização no criadores.app
4. ✅ Verificar SEO metadata
5. ✅ Testar CTAs e chatbots

---

## 🔧 TROUBLESHOOTING

### Erro: "duplicate key value violates unique constraint"
**Causa:** LP com mesmo slug já existe  
**Solução:** Delete a LP existente ou mude o slug

### Erro: "foreign key violation"
**Causa:** Template ou produto não existe  
**Solução:** Execute os seeds de templates primeiro

### Erro: "invalid input syntax for type json"
**Causa:** JSON malformado  
**Solução:** Valide o JSON em jsonlint.com

---

**Pronto para popular o banco! 🎉**

