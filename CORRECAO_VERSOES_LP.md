# ✅ CORREÇÃO - SISTEMA DE VERSÕES DAS LPs

## 🎯 PROBLEMA IDENTIFICADO

O sistema estava buscando dados da tabela `landing_pages` (desatualizada), mas deveria buscar da **última versão** em `lp_versions`.

---

## ❌ ANTES (ERRADO)

```typescript
// Buscava da tabela principal (dados antigos)
const { data: lp } = await supabase
  .from('landing_pages')  // ❌ Tabela desatualizada
  .select('*')
  .eq('slug', slug)
  .single();
```

**Resultado:**
- ❌ Mostrava dados antigos
- ❌ Ignorava edições feitas no banco
- ❌ Não respeitava versionamento

---

## ✅ DEPOIS (CORRETO)

```typescript
// 1. Busca LP básica (ID, slug, status)
const { data: lpBasic } = await supabase
  .from('landing_pages')
  .select('id, slug, name, category, status')
  .eq('slug', slug)
  .single();

// 2. Busca ÚLTIMA VERSÃO (dados atualizados)
const { data: latestVersion } = await supabase
  .from('lp_versions')  // ✅ Tabela de versões
  .select('snapshot, version_number')
  .eq('lp_id', lpBasic.id)
  .order('version_number', { ascending: false })  // ✅ Mais recente primeiro
  .limit(1)
  .single();

// 3. Monta LP com dados da última versão
const lp = {
  ...lpBasic,
  ...latestVersion.snapshot,  // ✅ Dados atualizados
};
```

**Resultado:**
- ✅ Sempre mostra última versão
- ✅ Respeita edições no banco
- ✅ Sistema de versionamento funcional

---

## 📊 ARQUITETURA DE DADOS

### Tabela `landing_pages` (Metadados)
```
id, slug, name, category, status, is_active
```
**Função:** Armazenar metadados básicos e imutáveis

### Tabela `lp_versions` (Conteúdo Versionado)
```
id, lp_id, snapshot (JSONB), version_number, created_at
```
**Função:** Armazenar histórico completo de versões

### Fluxo de Dados
```
1. User acessa /empresas/social-media-advogados
   ↓
2. landingPagesService.getLandingPageBySlug('empresas/social-media-advogados')
   ↓
3. Busca metadados em landing_pages (id, slug, status)
   ↓
4. Busca última versão em lp_versions (ORDER BY version_number DESC LIMIT 1)
   ↓
5. Monta LP = metadados + snapshot da última versão
   ↓
6. DynamicLP renderiza com dados atualizados
```

---

## 🔍 EXEMPLO PRÁTICO

### Cenário: LP de Advogados com 5 Versões

**Tabela `landing_pages`:**
```
id: 20000000-0000-0000-0000-000000000006
slug: empresas/social-media-advogados
name: LP Social Media para Advogados
status: active
```

**Tabela `lp_versions`:**
```
version 1: hero.title = "Marketing Jurídico"
version 2: hero.title = "Advogados Online"
version 3: hero.title = "Construa Autoridade..."
version 4: hero.title = "TESTE Construa Autoridade..."  ← ÚLTIMA
version 5: (futura)
```

**Antes da correção:**
- Sistema buscava de `landing_pages`
- Mostrava: "Marketing Jurídico" (versão antiga)

**Depois da correção:**
- Sistema busca de `lp_versions` ORDER BY version_number DESC LIMIT 1
- Mostra: "TESTE Construa Autoridade..." (versão 4 - última)

---

## 🧪 COMO TESTAR

### 1. Verificar Versões no Banco
```sql
-- Ver todas as versões de uma LP
SELECT 
  version_number,
  snapshot->'hero'->>'title' as hero_title,
  created_at
FROM lp_versions
WHERE lp_id = '20000000-0000-0000-0000-000000000006'
ORDER BY version_number DESC;
```

### 2. Testar Localmente
```bash
# Limpar cache
rm -rf .next

# Rodar dev
npm run dev

# Acessar
http://localhost:3000/empresas/social-media-advogados
```

### 3. Verificar Console
Deve aparecer:
```
✅ Usando versão 4 da LP empresas/social-media-advogados
```

### 4. Verificar Página
O título do Hero deve ser **exatamente** o que está na versão 4 do banco.

---

## 📝 FALLBACK

Se não houver versões em `lp_versions`, o sistema faz fallback para `landing_pages`:

```typescript
if (versionError || !latestVersion) {
  console.warn('⚠️ Nenhuma versão encontrada, usando dados da tabela principal');
  // Busca de landing_pages como antes
}
```

**Quando acontece:**
- LP recém-criada sem versões
- Erro ao buscar versões
- Tabela lp_versions vazia

---

## 🚀 BENEFÍCIOS

### 1. Versionamento Real
- ✅ Histórico completo de mudanças
- ✅ Possibilidade de rollback
- ✅ Auditoria de alterações

### 2. Edição Dinâmica
- ✅ Editar LP direto no Supabase
- ✅ Mudanças aparecem imediatamente
- ✅ Sem precisar fazer deploy

### 3. A/B Testing (Futuro)
- ✅ Testar versões diferentes
- ✅ Comparar performance
- ✅ Escolher melhor versão

---

## 🔧 ARQUIVOS MODIFICADOS

### `lib/services/landingPagesService.ts`
- ✅ `getLandingPageBySlug()` - Busca última versão
- ✅ `getLandingPageById()` - Busca última versão
- ✅ `getActiveLandingPages()` - Mantido (lista básica)

---

## 📊 IMPACTO

### Antes
```
landing_pages (tabela principal)
  ↓
DynamicLP (renderiza dados antigos)
```

### Depois
```
landing_pages (metadados) + lp_versions (última versão)
  ↓
DynamicLP (renderiza dados atualizados)
```

---

## 🎯 PRÓXIMOS PASSOS

### 1. Testar Localmente
```bash
rm -rf .next
npm run dev
```

### 2. Verificar Todas as 6 LPs
- [ ] /empresas
- [ ] /empresas/mentoria
- [ ] /empresas/social-media
- [ ] /empresas/criadores
- [ ] /empresas/social-media-medicos
- [ ] /empresas/social-media-advogados

### 3. Commit e Push
```bash
git add lib/services/landingPagesService.ts
git commit -m "fix: Buscar LPs da última versão em lp_versions"
git push origin main
```

### 4. Aguardar Deploy
- Vercel fará deploy automático
- Aguardar 2-3 minutos

### 5. Testar em Produção
- Acessar cada LP
- Verificar que mostra dados da última versão

---

## ✅ CONCLUSÃO

Agora o sistema:
- ✅ Busca **sempre** da última versão em `lp_versions`
- ✅ Respeita edições feitas no banco
- ✅ Permite versionamento e rollback
- ✅ Mostra dados atualizados sem precisar fazer deploy

---

**TESTE AGORA:**
```bash
rm -rf .next && npm run dev
```

Acesse: http://localhost:3000/empresas/social-media-advogados

**Deve mostrar EXATAMENTE o que está na versão 4 do banco!** 🚀

