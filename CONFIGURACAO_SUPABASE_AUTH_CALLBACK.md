# 🔐 Configuração do Supabase Auth Callback

## 📋 Problema Identificado

O link de callback do Supabase está chegando como:
```
https://www.criadores.app/#access_token=...&type=invite
```

Mas deveria redirecionar para:
```
https://www.criadores.app/auth/callback#access_token=...&type=invite
```

## ✅ Solução

### 1. Configurar Redirect URLs no Supabase Dashboard

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** → **URL Configuration**
4. Configure as seguintes URLs:

#### Site URL
```
https://www.criadores.app
```

#### Redirect URLs (adicione todas estas URLs)
```
https://www.criadores.app/auth/callback
https://criadores.app/auth/callback
http://localhost:3000/auth/callback
```

### 2. Estrutura de Arquivos Criada

```
app/
├── auth/
│   └── callback/
│       └── page.tsx          ← NOVA página de callback
├── onboarding/
│   └── page.tsx              ← ATUALIZADA para suportar creators
└── login/
    └── page.tsx              ← Já existente
```

### 3. Fluxo de Autenticação

#### Para Business Owners:
1. Admin envia convite via Supabase Auth com `user_metadata`:
   ```typescript
   {
     full_name: "Nome do Business Owner",
     business_name: "Nome da Empresa",
     business_id: "uuid-da-empresa",
     role: "business_owner",
     entity_type: "business"
   }
   ```

2. Business owner recebe email com link
3. Clica no link → Redireciona para `/auth/callback`
4. `/auth/callback` detecta `type=invite` → Redireciona para `/onboarding`
5. `/onboarding` extrai dados do token e mostra formulário de senha
6. Cria senha → Login automático → Dashboard

#### Para Creators:
1. Admin envia convite via Supabase Auth com `user_metadata`:
   ```typescript
   {
     full_name: "Nome do Creator",
     creator_id: "uuid-do-creator",
     role: "creator",
     entity_type: "creator"
   }
   ```

2. Creator recebe email com link
3. Clica no link → Redireciona para `/auth/callback`
4. `/auth/callback` detecta `type=invite` → Redireciona para `/onboarding`
5. `/onboarding` extrai dados do token e mostra formulário de senha
6. Cria senha → Login automático → Dashboard

### 4. Como Enviar Convite para Creator

#### Via Supabase Dashboard:
1. Acesse **Authentication** → **Users**
2. Clique em **Invite User**
3. Preencha:
   - **Email**: email do creator
   - **Redirect URL**: `https://www.criadores.app/auth/callback`
   - **User Metadata**:
     ```json
     {
       "full_name": "Luigi Carli - TESTE",
       "creator_id": "685c132e-aeb0-41be-9c9a-2f21f6b04c47",
       "role": "creator",
       "entity_type": "creator"
     }
     ```

#### Via API (Recomendado):
```typescript
import { supabaseAdmin } from '@/lib/supabase';

// Enviar convite para creator
const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
  'creator@email.com',
  {
    redirectTo: 'https://www.criadores.app/auth/callback',
    data: {
      full_name: 'Nome do Creator',
      creator_id: 'uuid-do-creator',
      role: 'creator',
      entity_type: 'creator',
      email_verified: true,
      invited_at: new Date().toISOString()
    }
  }
);
```

### 5. Verificar Configuração

Após configurar as Redirect URLs no Supabase:

1. Teste enviando um convite
2. Verifique se o link recebido por email contém:
   ```
   https://www.criadores.app/auth/callback#access_token=...&type=invite
   ```
3. Ao clicar, deve redirecionar para `/onboarding`
4. Após criar senha, deve fazer login automático

### 6. Troubleshooting

#### Problema: Link ainda redireciona para home
**Solução**: Verifique se as Redirect URLs foram salvas corretamente no Supabase Dashboard

#### Problema: Erro 404 em /auth/callback
**Solução**: Verifique se o arquivo `app/auth/callback/page.tsx` foi criado corretamente

#### Problema: Não redireciona para /onboarding
**Solução**: Verifique os logs do console no navegador para ver se o `type=invite` está sendo detectado

#### Problema: Erro ao criar senha
**Solução**: Verifique os logs da API `/api/platform/auth/set-password` para ver detalhes do erro

### 7. Logs para Debug

A aplicação possui logs detalhados em cada etapa:

```
🔐 [Auth Callback] Processando callback...
🎉 [Auth Callback] Convite detectado, redirecionando para onboarding
🔐 [Onboarding] Hash params: { accessToken: '✅ Presente', type: 'invite' }
📋 [Onboarding] Dados do token: { email, user_metadata }
🔐 [Set Password] Iniciando criação de senha para: email@example.com
📋 [Set Password] Tipo de entidade: creator Role: creator
✅ [Set Password] Senha atualizada com sucesso
🔐 [Onboarding] Iniciando login automático via Supabase Auth...
✅ [Onboarding] Login completo realizado
```

### 8. Segurança

- ✅ Token JWT validado em cada etapa
- ✅ Senha com hash bcrypt (12 rounds)
- ✅ Validação de email obrigatória
- ✅ Redirect URLs whitelist no Supabase
- ✅ HTTPS obrigatório em produção

## 🎯 Próximos Passos

1. **Configure as Redirect URLs no Supabase Dashboard** (URGENTE)
2. Teste o fluxo completo com um creator
3. Verifique se o login automático funciona
4. Teste o acesso ao dashboard após login

## 📝 Notas Importantes

- O `entity_type` no `user_metadata` é crucial para diferenciar business de creator
- O `creator_id` deve ser o UUID do creator na tabela `creators`
- O `business_id` deve ser o UUID do business na tabela `businesses`
- Sempre use `https://www.criadores.app` (com www) como URL base
- Em desenvolvimento local, use `http://localhost:3000`

