# ⚠️ PROBLEMA: Slug da LP sendo alterado

## 🐛 PROBLEMA IDENTIFICADO

**Sintoma:**
- LP funciona por alguns minutos
- Depois volta a dar erro 404
- Slug no banco muda de `empresas/social-media-advogados` para `social-media-advogados`

**Causa:**
- Quando você edita a LP no **criadores.digital** e publica
- O sistema está salvando o slug SEM o prefixo `empresas/`
- Isso sobrescreve o slug correto no banco

---

## 🔍 EVIDÊNCIAS

### Logs do Servidor:

```
✅ Usando versão 21 - GET /empresas/social-media-advogados 200 ✅
✅ Usando versão 22 - GET /empresas/social-media-advogados 200 ✅
✅ Usando versão 23 - GET /empresas/social-media-advogados 200 ✅
❌ Error fetching landing page - GET /empresas/social-media-advogados 404 ❌
```

**O que aconteceu:**
1. Versões 21, 22, 23 funcionaram (slug estava correto)
2. Você editou a LP no criadores.digital
3. Sistema salvou slug como `social-media-advogados` (sem `empresas/`)
4. Página parou de funcionar

---

## ✅ SOLUÇÃO TEMPORÁRIA

Execute o script para corrigir o slug:

```bash
npx tsx scripts/fix-lp-slug.ts
```

**Isso corrige o slug no banco de dados.**

---

## 🔧 SOLUÇÃO PERMANENTE

### Precisamos corrigir o criadores.digital

**O problema está em um destes lugares:**

1. **Formulário de criação/edição de LP**
   - Campo de slug pode estar sem o prefixo `empresas/`
   - Ou está removendo o prefixo ao salvar

2. **Função de salvar LP**
   - Pode estar fazendo `slug.replace('empresas/', '')` 
   - Ou salvando apenas o último segmento do slug

3. **Seed/Migration inicial**
   - LP foi criada com slug errado
   - Toda vez que você "publica", volta para o valor inicial

---

## 🎯 PRÓXIMOS PASSOS

### 1. Verificar criadores.digital

**Perguntas para investigar:**

1. Quando você cria/edita uma LP no criadores.digital, qual é o valor do campo "slug"?
   - Mostra `social-media-advogados`?
   - Ou mostra `empresas/social-media-advogados`?

2. Quando você clica em "Publicar", o que acontece?
   - Cria apenas uma nova versão em `lp_versions`?
   - Ou também atualiza a tabela `landing_pages`?

3. Existe algum código que manipula o slug antes de salvar?
   - Procure por: `slug.replace()`, `slug.split()`, `slug.substring()`

---

### 2. Opções de Correção

#### Opção A: Corrigir o criadores.digital

**Vantagem:** Solução definitiva  
**Desvantagem:** Precisa acessar código do criadores.digital

**O que fazer:**
1. Encontrar onde o slug é salvo
2. Garantir que sempre salva com prefixo `empresas/`
3. Ou criar um campo separado para categoria + slug

---

#### Opção B: Criar trigger no Supabase

**Vantagem:** Funciona independente do criadores.digital  
**Desvantagem:** Gambiarra, não resolve a causa raiz

**SQL:**
```sql
CREATE OR REPLACE FUNCTION fix_lp_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Se slug não começa com 'empresas/' e category é 'empresas'
  IF NEW.category = 'empresas' AND NEW.slug NOT LIKE 'empresas/%' THEN
    NEW.slug := 'empresas/' || NEW.slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fix_lp_slug_trigger
BEFORE INSERT OR UPDATE ON landing_pages
FOR EACH ROW
EXECUTE FUNCTION fix_lp_slug();
```

---

#### Opção C: Adaptar criadores.app para aceitar ambos

**Vantagem:** Funciona com qualquer slug  
**Desvantagem:** Não resolve o problema, apenas contorna

**Código:**
```typescript
async getLandingPageBySlug(slug: string): Promise<LandingPageWithProducts | null> {
  // Tentar buscar com slug exato
  let { data: lpBasic } = await this.supabase
    .from('landing_pages')
    .select('...')
    .eq('slug', slug)
    .single();

  // Se não encontrou, tentar sem o prefixo 'empresas/'
  if (!lpBasic && slug.startsWith('empresas/')) {
    const slugWithoutPrefix = slug.replace('empresas/', '');
    const { data } = await this.supabase
      .from('landing_pages')
      .select('...')
      .eq('slug', slugWithoutPrefix)
      .single();
    lpBasic = data;
  }

  // ... resto do código
}
```

---

## 🚨 RECOMENDAÇÃO

**Melhor solução:** **Opção A + Opção B**

1. **Corrigir criadores.digital** (solução definitiva)
2. **Criar trigger no Supabase** (proteção extra)

**Por que:**
- Opção A resolve a causa raiz
- Opção B garante que mesmo se alguém editar direto no banco, o slug fica correto
- Opção C é gambiarra e pode causar confusão no futuro

---

## 📋 CHECKLIST

- [ ] Investigar criadores.digital
  - [ ] Verificar formulário de LP
  - [ ] Verificar função de salvar
  - [ ] Procurar manipulação de slug
- [ ] Implementar correção no criadores.digital
- [ ] Criar trigger no Supabase (proteção extra)
- [ ] Testar criação de nova LP
- [ ] Testar edição de LP existente
- [ ] Verificar se slug permanece correto após publicar

---

## 🔍 COMO INVESTIGAR

### 1. Verificar o que está sendo salvo

Execute este SQL no Supabase:

```sql
-- Ver histórico de mudanças no slug
SELECT 
  id,
  slug,
  updated_at,
  updated_by
FROM landing_pages 
WHERE id = '20000000-0000-0000-0000-000000000006'
ORDER BY updated_at DESC;
```

### 2. Verificar versões criadas

```sql
-- Ver quando cada versão foi criada
SELECT 
  version_number,
  created_at,
  snapshot->'variables'->'hero'->>'title' as titulo
FROM lp_versions 
WHERE lp_id = '20000000-0000-0000-0000-000000000006'
ORDER BY version_number DESC
LIMIT 10;
```

### 3. Correlacionar mudanças

Se você criou versão 24 às 13:35:30 e o slug mudou às 13:35:30, então o problema é na função de publicar.

---

## 💡 DICA

**Para testar sem quebrar:**

1. Crie uma LP de teste no criadores.digital
2. Use slug: `empresas/teste-slug`
3. Publique
4. Verifique no banco se o slug ficou correto
5. Se ficou errado, você sabe onde está o problema

---

**Precisa de ajuda para investigar o criadores.digital? Me avise!**

