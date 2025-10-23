# 🎯 Fluxo de Onboarding - Business Owner

## 📋 Visão Geral

Sistema completo de onboarding para **business_owner** que recebe convite por email do Supabase Auth e cria sua senha para acessar a plataforma.

---

## 🔄 Fluxo Completo

### 1️⃣ **Liberação de Acesso (Admin)**

Quando um business_owner é liberado para acessar a plataforma:

```typescript
// No Supabase Dashboard → Authentication → Users → Invite User
// OU via função do Supabase
```

**Dados enviados no convite:**
- `email`: Email do business_owner
- `user_metadata`:
  - `full_name`: Nome completo
  - `business_name`: Nome da empresa
  - `business_id`: UUID da empresa
  - `role`: `"business_owner"`
  - `entity_type`: `"business"`

---

### 2️⃣ **Email de Convite**

O Supabase envia um email com link no formato:

```
https://www.criadores.app/login#access_token=eyJhbGc...&expires_at=1761241939&expires_in=3600&refresh_token=afi5nfib5sil&token_type=bearer&type=invite
```

**Parâmetros importantes:**
- `access_token`: JWT com dados do usuário
- `refresh_token`: Token para renovação
- `type=invite`: Indica que é um convite
- `expires_in`: Tempo de expiração (segundos)

---

### 3️⃣ **Detecção do Convite**

Quando o usuário clica no link:

1. **`/login` detecta `type=invite`** no hash fragment
2. **Redireciona automaticamente** para `/onboarding`
3. **Preserva o hash** com todos os tokens

<augment_code_snippet path="app/login/page.tsx" mode="EXCERPT">
````typescript
// Detectar convite e redirecionar para onboarding
useEffect(() => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const tokenType = params.get('type');

  if (tokenType === 'invite') {
    console.log('🎉 [Login] Convite detectado, redirecionando para onboarding');
    router.push(`/onboarding${window.location.hash}`);
    return;
  }
}, [router]);
````
</augment_code_snippet>

---

### 4️⃣ **Página de Onboarding**

**Arquivo:** `app/onboarding/page.tsx`

**Funcionalidades:**

1. **Extrai dados do hash fragment:**
   - `access_token`
   - `refresh_token`
   - `type`
   - `expires_in`

2. **Decodifica o JWT** para obter dados do usuário:
   ```typescript
   const payload = JSON.parse(atob(accessToken.split('.')[1]));
   const userMetadata = payload.user_metadata;
   ```

3. **Exibe formulário** para criar senha:
   - Campo "Nova Senha" (mínimo 8 caracteres)
   - Campo "Confirmar Senha"
   - Validações em tempo real

4. **Mostra informações do usuário:**
   - Nome completo
   - Email
   - Nome da empresa (se business_owner)

---

### 5️⃣ **Criação da Senha**

Quando o usuário submete o formulário:

**API:** `POST /api/platform/auth/set-password`

**Payload:**
```json
{
  "email": "usuario@empresa.com",
  "password": "SenhaSegura123!",
  "accessToken": "eyJhbGc...",
  "userData": {
    "email": "usuario@empresa.com",
    "fullName": "Nome Completo",
    "businessName": "Nome da Empresa",
    "businessId": "uuid-da-empresa",
    "role": "business_owner",
    "entityType": "business"
  }
}
```

**Processo:**

1. **Valida dados** (senha mínimo 8 caracteres)
2. **Gera hash bcrypt** (salt rounds: 12)
3. **Verifica se usuário existe** em `platform_users`
4. **Se existe:** Atualiza `password_hash` e ativa usuário
5. **Se não existe:** Cria novo registro em `platform_users`
6. **Retorna sucesso** com dados do usuário

---

### 6️⃣ **Login Automático**

Após criar a senha com sucesso:

1. **Chama API de login** automaticamente:
   ```typescript
   POST /api/platform/auth/login
   {
     "email": "usuario@empresa.com",
     "password": "SenhaSegura123!"
   }
   ```

2. **Atualiza authStore** com dados do usuário

3. **Redireciona para `/dashboard`**

---

## 📂 Arquivos Criados/Modificados

### ✅ Novos Arquivos

1. **`app/onboarding/page.tsx`**
   - Página de onboarding
   - Formulário de criação de senha
   - Extração de dados do token
   - Login automático

2. **`app/api/platform/auth/set-password/route.ts`**
   - API para criar/atualizar senha
   - Geração de hash bcrypt
   - Criação/atualização em `platform_users`

### ✅ Arquivos Modificados

1. **`app/login/page.tsx`**
   - Adicionada detecção de `type=invite`
   - Redirecionamento automático para `/onboarding`

---

## 🔐 Segurança

### Validações Implementadas

1. **Token JWT:**
   - Verificação de `type=invite`
   - Decodificação segura do payload
   - Validação de expiração

2. **Senha:**
   - Mínimo 8 caracteres
   - Hash bcrypt com salt rounds 12
   - Confirmação de senha

3. **Usuário:**
   - Email único
   - Verificação de existência
   - Ativação automática após criar senha

---

## 🧪 Como Testar

### Passo 1: Criar Convite no Supabase

```sql
-- No Supabase SQL Editor, criar usuário no auth.users
-- Isso enviará email de convite automaticamente
```

**OU via Supabase Dashboard:**
1. Authentication → Users
2. Invite User
3. Preencher email e metadata:
   ```json
   {
     "full_name": "Teste Business",
     "business_name": "Empresa Teste",
     "business_id": "uuid-da-empresa",
     "role": "business_owner",
     "entity_type": "business"
   }
   ```

### Passo 2: Copiar Link do Email

O link será algo como:
```
https://www.criadores.app/login#access_token=...&type=invite
```

### Passo 3: Acessar o Link

1. Cole o link no navegador
2. Deve redirecionar automaticamente para `/onboarding`
3. Preencha a senha (mínimo 8 caracteres)
4. Confirme a senha
5. Clique em "Criar Senha e Acessar"

### Passo 4: Verificar Resultado

**Esperado:**
- ✅ Senha criada com sucesso
- ✅ Login automático realizado
- ✅ Redirecionado para `/dashboard`
- ✅ Dados do usuário aparecem no dashboard

**Verificar no banco:**
```sql
SELECT 
  email,
  full_name,
  role,
  roles,
  is_active,
  email_verified,
  LENGTH(password_hash) as hash_length,
  business_id,
  created_at
FROM platform_users
WHERE email = 'email@teste.com';
```

**Resultado esperado:**
```
email: email@teste.com
full_name: Teste Business
role: business_owner
roles: ["business_owner"]
is_active: true
email_verified: true
hash_length: 60
business_id: uuid-da-empresa
```

---

## 🐛 Troubleshooting

### Problema 1: "Link de convite inválido"

**Causas:**
- Token expirado
- `type` não é `invite`
- Hash fragment não foi preservado

**Solução:**
- Gerar novo convite
- Verificar se URL tem `#access_token=...&type=invite`

### Problema 2: "Erro ao criar senha"

**Causas:**
- Email já existe com senha
- Erro de conexão com banco
- Validação de senha falhou

**Solução:**
```sql
-- Verificar se usuário já existe
SELECT * FROM platform_users WHERE email = 'email@teste.com';

-- Se existir, resetar senha manualmente
UPDATE platform_users 
SET password_hash = NULL, email_verified = false
WHERE email = 'email@teste.com';
```

### Problema 3: "Login automático falhou"

**Causas:**
- Senha não foi salva corretamente
- Usuário não está ativo
- Role inválido

**Solução:**
```sql
-- Verificar status do usuário
SELECT email, is_active, role, LENGTH(password_hash)
FROM platform_users 
WHERE email = 'email@teste.com';

-- Ativar usuário se necessário
UPDATE platform_users 
SET is_active = true 
WHERE email = 'email@teste.com';
```

---

## ✅ Checklist de Implementação

- [x] Página `/onboarding` criada
- [x] API `/api/platform/auth/set-password` criada
- [x] Detecção de `type=invite` em `/login`
- [x] Redirecionamento automático para `/onboarding`
- [x] Extração de dados do JWT
- [x] Formulário de criação de senha
- [x] Validações de senha
- [x] Geração de hash bcrypt
- [x] Criação/atualização em `platform_users`
- [x] Login automático após criar senha
- [x] Redirecionamento para dashboard

---

## 🎉 Resultado Final

Após implementação completa:

1. ✅ Admin envia convite via Supabase Auth
2. ✅ Business owner recebe email com link
3. ✅ Clica no link → Redireciona para `/onboarding`
4. ✅ Cria senha segura
5. ✅ Login automático
6. ✅ Acessa dashboard com permissões corretas

**Fluxo totalmente automatizado e seguro!** 🚀

