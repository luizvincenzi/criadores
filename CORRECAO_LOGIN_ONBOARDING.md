# 🔧 Correção - Login após Onboarding

## 📊 Diagnóstico

Baseado nos dados fornecidos:

### ✅ Senha foi salva corretamente no banco
```
email: connectcityops@gmail.com
has_password: true
hash_length: 60  ← Correto (bcrypt sempre tem 60 caracteres)
is_active: true
email_verified: true
```

### ❌ Login está falhando com 401
```
POST /api/platform/auth/login 401 (Unauthorized)
⚠️ [crIAdores] Não encontrado em platform_users, tentando users...
```

---

## 🔍 Problema Identificado

O erro `⚠️ [crIAdores] Não encontrado em platform_users` indica que:

1. A API `/api/platform/auth/login` está retornando 401
2. O `authStore` interpreta isso como "usuário não encontrado"
3. Tenta fallback para `/api/supabase/auth/login` (tabela `users`)
4. Também falha porque o usuário está em `platform_users`, não em `users`

**Possíveis causas:**

### Causa 1: Logs do servidor não estão aparecendo
Os logs detalhados que adicionei (`✅ [Platform] Usuário encontrado`, `🔐 [Platform] Validando senha com bcrypt`) **não aparecem no console**.

Isso significa que **o código em produção ainda é o antigo**, sem os logs.

### Causa 2: API está falhando antes de validar senha
A API pode estar falhando na query do Supabase por algum motivo:
- RLS policy bloqueando SELECT
- Erro na query (join com `organizations`)
- Timeout

### Causa 3: Senha não está sendo validada corretamente
O bcrypt pode estar falhando na comparação, mas sem os logs não podemos confirmar.

---

## ✅ Correções Implementadas

### 1. Adicionado `success: false` em todas as respostas de erro

**Antes:**
```typescript
return NextResponse.json(
  { error: 'Email ou senha incorretos' },
  { status: 401 }
);
```

**Depois:**
```typescript
return NextResponse.json(
  { success: false, error: 'Email ou senha incorretos' },
  { status: 401 }
);
```

Isso garante que o `authStore` sempre receba `success: false` explicitamente.

### 2. Logs detalhados adicionados

**Na API de login (`/api/platform/auth/login`):**
- ✅ Log quando usuário é encontrado
- ✅ Log do hash (comprimento e existência)
- ✅ Log detalhado da validação bcrypt
- ✅ Log de erros do Supabase

**Na API de set-password (`/api/platform/auth/set-password`):**
- ✅ Log do hash gerado
- ✅ Teste de verificação imediata do hash
- ✅ Log após salvar no banco
- ✅ Verificação pós-update

---

## 🚀 Próximos Passos

### Passo 1: Fazer Commit e Push

```bash
git add .
git commit -m "fix: adicionar logs detalhados e success:false nas APIs de auth"
git push origin main
```

### Passo 2: Aguardar Deploy

Aguarde o deploy automático (Vercel/Netlify) completar.

### Passo 3: Testar Novamente

1. Gere um novo convite para o mesmo usuário (ou outro)
2. Acesse o link do convite
3. Crie uma senha (anote qual senha você usou!)
4. **Abra o Console do navegador (F12 → Console)**
5. Observe os logs

### Passo 4: Verificar Logs

Procure por estes logs no console:

**Logs esperados de sucesso:**
```
🔐 [Set Password] Iniciando criação de senha para: connectcityops@gmail.com
✅ [Set Password] Hash gerado com sucesso
🔐 [Set Password] Hash length: 60
🧪 [Set Password] Teste de verificação imediata: ✅ OK
✅ [Set Password] Senha atualizada com sucesso
🔍 [Set Password] Verificação pós-update: { has_hash: true, hash_length: 60 }
✅ [Onboarding] Senha criada com sucesso

🔐 [Platform] Tentativa de login para: connectcityops@gmail.com
✅ [Platform] Usuário encontrado: { has_password_hash: true, hash_length: 60 }
🔐 [Platform] Validando senha com bcrypt para: connectcityops@gmail.com
✅ [Platform] Validação de senha com bcrypt para usuário: connectcityops@gmail.com
✅ [Platform] Login realizado com sucesso
```

**Se aparecer erro:**
```
❌ [Platform] Usuário não encontrado
❌ [Platform] Erro do Supabase: { ... }
```
OU
```
❌ [Platform] Senha incorreta para: connectcityops@gmail.com
❌ [Platform] Senha fornecida não corresponde ao hash armazenado
```

---

## 🐛 Troubleshooting Adicional

### Se continuar falhando após deploy

#### Teste 1: Verificar se a query do Supabase funciona

Execute no **Supabase SQL Editor**:

```sql
SELECT 
  *,
  organizations.name as org_name
FROM platform_users
LEFT JOIN organizations ON platform_users.organization_id = organizations.id
WHERE platform_users.email = 'connectcityops@gmail.com'
  AND platform_users.organization_id = '00000000-0000-0000-0000-000000000001'
  AND platform_users.is_active = true;
```

**Se retornar vazio:**
- Problema na query ou nos filtros
- Verificar `organization_id` e `is_active`

**Se retornar dados:**
- Query está OK
- Problema pode ser RLS policy

#### Teste 2: Verificar RLS Policies

```sql
-- Verificar policies da tabela platform_users
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'platform_users';
```

**Se houver policy restritiva para SELECT:**

```sql
-- Criar policy permissiva (temporário para debug)
CREATE POLICY "Allow all SELECT for debugging"
ON platform_users
FOR SELECT
USING (true);
```

⚠️ **ATENÇÃO:** Remova essa policy após identificar o problema!

#### Teste 3: Testar bcrypt manualmente

Execute no terminal:

```bash
npx ts-node scripts/test-bcrypt.ts
```

**Resultado esperado:**
```
✅ Verificação: PASSOU
```

**Se falhar:**
```bash
npm install bcryptjs @types/bcryptjs
```

#### Teste 4: Resetar senha manualmente

Se nada funcionar, resete a senha manualmente no banco:

```bash
# Gerar hash da senha "1#Aconchego"
npx ts-node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('1#Aconchego', 12).then(console.log)"
```

Copie o hash gerado e execute:

```sql
UPDATE platform_users
SET 
  password_hash = 'HASH_GERADO_AQUI',
  email_verified = true,
  is_active = true,
  updated_at = NOW()
WHERE email = 'connectcityops@gmail.com';
```

Depois tente fazer login manual.

---

## 📋 Checklist

- [ ] Commit e push das alterações
- [ ] Deploy completado
- [ ] Testou criar senha novamente
- [ ] Verificou logs no console
- [ ] Login automático funcionou?
  - [ ] SIM → ✅ Problema resolvido!
  - [ ] NÃO → Continue para troubleshooting

---

## 📝 Arquivos Modificados

1. ✅ `app/api/platform/auth/login/route.ts`
   - Adicionado `success: false` em erros
   - Adicionados logs detalhados

2. ✅ `app/api/platform/auth/set-password/route.ts`
   - Adicionado `success: false` em erros
   - Adicionados logs detalhados
   - Teste de verificação imediata

3. ✅ `app/onboarding/page.tsx`
   - Já estava correto (usuário adicionou Suspense)

4. ✅ `app/login/page.tsx`
   - Detecção de convite já implementada

---

## 🎯 Resultado Esperado

Após fazer commit e push:

1. ✅ Usuário acessa link de convite
2. ✅ Cria senha no `/onboarding`
3. ✅ Senha é salva com hash bcrypt
4. ✅ Login automático funciona
5. ✅ Redireciona para `/dashboard`
6. ✅ Usuário está logado com permissões corretas

---

## 📞 Se Precisar de Ajuda

Envie:

1. **Logs completos do console** (após deploy)
2. **Resultado do SQL de verificação**
3. **Mensagem de erro específica**

Com essas informações, podemos identificar exatamente o problema!

---

**Faça o commit e push agora e teste novamente!** 🚀

