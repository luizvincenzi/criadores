# 🚀 Guia Rápido: Criar platform_users

## ✅ Problema Corrigido

O erro `column c.instagram_handle does not exist` foi corrigido!

A coluna correta é: `c.social_media->>'instagram'`

---

## 📋 Passo a Passo

### 1️⃣ Executar Migration no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo:
   ```
   supabase/migrations/029_create_platform_users_EXECUTAR_NO_SUPABASE.sql
   ```
6. Cole no editor
7. Clique em **RUN** (ou pressione Ctrl+Enter)

**Resultado esperado:**
```
Success. No rows returned
```

---

### 2️⃣ Verificar se Funcionou

Execute no SQL Editor:

```sql
-- Verificar tabela
SELECT * FROM platform_users LIMIT 1;

-- Verificar view
SELECT * FROM v_platform_users_with_details LIMIT 1;

-- Verificar função
SELECT get_combined_platform_permissions(ARRAY['creator', 'marketing_strategist']::platform_user_role[]);
```

---

### 3️⃣ Criar Usuários

Execute no terminal:

```bash
cd /Users/luizvincenzi/Documents/Criadores/criadores
npx tsx scripts/create-platform-users.ts
```

**Resultado esperado:**
```
🚀 Iniciando criação de usuários da plataforma...

📝 Criando usuário: Pietra Mantovani (pietramantovani98@gmail.com)
   Roles: creator, marketing_strategist
   🔍 Buscando criador: pietra-mantovani...
   ✅ Criador encontrado: [UUID]
   ✅ Usuário criado com sucesso!

📝 Criando usuário: Marilia (marilia12cavalheiro@gmail.com)
   Roles: marketing_strategist, creator
   ✅ Usuário criado com sucesso!

📊 RESUMO:
   ✅ Sucesso: 2
   ❌ Erros: 0
```

---

### 4️⃣ Verificar Usuários Criados

Execute no SQL Editor:

```sql
SELECT 
  email,
  full_name,
  role,
  roles,
  creator_id,
  is_active
FROM platform_users
WHERE email IN (
  'pietramantovani98@gmail.com',
  'marilia12cavalheiro@gmail.com'
);
```

**Resultado esperado:**

| email | full_name | role | roles | creator_id | is_active |
|-------|-----------|------|-------|------------|-----------|
| pietramantovani98@gmail.com | Pietra Mantovani | creator | {creator,marketing_strategist} | [UUID] | true |
| marilia12cavalheiro@gmail.com | Marilia | marketing_strategist | {marketing_strategist,creator} | null | true |

---

## 🎯 Próximos Passos

### 1. Atualizar Sistema de Login

Criar API separada para platform_users:

```typescript
// app/api/platform/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // Buscar em platform_users
  const { data: user, error } = await supabase
    .from('platform_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('is_active', true)
    .single();
  
  if (error || !user) {
    return NextResponse.json(
      { error: 'Email ou senha incorretos' },
      { status: 401 }
    );
  }
  
  // TODO: Validar senha
  // TODO: Gerar token JWT
  
  return NextResponse.json({
    success: true,
    user: user
  });
}
```

### 2. Testar Login

```bash
# Teste manual
curl -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pietramantovani98@gmail.com","password":"2#Todoscria"}'
```

---

## 🔍 Troubleshooting

### Erro: "type platform_user_role already exists"

**Solução:** O ENUM já foi criado. Remova a linha:
```sql
CREATE TYPE platform_user_role AS ENUM (...)
```

E execute novamente.

---

### Erro: "relation platform_users already exists"

**Solução:** A tabela já existe. Para recriar:

```sql
-- CUIDADO: Isso apaga todos os dados!
DROP TABLE IF EXISTS platform_users CASCADE;
DROP TYPE IF EXISTS platform_user_role CASCADE;

-- Depois execute a migration novamente
```

---

### Erro: "column does not exist"

**Solução:** Verifique se está usando o arquivo correto:
```
029_create_platform_users_EXECUTAR_NO_SUPABASE.sql
```

Este arquivo tem a correção do `instagram_handle`.

---

## ✅ Checklist

- [ ] Migration executada no Supabase
- [ ] Tabela `platform_users` criada
- [ ] View `v_platform_users_with_details` criada
- [ ] Funções SQL criadas
- [ ] Script `create-platform-users.ts` executado
- [ ] Pietra criada com sucesso
- [ ] Marilia criada com sucesso
- [ ] Verificação no SQL Editor OK

---

## 📊 Estrutura Final

```
BANCO DE DADOS
│
├── users (CRM - criadores.digital)
│   ├── Funcionários internos
│   └── Roles: admin, manager, user, viewer
│
└── platform_users (criadores.app) ← NOVA!
    ├── Usuários externos
    ├── Roles: creator, marketing_strategist, business_owner
    └── Múltiplos roles por usuário ✅
```

---

## 🎉 Sucesso!

Após executar todos os passos, você terá:

✅ Tabela `platform_users` criada  
✅ Pietra Mantovani com roles: creator + marketing_strategist  
✅ Marilia com roles: marketing_strategist + creator  
✅ Sistema pronto para login separado  
✅ Segurança: funcionários ≠ clientes  

---

## 📞 Suporte

Se tiver algum erro, verifique:

1. **Arquivo correto?** Use `029_create_platform_users_EXECUTAR_NO_SUPABASE.sql`
2. **Supabase conectado?** Verifique as credenciais
3. **Permissões?** Você precisa ser admin do projeto Supabase

---

**Tempo estimado:** 10-15 minutos ⏱️

