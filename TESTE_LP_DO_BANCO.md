# 🎯 TESTE - LP Buscando do Banco de Dados

## ✅ O QUE FOI FEITO

Acabei de conectar a primeira LP ao banco de dados!

### 📁 Arquivos Criados/Atualizados

1. **`app/empresas/components/DynamicLP.tsx`** ✅ NOVO
   - Componente dinâmico que renderiza qualquer LP do banco
   - Usa os mesmos componentes visuais (PMEsHeader, PMEsFooter, etc)
   - **BUSCA PREÇOS DO BANCO** (prioriza `products.default_price`)

2. **`app/empresas/mentoria/page.tsx`** ✅ ATUALIZADO
   - Agora busca LP do banco via `landingPagesService`
   - SEO dinâmico (vem do banco)
   - Usa componente `DynamicLP`

---

## 🧪 TESTE AGORA

### 1️⃣ Acesse a Página

```
http://localhost:3000/empresas/mentoria
```

**✅ Deve mostrar:**
- Hero com título do banco: "Domine o Marketing e Transforme Seu Negócio"
- Seção de problemas
- Seção "O Que Inclui" com 8 benefícios
- **PREÇO DO BANCO:** R$ 1.500,00/mês (não mais R$ 2.500)
- Processo, Mentor, Depoimentos, FAQ
- CTA Final

---

### 2️⃣ Verificar Preço

O preço agora vem **direto do banco**!

**No banco:**
```sql
SELECT default_price FROM products WHERE slug = 'mentoria';
-- Retorna: 1500.00
```

**Na LP:**
- Deve mostrar: **R$ 1.500,00/mês**
- Não mais R$ 2.500 (que estava hardcoded)

---

### 3️⃣ Verificar SEO

Abra o DevTools (F12) → Elements → `<head>`

**Deve ter:**
```html
<title>Mentoria Estratégica de Marketing | crIAdores</title>
<meta name="description" content="Domine o marketing..." />
```

Tudo vindo do banco!

---

## 🔍 COMO FUNCIONA

### Fluxo de Dados

```
1. Usuário acessa /empresas/mentoria
   ↓
2. page.tsx chama landingPagesService.getLandingPageBySlug('empresas/mentoria')
   ↓
3. Supabase retorna:
   - LP completa (variables JSONB)
   - Produtos relacionados (com preços do banco)
   ↓
4. DynamicLP renderiza:
   - Hero (variables.hero)
   - Problema (variables.problema)
   - Soluções (variables.solucoes)
   - **PREÇO: products[0].default_price** ← DO BANCO!
   ↓
5. Página renderizada com dados 100% do banco
```

---

## 💰 PREÇOS: Banco vs JSONB

### Prioridade

O componente `DynamicLP` usa esta lógica:

```typescript
// 1. Tenta buscar produto do banco
const product = products?.find(p => p.id === solucao.product_id);

// 2. Se encontrou, usa preço do banco
if (product) {
  return product.default_price; // ← DO BANCO
}

// 3. Se não encontrou, usa preço do JSONB (fallback)
else {
  return solucao.price_monthly; // ← DO JSONB
}
```

**Resultado:**
- ✅ **Fonte única de verdade:** Banco de dados
- ✅ **Atualização automática:** Muda no banco, muda na LP
- ✅ **Fallback seguro:** Se produto não existir, usa JSONB

---

## 🎯 PRÓXIMOS PASSOS

### Depois que testar /empresas/mentoria:

1. **Atualizar preços no banco** (se quiser)
```sql
UPDATE products 
SET default_price = 2500.00 
WHERE slug = 'mentoria';
```

2. **Atualizar outras 5 páginas:**
   - `/empresas/page.tsx` (combo)
   - `/empresas/social-media/page.tsx`
   - `/empresas/criadores/page.tsx`
   - `/empresas/social-media-medicos/page.tsx`
   - `/empresas/social-media-advogados/page.tsx`

3. **Deletar componentes antigos:**
   - `PMEsMentoriaLP.tsx`
   - `PMEsSocialMediaLP.tsx`
   - `PMEsCriadoresLP.tsx`
   - `SocialMediaMedicosLP.tsx`
   - `SocialMediaAdvogadosLP.tsx`
   - `EmpresasLP.tsx`

---

## 🧪 TESTES PARA FAZER

### Teste 1: Verificar Conteúdo
- [ ] Hero mostra título correto
- [ ] Problemas aparecem (3 cards)
- [ ] Benefícios aparecem (8 itens)
- [ ] FAQ aparece (4 perguntas)

### Teste 2: Verificar Preço
- [ ] Preço mostra R$ 1.500,00 (do banco)
- [ ] Nome do produto aparece: "Mentoria"

### Teste 3: Verificar SEO
- [ ] Title tag correto
- [ ] Meta description correto
- [ ] Open Graph tags corretos

### Teste 4: Verificar Funcionalidade
- [ ] Botão "Agendar Diagnóstico" abre formulário
- [ ] Links internos funcionam (#o-que-inclui)
- [ ] Header e Footer aparecem

---

## ❌ SE DER ERRO

### Erro: "Cannot read properties of undefined"

**Causa:** Supabase não retornou a LP  
**Solução:**
1. Verifique se a LP existe no banco:
```sql
SELECT * FROM landing_pages WHERE slug = 'empresas/mentoria';
```

2. Verifique variáveis de ambiente (`.env.local`)

### Erro: "Product not found"

**Causa:** Produto não está relacionado à LP  
**Solução:**
```sql
SELECT * FROM lp_products WHERE lp_id = (
  SELECT id FROM landing_pages WHERE slug = 'empresas/mentoria'
);
```

### Erro: Página em branco

**Causa:** Erro de renderização  
**Solução:**
1. Abra DevTools → Console
2. Veja o erro
3. Me envie a mensagem

---

## 🎉 QUANDO FUNCIONAR

**Me diga:**
1. ✅ A página carregou?
2. ✅ O preço está correto (R$ 1.500)?
3. ✅ Todo o conteúdo aparece?

**Aí eu:**
1. Atualizo as outras 5 páginas
2. Deletamos os componentes antigos
3. **100% do conteúdo vindo do banco!** 🚀

---

**TESTE AGORA:** http://localhost:3000/empresas/mentoria

**Me diga o que aparece!** 🚀

