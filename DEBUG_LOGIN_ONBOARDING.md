# 🐛 Debug - Login após Onboarding

## 🎯 Problema

Usuário cria senha no onboarding com sucesso, mas login automático falha com erro 401.

**Mensagem de erro:**
```
Senha criada, mas erro no login. Tente fazer login manualmente.
```

---

## 🔍 Diagnóstico

### Passo 1: Verificar se a senha foi salva no banco

Execute no **Supabase SQL Editor**:

```sql
SELECT 
  email,
  full_name,
  role,
  is_active,
  email_verified,
  LENGTH(password_hash) as hash_length,
  password_hash IS NOT NULL as has_password,
  created_at,
  updated_at,
  last_password_change
FROM platform_users
WHERE email = 'connectcityops@gmail.com';
```

**Resultado esperado:**
```
email: connectcityops@gmail.com
has_password: true
hash_length: 60
is_active: true
email_verified: true
```

**Se `has_password` for `false`:**
- ❌ A senha NÃO foi salva no banco
- Problema está na API `/api/platform/auth/set-password`

**Se `hash_length` não for 60:**
- ❌ O hash bcrypt está incorreto
- Hash bcrypt sempre tem 60 caracteres

---

### Passo 2: Verificar logs da API de set-password

Abra o **Console do navegador** e procure por:

```
✅ [Set Password] Hash gerado com sucesso
🔐 [Set Password] Hash length: 60
🧪 [Set Password] Teste de verificação imediata: ✅ OK
✅ [Set Password] Senha atualizada com sucesso
🔍 [Set Password] Verificação pós-update: { has_hash: true, hash_length: 60 }
```

**Se aparecer `❌ [Set Password] Erro ao atualizar senha`:**
- Problema de permissão no Supabase
- Verificar RLS policies

**Se `🧪 Teste de verificação imediata: ❌ FALHOU`:**
- Problema com bcrypt
- Executar `scripts/test-bcrypt.ts`

---

### Passo 3: Verificar logs da API de login

Procure por:

```
🔐 [Platform] Tentativa de login para: connectcityops@gmail.com
✅ [Platform] Usuário encontrado: { has_password_hash: true, hash_length: 60 }
🔐 [Platform] Validando senha com bcrypt para: connectcityops@gmail.com
✅ [Platform] Validação de senha com bcrypt para usuário: connectcityops@gmail.com
```

**Se aparecer `❌ [Platform] Usuário não encontrado`:**
- Usuário não está em `platform_users`
- OU `is_active` é `false`
- OU `organization_id` está errado

**Se aparecer `❌ [Platform] Validação de senha com bcrypt para usuário`:**
- A senha fornecida não corresponde ao hash
- Possível problema:
  - Senha foi alterada entre criar e fazer login
  - Hash foi corrompido
  - Bcrypt não está funcionando

---

### Passo 4: Testar bcrypt manualmente

Execute:

```bash
npx ts-node scripts/test-bcrypt.ts
```

**Resultado esperado:**
```
🧪 Testando bcrypt...

📝 Senha original: TesteSenha123!
🔐 Hash gerado: $2a$12$...
📏 Tamanho do hash: 60
✅ Verificação: PASSOU
❌ Senha errada: FALHOU (CORRETO)

✅ Teste concluído!
```

**Se falhar:**
- Problema com instalação do bcryptjs
- Executar: `npm install bcryptjs @types/bcryptjs`

---

### Passo 5: Testar login manual

Tente fazer login manualmente em `/login`:

1. Email: `connectcityops@gmail.com`
2. Senha: A MESMA que você criou no onboarding

**Se funcionar:**
- ✅ O problema é apenas no login automático
- A senha está correta no banco
- Verificar código do onboarding

**Se NÃO funcionar:**
- ❌ Problema na validação de senha
- OU senha não foi salva corretamente

---

## 🔧 Soluções

### Solução 1: Resetar senha manualmente

Se a senha não foi salva corretamente:

```sql
-- Gerar novo hash (use um gerador online ou o script)
-- Exemplo: senha "NovaSenh@123"
UPDATE platform_users
SET 
  password_hash = '$2a$12$HASH_GERADO_AQUI',
  email_verified = true,
  is_active = true,
  last_password_change = NOW(),
  updated_at = NOW()
WHERE email = 'connectcityops@gmail.com';
```

---

### Solução 2: Verificar RLS Policies

Execute no Supabase SQL Editor:

```sql
-- Verificar policies da tabela platform_users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'platform_users';
```

**Se não houver policy para UPDATE:**

```sql
-- Criar policy para permitir update
CREATE POLICY "Allow update for authenticated users"
ON platform_users
FOR UPDATE
USING (true)
WITH CHECK (true);
```

⚠️ **ATENÇÃO:** Isso permite qualquer update. Em produção, use policies mais restritivas.

---

### Solução 3: Adicionar delay antes do login

Possível problema de timing (banco não atualizou ainda):

<augment_code_snippet path="app/onboarding/page.tsx" mode="EXCERPT">
````typescript
if (data.success) {
  console.log('✅ [Onboarding] Senha criada com sucesso');
  
  // Aguardar 1 segundo antes de fazer login
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Fazer login automático
  const loginResponse = await fetch('/api/platform/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userData.email,
      password: password,
    }),
  });
  // ...
}
````
</augment_code_snippet>

---

### Solução 4: Usar endpoint diferente para primeiro login

Criar endpoint específico que não valida senha, apenas ativa usuário:

```typescript
// app/api/platform/auth/activate-user/route.ts
export async function POST(request: NextRequest) {
  const { email, accessToken } = await request.json();
  
  // Validar token
  // Buscar usuário
  // Retornar dados sem validar senha
  
  return NextResponse.json({
    success: true,
    user: { ... }
  });
}
```

---

## 🧪 Teste Completo

### Script de teste SQL

```sql
-- 1. Criar usuário de teste
INSERT INTO platform_users (
  organization_id,
  email,
  full_name,
  role,
  roles,
  is_active,
  email_verified,
  platform,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'teste@onboarding.com',
  'Teste Onboarding',
  'business_owner',
  ARRAY['business_owner']::platform_user_role[],
  false,
  false,
  'client',
  NOW(),
  NOW()
);

-- 2. Simular criação de senha
UPDATE platform_users
SET 
  password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TuBJO0Zy0Zy0Zy0Zy0Zy0Zy0Zy0',
  email_verified = true,
  is_active = true,
  last_password_change = NOW(),
  updated_at = NOW()
WHERE email = 'teste@onboarding.com';

-- 3. Verificar
SELECT 
  email,
  LENGTH(password_hash) as hash_length,
  is_active,
  email_verified
FROM platform_users
WHERE email = 'teste@onboarding.com';

-- 4. Limpar
DELETE FROM platform_users WHERE email = 'teste@onboarding.com';
```

---

## 📊 Checklist de Debug

- [ ] Senha foi salva no banco? (verificar SQL)
- [ ] Hash tem 60 caracteres?
- [ ] `is_active` é `true`?
- [ ] `email_verified` é `true`?
- [ ] Logs mostram "Hash gerado com sucesso"?
- [ ] Teste de verificação imediata passou?
- [ ] Usuário é encontrado no login?
- [ ] Bcrypt está funcionando? (testar script)
- [ ] RLS policies permitem UPDATE?
- [ ] Login manual funciona?

---

## 🎯 Próximos Passos

1. **Execute o SQL de verificação** para ver se a senha está no banco
2. **Verifique os logs** no console do navegador
3. **Tente login manual** com a mesma senha
4. **Execute o script de teste** do bcrypt
5. **Reporte os resultados** para continuar o debug

---

## 📝 Informações para Reportar

Ao reportar o problema, inclua:

1. **Resultado do SQL de verificação:**
   ```
   email: ...
   has_password: ...
   hash_length: ...
   is_active: ...
   ```

2. **Logs do console:**
   - Logs de [Set Password]
   - Logs de [Platform] (login)

3. **Comportamento:**
   - Login manual funciona? Sim/Não
   - Erro específico que aparece

4. **Ambiente:**
   - Local ou produção?
   - Navegador usado

---

**Com essas informações, podemos identificar exatamente onde está o problema!** 🔍

