# 🔧 Solução - Sincronização entre auth.users e platform_users

## 🎯 Problema Identificado

Você tem **3 tabelas de usuários**:

1. **`auth.users`** (Supabase Auth) - Gerenciada automaticamente pelo Supabase
2. **`platform_users`** - Sua tabela customizada para usuários da plataforma externa (criadores.app)
3. **`users`** - Tabela para funcionários internos do CRM

### ❌ O Que Estava Acontecendo

1. ✅ Você envia convite via Supabase Auth
2. ✅ Supabase cria usuário em `auth.users` automaticamente
3. ✅ Usuário clica no link e acessa `/onboarding`
4. ✅ Usuário cria senha
5. ❌ **Senha era salva APENAS em `platform_users`**
6. ❌ **Senha NÃO era salva em `auth.users`**
7. ❌ Login falhava porque as senhas não estavam sincronizadas

### 🔍 Por Que Falhava

Quando você tenta fazer login, o sistema precisa validar a senha em **DOIS lugares**:

1. **Supabase Auth (`auth.users`)** - Para autenticação do Supabase
2. **Platform Users (`platform_users`)** - Para dados customizados da sua aplicação

Se a senha estiver apenas em um lugar, o login falha.

---

## ✅ Solução Implementada

### 1. **Atualizar Senha no Supabase Auth PRIMEIRO**

Agora, quando o usuário cria a senha no onboarding:

```typescript
// 1. PRIMEIRO: Atualizar senha no Supabase Auth (auth.users)
const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
});

const { data: authUpdateData, error: authUpdateError } = await userSupabase.auth.updateUser({
  password: password
});
```

Isso atualiza a senha em `auth.users` usando o `access_token` do convite.

### 2. **Depois, Salvar Hash em platform_users**

```typescript
// 2. SEGUNDO: Gerar hash bcrypt para salvar em platform_users
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Salvar em platform_users
await supabase
  .from('platform_users')
  .update({
    password_hash: passwordHash,
    email_verified: true,
    is_active: true,
    last_password_change: new Date().toISOString()
  })
  .eq('email', email.toLowerCase());
```

### 3. **Sincronizar IDs**

Garantir que o `id` em `platform_users` seja o **MESMO** que o `id` em `auth.users`:

```typescript
const newUserData: any = {
  id: authUpdateData?.user?.id, // Usar o mesmo ID do auth.users
  organization_id: DEFAULT_ORG_ID,
  email: email.toLowerCase(),
  // ... outros campos
};
```

---

## 🔄 Fluxo Completo Agora

### Passo 1: Enviar Convite

```sql
-- Você executa (ou via função)
SELECT invite_user_to_platform(
  'connectcityops@gmail.com',
  'Luiz Vincenzi',
  '3cb07c8b-70d8-4273-868a-1ed38d6d7da1', -- business_id
  'business_owner'
);
```

**O que acontece:**
- ✅ Cria usuário em `auth.users` (Supabase Auth)
- ✅ Cria usuário em `platform_users` (sua tabela)
- ✅ Envia email com link de convite

### Passo 2: Usuário Clica no Link

```
https://www.criadores.app/login#access_token=...&type=invite
```

**O que acontece:**
- ✅ Detecta `type=invite`
- ✅ Redireciona para `/onboarding`
- ✅ Extrai dados do JWT (email, nome, business_id)

### Passo 3: Usuário Cria Senha

**O que acontece:**
- ✅ Chama `/api/platform/auth/set-password`
- ✅ **Atualiza senha em `auth.users`** (Supabase Auth)
- ✅ **Salva hash em `platform_users`** (sua tabela)
- ✅ **Sincroniza IDs** entre as duas tabelas
- ✅ Ativa usuário (`is_active: true`)
- ✅ Marca email como verificado (`email_verified: true`)

### Passo 4: Login Automático

**O que acontece:**
- ✅ Chama `/api/platform/auth/login`
- ✅ Busca usuário em `platform_users`
- ✅ Valida senha com bcrypt
- ✅ Retorna dados do usuário
- ✅ Redireciona para `/dashboard`

---

## 🧪 Como Testar

### Teste 1: Criar Novo Usuário

1. **Enviar convite** (via SQL ou função)
2. **Verificar email** e copiar link
3. **Acessar link** no navegador
4. **Criar senha** (ex: `1#Aconchego`)
5. **Verificar logs** no console:

```
✅ [Set Password] Senha atualizada no Supabase Auth
📋 [Set Password] Auth user ID: 4f4e9643-33a9-4823-95cb-25f7056a6cbe
✅ [Set Password] Hash gerado com sucesso
✅ [Set Password] Senha atualizada com sucesso
✅ [Onboarding] Login automático realizado
```

6. **Verificar redirecionamento** para `/dashboard`

### Teste 2: Verificar Sincronização

Execute no **Supabase SQL Editor**:

```sql
-- Verificar auth.users
SELECT id, email, created_at, updated_at
FROM auth.users
WHERE email = 'connectcityops@gmail.com';

-- Verificar platform_users
SELECT id, email, is_active, email_verified, LENGTH(password_hash) as hash_length
FROM platform_users
WHERE email = 'connectcityops@gmail.com';
```

**Resultado esperado:**
- ✅ **IDs são iguais** em ambas as tabelas
- ✅ `hash_length: 60` em `platform_users`
- ✅ `is_active: true`
- ✅ `email_verified: true`

### Teste 3: Login Manual

1. Vá em `https://criadores.app/login`
2. Email: `connectcityops@gmail.com`
3. Senha: `1#Aconchego`
4. ✅ **Deve funcionar!**

---

## 📊 Comparação: Antes vs Depois

### ❌ Antes

| Ação | auth.users | platform_users |
|------|-----------|----------------|
| Enviar convite | ✅ Criado | ✅ Criado |
| Criar senha | ❌ Não atualizado | ✅ Hash salvo |
| Login | ❌ Senha não existe | ✅ Hash existe |
| **Resultado** | **❌ FALHA** | **❌ FALHA** |

### ✅ Depois

| Ação | auth.users | platform_users |
|------|-----------|----------------|
| Enviar convite | ✅ Criado | ✅ Criado |
| Criar senha | ✅ Senha atualizada | ✅ Hash salvo |
| Login | ✅ Senha existe | ✅ Hash existe |
| **Resultado** | **✅ SUCESSO** | **✅ SUCESSO** |

---

## 🔐 Segurança

### Duas Camadas de Autenticação

1. **Supabase Auth (`auth.users`)**
   - Gerencia sessões
   - Tokens JWT
   - Refresh tokens
   - Email verification

2. **Platform Users (`platform_users`)**
   - Dados customizados
   - Permissões granulares
   - Roles e roles
   - Business associations

### Por Que Duas Senhas?

- **`auth.users`**: Senha em texto claro (gerenciada pelo Supabase)
- **`platform_users`**: Hash bcrypt (para validação adicional)

Isso permite:
- ✅ Usar autenticação do Supabase (sessões, tokens)
- ✅ Ter controle adicional sobre permissões
- ✅ Validar senha localmente se necessário
- ✅ Migrar para outro sistema no futuro

---

## 🚀 Próximos Passos

### Passo 1: Fazer Commit e Push

```bash
git add .
git commit -m "fix: sincronizar senha entre auth.users e platform_users"
git push origin main
```

### Passo 2: Aguardar Deploy

Aguarde o deploy automático completar.

### Passo 3: Testar com Usuário Real

1. Envie um novo convite
2. Acesse o link
3. Crie senha
4. Verifique se login funciona

### Passo 4: Verificar Logs

Procure por:

```
✅ [Set Password] Senha atualizada no Supabase Auth
📋 [Set Password] Auth user ID: ...
✅ [Set Password] Hash gerado com sucesso
✅ [Platform] Usuário encontrado
✅ [Platform] Login realizado com sucesso
```

---

## 🐛 Troubleshooting

### Se continuar falhando

#### Erro: "Erro ao atualizar senha no sistema de autenticação"

**Causa:** Access token inválido ou expirado

**Solução:**
1. Gere um novo convite
2. Use o link imediatamente (expira em 1 hora)

#### Erro: "IDs diferentes"

**Causa:** Usuário foi criado manualmente em `platform_users` com ID diferente

**Solução:**
```sql
-- Deletar usuário de platform_users
DELETE FROM platform_users WHERE email = 'email@exemplo.com';

-- Enviar novo convite (vai criar com ID correto)
```

#### Erro: "Usuário não encontrado"

**Causa:** Usuário não existe em `platform_users`

**Solução:**
```sql
-- Verificar se existe em auth.users
SELECT * FROM auth.users WHERE email = 'email@exemplo.com';

-- Se existir, criar em platform_users com mesmo ID
INSERT INTO platform_users (id, email, ...) VALUES (...);
```

---

## 📝 Arquivos Modificados

1. ✅ `app/api/platform/auth/set-password/route.ts`
   - Atualiza senha no Supabase Auth
   - Sincroniza IDs
   - Logs detalhados

2. ✅ `app/api/platform/auth/login/route.ts`
   - Logs detalhados
   - `success: false` explícito

3. ✅ `app/onboarding/page.tsx`
   - Já estava correto

---

## ✅ Checklist

- [ ] Commit e push das alterações
- [ ] Deploy completado
- [ ] Testou criar senha
- [ ] Verificou logs no console
- [ ] Login automático funcionou
- [ ] Verificou sincronização de IDs
- [ ] Testou login manual

---

**Faça o commit e push agora e teste!** 🚀

