# 🔧 Troubleshooting - business_content_social

## ❌ Erro: "relation \"public.business_content_social\" does not exist"

### **Causa:**
A tabela foi criada no Supabase mas o cache não atualizou, ou há um problema de schema.

### **Soluções:**

#### **Solução 1: Verificar se a tabela existe** ✅

1. Abrir Supabase Dashboard
2. Ir em **SQL Editor**
3. Executar: `supabase/VERIFICAR_TABELA.sql`
4. Verificar resultado:
   - ✅ Se mostrar "✅ EXISTE" → Tabela está OK
   - ❌ Se mostrar "❌ NÃO EXISTE" → Ir para Solução 2

#### **Solução 2: Forçar criação da tabela** 🔨

1. Abrir Supabase Dashboard
2. Ir em **SQL Editor**
3. Executar: `supabase/FORCE_CREATE_TABLE.sql`
4. Verificar mensagem de sucesso
5. Aguardar 10 segundos
6. Recarregar página no navegador

#### **Solução 3: Limpar cache do Supabase** 🔄

1. No Supabase Dashboard, ir em **Settings** → **API**
2. Copiar a **URL** e **anon key**
3. Verificar se são as mesmas do `.env.local`
4. Se diferentes, atualizar `.env.local`
5. Reiniciar servidor Next.js:
   ```bash
   # Parar servidor (Ctrl+C)
   npm run dev
   ```

#### **Solução 4: Verificar schema** 📋

Execute no Supabase SQL Editor:

```sql
-- Ver em qual schema a tabela está
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE tablename LIKE '%business_content%';

-- Se estiver em outro schema, mover para public
ALTER TABLE IF EXISTS business_content_social SET SCHEMA public;
```

#### **Solução 5: Recriar tabela do zero** 🔥

**⚠️ CUIDADO: Isso vai deletar todos os dados!**

```sql
-- 1. Dropar tabela
DROP TABLE IF EXISTS business_content_social CASCADE;

-- 2. Executar migration completa
-- Copiar e colar: supabase/migrations/031_EXECUTAR_NO_SUPABASE.sql
```

---

## ❌ Erro: "TypeError: onAddContent is not a function"

### **Causa:**
Interface do componente estava incorreta.

### **Solução:**
✅ **JÁ CORRIGIDO** no commit `d7947fc`

Se ainda aparecer:
1. Limpar cache do navegador (Ctrl+Shift+R)
2. Reiniciar servidor Next.js
3. Verificar se está na branch `main` atualizada

---

## ❌ Erro: "Cannot read properties of undefined (reading 'total')"

### **Causa:**
`ContentStatsWidget` esperava objeto `stats` mas recebia array `contents`.

### **Solução:**
✅ **JÁ CORRIGIDO** no commit `db5c976`

---

## ❌ Erro: "invalid input value for enum platform_user_role: 'admin'"

### **Causa:**
RLS policies usavam `admin` e `manager` que não existem em `platform_user_role`.

### **Solução:**
✅ **JÁ CORRIGIDO** no commit `9fa14b4`

---

## 🔍 Como Verificar se Está Tudo OK

### **1. Verificar Tabela no Supabase**

```sql
-- Deve retornar 1 linha
SELECT COUNT(*) FROM business_content_social;

-- Deve retornar 6 policies
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'business_content_social';
```

### **2. Verificar API**

Abrir no navegador:
```
http://localhost:3000/api/business-content?business_id=test
```

Deve retornar:
```json
{
  "success": true,
  "contents": []
}
```

### **3. Verificar Página**

1. Login como Pietra:
   ```
   Email: pietramantovani98@gmail.com
   Senha: 2#Todoscria
   ```

2. Acessar: `http://localhost:3000/conteudo-estrategista`

3. Verificar:
   - ✅ Página carrega sem erros
   - ✅ Mostra "Conteúdo - Boussolé"
   - ✅ Calendário aparece vazio
   - ✅ Pode clicar em "Novo Conteúdo"

---

## 🚨 Problemas Comuns

### **Problema: Página em branco**

**Solução:**
1. Abrir DevTools (F12)
2. Ver console de erros
3. Procurar erro específico neste documento

### **Problema: "Unauthorized" ou "403"**

**Solução:**
1. Verificar se está logado
2. Verificar se usuário tem role correto
3. Verificar RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'business_content_social';
   ```

### **Problema: Conteúdo não aparece**

**Solução:**
1. Verificar se `business_id` está correto
2. Verificar se RLS permite acesso:
   ```sql
   -- Como Pietra, deve retornar conteúdo do Boussolé
   SELECT * FROM business_content_social 
   WHERE business_id = 'ID_DO_BOUSSOLE';
   ```

### **Problema: Não consegue criar conteúdo**

**Solução:**
1. Verificar console do navegador
2. Verificar se API retorna erro
3. Verificar se `business_id` e `strategist_id` estão sendo passados:
   ```typescript
   // No console do navegador
   console.log('businessId:', businessId);
   console.log('strategistId:', strategistId);
   ```

---

## 📞 Checklist de Debug

Quando algo não funcionar, siga esta ordem:

- [ ] 1. Verificar se tabela existe no Supabase
- [ ] 2. Verificar se RLS está habilitado
- [ ] 3. Verificar se 6 policies existem
- [ ] 4. Verificar se API `/api/business-content` responde
- [ ] 5. Verificar console do navegador (F12)
- [ ] 6. Verificar se está logado como Pietra
- [ ] 7. Verificar se Pietra está relacionada ao Boussolé
- [ ] 8. Limpar cache do navegador
- [ ] 9. Reiniciar servidor Next.js
- [ ] 10. Executar `VERIFICAR_TABELA.sql` no Supabase

---

## 🔄 Reset Completo (Último Recurso)

Se nada funcionar:

```bash
# 1. Parar servidor
Ctrl+C

# 2. Limpar cache do Next.js
rm -rf .next

# 3. Reinstalar dependências
npm install

# 4. No Supabase, dropar e recriar tabela
DROP TABLE IF EXISTS business_content_social CASCADE;
-- Depois executar: 031_EXECUTAR_NO_SUPABASE.sql

# 5. Reiniciar servidor
npm run dev

# 6. Limpar cache do navegador
Ctrl+Shift+R
```

---

## ✅ Tudo Funcionando?

Se tudo estiver OK, você deve conseguir:

1. ✅ Fazer login como Pietra
2. ✅ Acessar `/conteudo-estrategista`
3. ✅ Ver "Conteúdo - Boussolé"
4. ✅ Clicar em "Novo Conteúdo"
5. ✅ Preencher formulário
6. ✅ Salvar conteúdo
7. ✅ Ver conteúdo no calendário
8. ✅ Editar conteúdo
9. ✅ Deletar conteúdo

---

**Se ainda tiver problemas, me avise qual erro específico está aparecendo!** 🚀

