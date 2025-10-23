# 📧 Como Enviar Convite para Business Owner

## 🎯 Objetivo

Enviar convite por email para business_owner acessar a plataforma criadores.app e criar sua senha.

---

## 🚀 Método 1: Via Supabase Dashboard (Mais Fácil)

### Passo 1: Acessar Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/ecbhcalmulaiszslwhqz
2. Faça login
3. Vá em **Authentication** → **Users**

### Passo 2: Clicar em "Invite User"

1. Clique no botão **"Invite User"** (canto superior direito)
2. Preencha o formulário:

**Email:**
```
email@empresa.com
```

**User Metadata (JSON):**
```json
{
  "full_name": "Nome do Dono da Empresa",
  "business_name": "Nome da Empresa",
  "business_id": "uuid-da-empresa-no-banco",
  "role": "business_owner",
  "entity_type": "business",
  "invited_at": "2025-10-23T16:46:40.695Z"
}
```

### Passo 3: Enviar Convite

1. Clique em **"Send Invite"**
2. O Supabase enviará email automaticamente
3. O email conterá link no formato:
   ```
   https://www.criadores.app/login#access_token=...&type=invite
   ```

---

## 🔧 Método 2: Via SQL Function (Automático)

### Criar Função no Supabase

Execute no **Supabase SQL Editor**:

```sql
-- Função para enviar convite para business_owner
CREATE OR REPLACE FUNCTION invite_business_owner(
  p_email TEXT,
  p_full_name TEXT,
  p_business_id UUID,
  p_business_name TEXT
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Chamar função do Supabase Auth para enviar convite
  -- Nota: Isso requer extensão auth.invite_user() se disponível
  
  -- Por enquanto, apenas criar registro em platform_users
  -- O convite deve ser enviado via Dashboard ou API
  
  INSERT INTO platform_users (
    organization_id,
    email,
    full_name,
    role,
    roles,
    business_id,
    managed_businesses,
    is_active,
    email_verified,
    platform,
    permissions,
    preferences,
    subscription_plan,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000001',
    p_email,
    p_full_name,
    'business_owner',
    ARRAY['business_owner']::platform_user_role[],
    p_business_id,
    ARRAY[p_business_id]::UUID[],
    false, -- Será ativado quando criar senha
    false, -- Será verificado quando criar senha
    'client',
    '{
      "campaigns": {"read": true, "write": true, "delete": false},
      "conteudo": {"read": true, "write": false, "delete": false},
      "briefings": {"read": true, "write": false, "delete": false},
      "reports": {"read": true, "write": false, "delete": false},
      "tasks": {"read": true, "write": true, "delete": false}
    }'::jsonb,
    '{
      "theme": "light",
      "language": "pt-BR",
      "notifications": {
        "push": true,
        "email": true,
        "in_app": true
      }
    }'::jsonb,
    'basic',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    business_id = EXCLUDED.business_id,
    managed_businesses = EXCLUDED.managed_businesses,
    updated_at = NOW();
  
  v_result := json_build_object(
    'success', true,
    'message', 'Usuário preparado. Envie convite via Supabase Dashboard.',
    'email', p_email,
    'business_name', p_business_name
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
```

### Usar a Função

```sql
-- Exemplo de uso
SELECT invite_business_owner(
  'luiz@aconchegopet.com',
  'Luiz Vincenzi',
  '3cb07c8b-70d8-4273-868a-1ed38d6d7da1',
  'Aconchego Pet'
);
```

**Depois:**
1. Vá no Supabase Dashboard → Authentication → Users
2. Encontre o email
3. Clique em "Send Magic Link" ou "Invite User"

---

## 📋 Método 3: Via API do Supabase (Programático)

### Criar Endpoint Interno

**Arquivo:** `app/api/admin/invite-business-owner/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ⚠️ Service Role Key!

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, businessId, businessName } = await request.json();

    // Criar cliente com Service Role Key (tem permissões de admin)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Enviar convite via Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        business_name: businessName,
        business_id: businessId,
        role: 'business_owner',
        entity_type: 'business',
        invited_at: new Date().toISOString()
      },
      redirectTo: 'https://www.criadores.app/login'
    });

    if (error) {
      console.error('❌ Erro ao enviar convite:', error);
      return NextResponse.json(
        { error: 'Erro ao enviar convite', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Convite enviado com sucesso para:', email);

    return NextResponse.json({
      success: true,
      message: 'Convite enviado com sucesso',
      email: email,
      user: data.user
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

### Usar a API

```bash
curl -X POST http://localhost:3000/api/admin/invite-business-owner \
  -H "Content-Type: application/json" \
  -d '{
    "email": "luiz@aconchegopet.com",
    "fullName": "Luiz Vincenzi",
    "businessId": "3cb07c8b-70d8-4273-868a-1ed38d6d7da1",
    "businessName": "Aconchego Pet"
  }'
```

---

## 📧 Template do Email (Configurar no Supabase)

### Passo 1: Acessar Email Templates

1. Supabase Dashboard → **Authentication** → **Email Templates**
2. Selecione **"Invite User"**

### Passo 2: Personalizar Template

```html
<h2>Bem-vindo à crIAdores! 🎉</h2>

<p>Olá {{ .Data.full_name }},</p>

<p>Você foi convidado para acessar a plataforma <strong>crIAdores</strong> como dono da empresa <strong>{{ .Data.business_name }}</strong>.</p>

<p>Clique no botão abaixo para criar sua senha e acessar a plataforma:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Criar Senha e Acessar
  </a>
</p>

<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Este link expira em 24 horas.</p>

<p>Atenciosamente,<br>Equipe crIAdores</p>
```

### Passo 3: Configurar Sender

**Sender Email:** `contato@criadores.digital`  
**Sender Name:** `crIAdores`

---

## ✅ Checklist de Envio

### Antes de Enviar

- [ ] Business existe na tabela `businesses`
- [ ] Você tem o `business_id` (UUID)
- [ ] Email do business_owner está correto
- [ ] Nome completo está correto
- [ ] SMTP está configurado no Supabase

### Ao Enviar

- [ ] Escolheu método de envio (Dashboard, SQL ou API)
- [ ] Preencheu todos os dados corretamente
- [ ] Verificou que email foi enviado (check logs)

### Após Enviar

- [ ] Business owner recebeu o email
- [ ] Link do email funciona
- [ ] Redireciona para `/onboarding`
- [ ] Consegue criar senha
- [ ] Login automático funciona
- [ ] Acessa dashboard com permissões corretas

---

## 🐛 Troubleshooting

### Email não chegou

**Verificar:**
1. SMTP configurado corretamente no Supabase
2. Email não está em spam
3. Logs do Supabase (Authentication → Logs)

**Solução:**
```sql
-- Verificar se usuário foi criado no auth.users
SELECT * FROM auth.users WHERE email = 'email@teste.com';
```

### Link não funciona

**Verificar:**
1. URL de redirecionamento está correta
2. Hash fragment está presente (`#access_token=...`)
3. `type=invite` está no hash

**Solução:**
- Gerar novo convite
- Verificar configuração de redirect_to

### Usuário já existe

**Erro:**
```
User already registered
```

**Solução:**
```sql
-- Deletar usuário do auth.users
DELETE FROM auth.users WHERE email = 'email@teste.com';

-- Deletar de platform_users se necessário
DELETE FROM platform_users WHERE email = 'email@teste.com';

-- Enviar novo convite
```

---

## 📝 Exemplo Completo

### Cenário: Convidar Luiz da Aconchego Pet

**Dados:**
- Email: `connectcityops@gmail.com`
- Nome: `Luiz Vincenzi`
- Empresa: `Aconchego Pet`
- Business ID: `3cb07c8b-70d8-4273-868a-1ed38d6d7da1`

**Via Supabase Dashboard:**

1. Authentication → Users → Invite User
2. Email: `connectcityops@gmail.com`
3. Metadata:
   ```json
   {
     "full_name": "Luiz Vincenzi",
     "business_name": "Aconchego Pet",
     "business_id": "3cb07c8b-70d8-4273-868a-1ed38d6d7da1",
     "role": "business_owner",
     "entity_type": "business"
   }
   ```
4. Send Invite

**Resultado:**
- ✅ Email enviado para `connectcityops@gmail.com`
- ✅ Link: `https://www.criadores.app/login#access_token=...&type=invite`
- ✅ Luiz clica no link
- ✅ Redireciona para `/onboarding`
- ✅ Cria senha
- ✅ Acessa dashboard

---

## 🎉 Pronto!

Agora você pode enviar convites para business_owners de forma fácil e automatizada! 🚀

