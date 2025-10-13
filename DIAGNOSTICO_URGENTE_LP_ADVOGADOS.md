# 🚨 DIAGNÓSTICO URGENTE - LP ADVOGADOS

## ❌ PROBLEMA CONFIRMADO

A página **NÃO** está mostrando exatamente o que está no banco!

---

## 🔍 EVIDÊNCIAS

### 1. Código da Página (✅ CORRETO)
```typescript
// app/empresas/social-media-advogados/page.tsx
export default async function SocialMediaAdvogadosPage() {
  const lp = await landingPagesService.getLandingPageBySlug('empresas/social-media-advogados');
  return <DynamicLP lp={lp} />;
}
```
✅ Está usando `DynamicLP` (componente que busca do banco)

### 2. Componente DynamicLP (✅ CORRETO)
```typescript
// app/empresas/components/DynamicLP.tsx
<h1>{hero.title}</h1>
```
✅ Apenas renderiza o que vem do banco, sem modificações

### 3. Serviço (✅ CORRETO)
```typescript
// lib/services/landingPagesService.ts
const { data: lp } = await this.supabase
  .from('landing_pages')
  .select('*')
  .eq('slug', 'empresas/social-media-advogados')
  .single();
```
✅ Busca direto da tabela `landing_pages`

---

## ⚠️ POSSÍVEIS CAUSAS

### Causa 1: Cache do Next.js
- Next.js pode estar cacheando a página antiga
- Solução: Limpar cache e rebuild

### Causa 2: Deploy Antigo
- Vercel/Netlify pode estar servindo versão antiga
- Solução: Verificar último deploy

### Causa 3: Dados Errados na Tabela Principal
- Você mostrou `lp_versions` (histórico)
- Precisamos ver `landing_pages` (tabela principal)
- Solução: Query na tabela correta

### Causa 4: Múltiplos Registros
- Pode haver 2 registros com mesmo slug
- Um com "TESTE" e outro sem
- Solução: Verificar duplicatas

---

## 🧪 QUERIES DE DIAGNÓSTICO

Execute estas queries no Supabase:

### Query 1: Ver Tabela Principal (NÃO lp_versions)
```sql
-- VER DADOS DA TABELA PRINCIPAL
SELECT 
  id,
  slug,
  name,
  status,
  is_active,
  variables->'hero'->>'title' as hero_title,
  variables->'problema'->>'title' as problema_title,
  created_at,
  updated_at
FROM landing_pages  -- ← TABELA PRINCIPAL, NÃO lp_versions
WHERE slug = 'empresas/social-media-advogados';
```

**O QUE ESPERAR:**
- Se retornar `hero_title` com "TESTE" → Banco está errado
- Se retornar `hero_title` SEM "TESTE" → Cache/Deploy está errado

---

### Query 2: Verificar Duplicatas
```sql
-- VER SE HÁ MÚLTIPLOS REGISTROS
SELECT 
  id,
  slug,
  status,
  is_active,
  variables->'hero'->>'title' as hero_title
FROM landing_pages
WHERE slug LIKE '%advogados%'
ORDER BY created_at DESC;
```

**O QUE ESPERAR:**
- Deve retornar apenas 1 registro
- Se retornar 2+, há duplicatas

---

### Query 3: Ver JSON Completo
```sql
-- VER VARIABLES COMPLETO
SELECT 
  slug,
  jsonb_pretty(variables) as variables_completo
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados';
```

---

## 🔧 SOLUÇÕES POSSÍVEIS

### Solução 1: Limpar "TESTE" do Banco
```sql
-- REMOVER "TESTE" do hero.title
UPDATE landing_pages
SET variables = jsonb_set(
  variables,
  '{hero,title}',
  '"Construa Autoridade e Atraia Clientes Qualificados Para Seu Escritório"'
)
WHERE slug = 'empresas/social-media-advogados';

-- REMOVER "TESTE" do problema.title
UPDATE landing_pages
SET variables = jsonb_set(
  variables,
  '{problema,title}',
  '"Por Que Advogados Precisam de Marketing Digital?"'
)
WHERE slug = 'empresas/social-media-advogados';
```

---

### Solução 2: Limpar Cache do Next.js (Local)
```bash
# No terminal do projeto
rm -rf .next
npm run build
npm run dev
```

---

### Solução 3: Revalidar Cache no Vercel
```bash
# Forçar revalidação da página
curl -X POST https://criadores.app/api/revalidate?path=/empresas/social-media-advogados
```

Ou criar arquivo `app/api/revalidate/route.ts`:
```typescript
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  
  if (path) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path });
  }
  
  return NextResponse.json({ revalidated: false });
}
```

---

### Solução 4: Forçar No-Cache na Página
```typescript
// app/empresas/social-media-advogados/page.tsx
export const revalidate = 0; // ← Adicionar esta linha

export default async function SocialMediaAdvogadosPage() {
  const lp = await landingPagesService.getLandingPageBySlug('empresas/social-media-advogados');
  // ...
}
```

---

## 📊 CHECKLIST DE DIAGNÓSTICO

Execute na ordem:

- [ ] **1. Execute Query 1** (ver tabela principal)
  - [ ] Tem "TESTE" no banco? → Limpar banco (Solução 1)
  - [ ] NÃO tem "TESTE"? → Problema de cache (Soluções 2, 3 ou 4)

- [ ] **2. Execute Query 2** (verificar duplicatas)
  - [ ] Tem duplicatas? → Deletar registro errado
  - [ ] Não tem? → Continuar

- [ ] **3. Limpar cache local**
  - [ ] `rm -rf .next`
  - [ ] `npm run build`
  - [ ] Testar em `localhost:3000`

- [ ] **4. Verificar deploy**
  - [ ] Ver último commit no Vercel
  - [ ] Deve ser `c94d849`
  - [ ] Se não, fazer redeploy

- [ ] **5. Adicionar revalidate = 0**
  - [ ] Adicionar na página
  - [ ] Commit e push
  - [ ] Aguardar deploy

---

## 🎯 AÇÃO IMEDIATA

**EXECUTE AGORA:**

1. **Query 1** na tabela `landing_pages` (NÃO `lp_versions`)
2. **Me envie o resultado** do campo `hero_title`
3. **Vou te dizer** qual solução aplicar

---

## 📝 OBSERVAÇÃO IMPORTANTE

Você mostrou dados da tabela `lp_versions` (histórico de versões).

**Precisamos ver a tabela `landing_pages`** (dados ativos que a aplicação usa).

A query correta é:
```sql
SELECT variables->'hero'->>'title' as hero_title
FROM landing_pages  -- ← ESTA TABELA
WHERE slug = 'empresas/social-media-advogados';
```

**NÃO:**
```sql
SELECT snapshot->'variables'->'hero'->>'title'
FROM lp_versions  -- ← NÃO ESTA
```

---

**EXECUTE A QUERY 1 AGORA E ME ENVIE O RESULTADO!** 🚀

