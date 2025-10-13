# 🧪 TESTE - Conexão com Banco de Dados

## ✅ O QUE FOI CRIADO

Acabei de criar a infraestrutura para conectar as LPs ao banco de dados:

### 📁 Arquivos Criados

1. **`lib/supabase/client.ts`**
   - Cliente Supabase para browser

2. **`lib/services/landingPagesService.ts`**
   - Serviço completo para buscar LPs do banco
   - Tipos TypeScript para todas as seções
   - Métodos: `getLandingPageBySlug()`, `getActiveLandingPages()`, `getLandingPageById()`

3. **`app/test-lp-db/page.tsx`**
   - Página de teste para validar conexão
   - Lista todas as 6 LPs do banco
   - Mostra detalhes de cada LP

---

## 🚀 COMO TESTAR

### 1️⃣ Acessar Página de Teste

Abra no navegador:
```
http://localhost:3000/test-lp-db
```

**✅ Deve mostrar:**
- Lista das 6 LPs do banco
- Clique em qualquer LP para ver detalhes
- Hero, Produtos, Soluções, FAQ, SEO

**❌ Se der erro:**
- Verifique se o servidor está rodando (`npm run dev`)
- Verifique as variáveis de ambiente (`.env.local`)

---

### 2️⃣ Verificar Variáveis de Ambiente

Certifique-se de que `.env.local` tem:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

**Como pegar as chaves:**
1. Acesse Supabase Dashboard
2. Vá em **Settings** → **API**
3. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 3️⃣ Testar no Console do Navegador

Abra o DevTools (F12) e execute:

```javascript
// Buscar LP /empresas
fetch('/api/test-lp?slug=empresas')
  .then(r => r.json())
  .then(console.log);
```

---

## 📊 O QUE VOCÊ DEVE VER

### ✅ Sucesso

Se tudo estiver funcionando, você verá:

```
✅ 6 Landing Pages Encontradas

1. LP Principal - Combo Empresas
   /empresas
   [combo] [active]

2. LP Mentoria - Gabriel D'Ávila
   /empresas/mentoria
   [produto-unico] [active]

3. LP Social Media - Estrategista Dedicado
   /empresas/social-media
   [produto-unico] [active]

... (mais 3 LPs)
```

Ao clicar em uma LP, você verá:
- ✅ Título do Hero
- ✅ Subtítulo
- ✅ CTA
- ✅ Produtos relacionados
- ✅ Soluções
- ✅ FAQ
- ✅ SEO

---

### ❌ Erros Comuns

#### Erro: "Failed to fetch"
**Causa:** Variáveis de ambiente não configuradas  
**Solução:**
1. Verifique `.env.local`
2. Reinicie o servidor (`npm run dev`)

#### Erro: "No rows returned"
**Causa:** LPs não foram inseridas no banco  
**Solução:**
1. Execute os seeds novamente
2. Verifique no Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM landing_pages WHERE status = 'active';
-- Deve retornar 6
```

#### Erro: "RLS policy violation"
**Causa:** Row Level Security bloqueando acesso  
**Solução:**
Execute no Supabase:
```sql
-- Permitir leitura pública de LPs ativas
CREATE POLICY "public_read_active_lps" ON landing_pages
  FOR SELECT
  USING (status = 'active' AND is_active = true);
```

---

## 🎯 PRÓXIMOS PASSOS

### Depois que o teste funcionar:

1. **Criar API Route** (opcional)
   - `/app/api/landing-pages/[slug]/route.ts`
   - Para SSR e cache

2. **Atualizar páginas existentes**
   - Substituir componentes hardcoded
   - Buscar do banco via `landingPagesService`

3. **Criar componente DynamicLP**
   - Renderiza LP baseado no JSON do banco
   - Reutilizável para todas as 6 LPs

---

## 🧪 TESTE MANUAL

Execute estes comandos no terminal para testar o serviço:

```bash
# 1. Abrir console Node.js
node

# 2. Testar conexão (copie e cole)
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'SUA_URL',
  'SUA_ANON_KEY'
);

supabase
  .from('landing_pages')
  .select('slug, name')
  .eq('status', 'active')
  .then(({ data, error }) => {
    if (error) console.error(error);
    else console.log('✅ LPs encontradas:', data);
  });
```

---

## 📝 CHECKLIST

Antes de continuar, confirme:

- [ ] Variáveis de ambiente configuradas
- [ ] Servidor rodando (`npm run dev`)
- [ ] Página `/test-lp-db` abre sem erro
- [ ] Lista mostra 6 LPs
- [ ] Ao clicar em uma LP, mostra detalhes
- [ ] Hero, Produtos, FAQ aparecem corretamente

---

## 🚀 QUANDO TUDO FUNCIONAR

Me avise e vou:
1. ✅ Criar componente `DynamicLP` para renderizar LPs
2. ✅ Atualizar `/empresas/page.tsx` para buscar do banco
3. ✅ Atualizar todas as 6 páginas
4. ✅ Garantir que SEO continua funcionando

---

**Acesse agora:** http://localhost:3000/test-lp-db

**Me diga o que aparece!** 🚀

