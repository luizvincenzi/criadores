# 🔍 VERIFICAÇÃO - LP ADVOGADOS

## 📋 QUERIES PARA EXECUTAR NO SUPABASE

Execute estas queries no Supabase SQL Editor para verificar a LP de advogados:

---

## 1️⃣ VERIFICAR DADOS BÁSICOS DA LP

```sql
-- Ver informações básicas da LP
SELECT 
  id,
  slug,
  name,
  category,
  template_id,
  status,
  is_active,
  created_at,
  updated_at
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados';
```

**✅ Deve retornar:**
- slug: `empresas/social-media-advogados`
- name: `LP Social Media para Advogados`
- category: `segmento-especifico`
- status: `active`
- is_active: `true`

---

## 2️⃣ VERIFICAR SEO

```sql
-- Ver dados de SEO
SELECT 
  slug,
  seo->>'title' as seo_title,
  seo->>'description' as seo_description,
  seo->>'keywords' as seo_keywords,
  seo->>'og_image' as og_image
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados';
```

**✅ Deve retornar:**
- seo_title: `Marketing Jurídico para Advogados e Escritórios | crIAdores`
- seo_description: `Construa autoridade e atraia clientes qualificados...`
- seo_keywords: Array com palavras-chave

---

## 3️⃣ VERIFICAR HERO

```sql
-- Ver seção Hero
SELECT 
  slug,
  variables->'hero'->>'title' as hero_title,
  variables->'hero'->>'subtitle' as hero_subtitle,
  variables->'hero'->>'cta_text' as hero_cta,
  variables->'hero'->>'cta_url' as hero_cta_url,
  variables->'hero'->>'urgency_badge' as urgency_badge
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados';
```

**✅ Deve retornar:**
- hero_title: `Construa Autoridade e Atraia Clientes Qualificados`
- hero_subtitle: `Social media jurídica profissional...`
- hero_cta: `Falar Com Especialista Agora`

---

## 4️⃣ VERIFICAR PRODUTOS RELACIONADOS

```sql
-- Ver produtos relacionados à LP
SELECT 
  lp.slug as landing_page,
  p.id as product_id,
  p.name as product_name,
  p.slug as product_slug,
  p.default_price as preco_banco,
  lpp.order_index
FROM lp_products lpp
JOIN landing_pages lp ON lp.id = lpp.lp_id
JOIN products p ON p.id = lpp.product_id
WHERE lp.slug = 'empresas/social-media-advogados'
ORDER BY lpp.order_index;
```

**✅ Deve retornar:**
- product_name: `Estrategista de Marketing`
- product_slug: `estrategista`
- preco_banco: `1800.00`
- order_index: `1`

---

## 5️⃣ VERIFICAR SOLUÇÃO (COM PREÇO)

```sql
-- Ver solução com preço
SELECT 
  slug,
  jsonb_pretty(variables->'solucoes') as solucoes
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados';
```

**✅ Deve mostrar:**
- product_id: `e4601bac-eb02-4116-a6ad-6a79a85f628b` (Estrategista)
- title: `Social Media Jurídica Completa`
- price_monthly: `2500` (hardcoded no JSONB)
- price_semestral: `1500` (hardcoded no JSONB)

**⚠️ ATENÇÃO:** O preço no banco é R$ 1.800, mas no JSONB está R$ 2.500/1.500

---

## 6️⃣ VERIFICAR COMPLIANCE (ESPECÍFICO DE ADVOGADOS)

```sql
-- Ver seção de compliance (específica para advogados)
SELECT 
  slug,
  jsonb_pretty(variables->'compliance') as compliance
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados';
```

**✅ Deve mostrar:**
- Regras da OAB
- Compliance jurídico
- Ética profissional

---

## 7️⃣ VERIFICAR FAQ

```sql
-- Ver FAQ
SELECT 
  slug,
  jsonb_array_length(variables->'faq') as total_perguntas,
  variables->'faq'->0->>'question' as primeira_pergunta,
  variables->'faq'->0->>'answer' as primeira_resposta
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados';
```

**✅ Deve retornar:**
- total_perguntas: `4`
- primeira_pergunta: Relacionada a marketing jurídico

---

## 8️⃣ VERIFICAR CONTEÚDO COMPLETO (JSON)

```sql
-- Ver JSON completo da LP
SELECT 
  slug,
  jsonb_pretty(variables) as conteudo_completo
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados';
```

---

## 🎯 COMPARAÇÃO: BANCO vs PUBLICADO

### O Que Verificar

Execute as queries acima e compare com a página publicada:

**URL Publicada:**
```
https://criadores.app/empresas/social-media-advogados
```

**Checklist de Verificação:**

- [ ] **Hero Title** - Mesmo no banco e na página?
- [ ] **Hero Subtitle** - Mesmo no banco e na página?
- [ ] **CTA Text** - Mesmo no banco e na página?
- [ ] **Preço Exibido** - Qual está aparecendo? R$ 1.800 (banco) ou R$ 2.500 (JSONB)?
- [ ] **Benefícios** - Mesma quantidade e texto?
- [ ] **FAQ** - Mesmas 4 perguntas?
- [ ] **Compliance** - Seção de OAB aparece?
- [ ] **SEO Title** - Correto no `<title>` da página?

---

## 🔧 QUERY COMPLETA DE DIAGNÓSTICO

Execute esta query para ver TUDO de uma vez:

```sql
SELECT 
  '=== DADOS BÁSICOS ===' as secao,
  slug,
  name,
  category,
  status
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados'

UNION ALL

SELECT 
  '=== SEO ===' as secao,
  slug,
  seo->>'title' as name,
  seo->>'description' as category,
  NULL as status
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados'

UNION ALL

SELECT 
  '=== HERO ===' as secao,
  slug,
  variables->'hero'->>'title' as name,
  variables->'hero'->>'subtitle' as category,
  variables->'hero'->>'cta_text' as status
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados'

UNION ALL

SELECT 
  '=== PRODUTO ===' as secao,
  lp.slug,
  p.name,
  p.default_price::text as category,
  lpp.order_index::text as status
FROM lp_products lpp
JOIN landing_pages lp ON lp.id = lpp.lp_id
JOIN products p ON p.id = lpp.product_id
WHERE lp.slug = 'empresas/social-media-advogados';
```

---

## 📊 RESULTADO ESPERADO

Se tudo estiver correto, você deve ver:

```
=== DADOS BÁSICOS ===
empresas/social-media-advogados | LP Social Media para Advogados | segmento-especifico | active

=== SEO ===
empresas/social-media-advogados | Marketing Jurídico para Advogados... | Construa autoridade... | NULL

=== HERO ===
empresas/social-media-advogados | Construa Autoridade e Atraia Clientes... | Social media jurídica... | Falar Com Especialista

=== PRODUTO ===
empresas/social-media-advogados | Estrategista de Marketing | 1800.00 | 1
```

---

## ⚠️ PROBLEMAS CONHECIDOS

### 1. Divergência de Preços

**No Banco (products):**
- Estrategista de Marketing: R$ 1.800,00

**No JSONB (variables.solucoes):**
- price_monthly: R$ 2.500,00
- price_semestral: R$ 1.500,00

**Qual está sendo exibido?**
- Se o componente `DynamicLP` está funcionando, deve mostrar **R$ 1.800,00** (do banco)
- Se ainda está usando componente antigo, mostra **R$ 2.500,00** (hardcoded)

### 2. Verificar Qual Componente Está Sendo Usado

A página `/empresas/social-media-advogados` deve estar usando:
- ✅ `DynamicLP` (busca do banco)
- ❌ `SocialMediaAdvogadosLP` (hardcoded antigo)

---

## 🧪 TESTE RÁPIDO

### No Navegador

1. Acesse: `https://criadores.app/empresas/social-media-advogados`
2. Abra DevTools (F12) → Console
3. Execute:
```javascript
// Ver se está buscando do banco
console.log('Verificando fonte de dados...');
```

4. Verifique o preço exibido na página
5. Compare com o resultado da query do banco

---

## 📝 PRÓXIMOS PASSOS

Depois de executar as queries:

1. **Me envie os resultados** das queries 1, 2, 3, 4 e 5
2. **Me diga qual preço** está aparecendo na página publicada
3. **Vou comparar** e te dizer se está tudo correto

---

**EXECUTE AS QUERIES AGORA E ME ENVIE OS RESULTADOS!** 🚀

