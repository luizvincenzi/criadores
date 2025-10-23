# 🔧 Corrigir Login da Alanna - platform_users

## 🎯 Problema Identificado

O usuário **Alanna Alícia** (`alannaalicia17@gmail.com`) não consegue fazer login porque:

1. ❌ O sistema crIAdores usa a tabela `platform_users`
2. ❌ A tabela `users` é para outro sistema (CRM)
3. ❌ Alanna provavelmente foi adicionada na tabela `users` em vez de `platform_users`
4. ❌ O login tenta `platform_users` primeiro, não encontra, e falha

## 📊 Diagnóstico

### Logs do Erro:
```
🔐 [crIAdores] Iniciando login para: alannaalicia17@gmail.com
⚠️ [crIAdores] Não encontrado em platform_users, tentando users...
❌ Erro de autenticação: Email ou senha incorretos
```

### Erros do SQL:
```
ERROR: column "roles" does not exist
ERROR: column "password_hash" does not exist
```

**Conclusão:** O SQL estava consultando a tabela `users` que não tem essas colunas. Precisamos usar `platform_users`.

---

## ✅ Solução - Passo a Passo

### Passo 1: Verificar se Alanna existe em platform_users

Execute no **Supabase SQL Editor**:

```sql
SELECT * FROM platform_users WHERE email = 'alannaalicia17@gmail.com';
```

**Resultado esperado:**
- Se retornar **0 linhas** → Alanna NÃO existe em platform_users (vá para Passo 2)
- Se retornar **1 linha** → Alanna existe (vá para Passo 3)

---

### Passo 2: Gerar Hash da Senha

**Senha da Alanna:** `1#CriamudarA`

#### Opção A: Usar o script TypeScript (RECOMENDADO)

```bash
# No terminal, na pasta do projeto:
npx tsx scripts/generate-hash-alanna.ts
```

Isso vai gerar o hash e o SQL pronto para copiar.

#### Opção B: Gerar manualmente

```bash
# No terminal:
npx tsx -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('1#CriamudarA', 12));"
```

#### Opção C: Gerador online

1. Acesse: https://bcrypt-generator.com/
2. Digite: `1#CriamudarA`
3. Rounds: `12`
4. Clique em "Generate"
5. Copie o hash (deve ter 60 caracteres)

---

### Passo 3: Inserir Alanna em platform_users

Execute no **Supabase SQL Editor**:

```sql
-- ⚠️ SUBSTITUA O HASH ABAIXO PELO HASH GERADO NO PASSO 2!

INSERT INTO platform_users (
  id,
  organization_id,
  email,
  full_name,
  role,
  roles,
  is_active,
  platform,
  password_hash,
  permissions,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'alannaalicia17@gmail.com',
  'Alanna Alícia',
  'marketing_strategist',
  ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  true,
  'client',
  '$2a$12$SUBSTITUA_PELO_HASH_GERADO_NO_PASSO_2',
  '{
    "campaigns": {"read": true, "write": true, "delete": false},
    "conteudo": {"read": true, "write": true, "delete": false},
    "briefings": {"read": true, "write": true, "delete": false},
    "reports": {"read": true, "write": false, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false}
  }'::jsonb,
  NOW(),
  NOW()
);
```

**Resultado esperado:**
```
INSERT 0 1
```

---

### Passo 4: Verificar se foi inserido corretamente

Execute no **Supabase SQL Editor**:

```sql
SELECT 
  email,
  full_name,
  role,
  roles,
  is_active,
  LENGTH(password_hash) as hash_length,
  SUBSTRING(password_hash, 1, 4) as hash_prefix,
  created_at
FROM platform_users
WHERE email = 'alannaalicia17@gmail.com';
```

**Resultado esperado:**
```
email                      | alannaalicia17@gmail.com
full_name                  | Alanna Alícia
role                       | marketing_strategist
roles                      | {marketing_strategist,creator}
is_active                  | true
hash_length                | 60
hash_prefix                | $2a$ (ou $2b$)
created_at                 | [data atual]
```

---

### Passo 5: Testar o Login

#### Via Interface Web:

1. Acesse: http://localhost:3000/login
2. Digite:
   - **Email:** `alannaalicia17@gmail.com`
   - **Senha:** `1#CriamudarA`
3. Clique em "Entrar"

**Resultado esperado:**
- ✅ Redirecionado para `/dashboard`
- ✅ Dados do usuário aparecem
- ✅ Menu lateral carrega

#### Via cURL:

```bash
curl -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alannaalicia17@gmail.com",
    "password": "1#CriamudarA"
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "alannaalicia17@gmail.com",
    "full_name": "Alanna Alícia",
    "role": "marketing_strategist",
    "roles": ["marketing_strategist", "creator"],
    ...
  }
}
```

---

### Passo 6: Verificar Logs

Abra o **DevTools** (F12) → **Console** e procure por:

```
✅ Logs esperados:
🔐 [crIAdores] Iniciando login para: alannaalicia17@gmail.com
🔐 [Platform] Tentativa de login para: alannaalicia17@gmail.com
🔐 [Platform] Validando senha com bcrypt para: alannaalicia17@gmail.com
✅ [Platform] Validação de senha com bcrypt para usuário: alannaalicia17@gmail.com
✅ [Platform] Login realizado com sucesso
```

---

## 🔍 Troubleshooting

### Problema 1: "Email ou senha incorretos"

**Possíveis causas:**
1. Hash da senha está incorreto
2. Senha digitada está errada
3. Usuário não está em `platform_users`
4. `is_active = false`

**Solução:**
```sql
-- Verificar se existe e está ativo
SELECT email, is_active, LENGTH(password_hash) 
FROM platform_users 
WHERE email = 'alannaalicia17@gmail.com';

-- Se is_active = false, ativar:
UPDATE platform_users 
SET is_active = true 
WHERE email = 'alannaalicia17@gmail.com';
```

### Problema 2: Hash não funciona

**Solução:**
```sql
-- Gerar novo hash e atualizar
UPDATE platform_users 
SET password_hash = '$2a$12$NOVO_HASH_AQUI'
WHERE email = 'alannaalicia17@gmail.com';
```

### Problema 3: Usuário não aparece no dashboard

**Solução:**
```sql
-- Verificar permissões
SELECT email, permissions, role, roles
FROM platform_users 
WHERE email = 'alannaalicia17@gmail.com';

-- Atualizar permissões se necessário
UPDATE platform_users 
SET permissions = '{
  "campaigns": {"read": true, "write": true, "delete": false},
  "conteudo": {"read": true, "write": true, "delete": false},
  "briefings": {"read": true, "write": true, "delete": false},
  "reports": {"read": true, "write": false, "delete": false},
  "tasks": {"read": true, "write": true, "delete": false}
}'::jsonb
WHERE email = 'alannaalicia17@gmail.com';
```

---

## 📚 Arquivos de Referência

- `SQL_VERIFICAR_ALANNA_PLATFORM_USERS.sql` - Scripts SQL completos
- `scripts/generate-hash-alanna.ts` - Gerar hash da senha
- `app/api/platform/auth/login/route.ts` - API de login

---

## ✅ Checklist Final

- [ ] Executei Passo 1 (verificar se existe)
- [ ] Executei Passo 2 (gerar hash)
- [ ] Executei Passo 3 (inserir em platform_users)
- [ ] Executei Passo 4 (verificar inserção)
- [ ] Executei Passo 5 (testar login)
- [ ] Executei Passo 6 (verificar logs)
- [ ] ✅ Login funcionou!

---

## 🎉 Resultado Final

Se tudo funcionou:
- ✅ Alanna está em `platform_users`
- ✅ Alanna consegue fazer login
- ✅ Dashboard carrega corretamente
- ✅ Permissões funcionam

**Parabéns! O problema foi resolvido!** 🎉

