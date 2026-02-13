# Client Access Manager Agent

Agente especialista no sistema de liberacao de acesso de clientes externos (businesses) e criadores (social medias/influenciadores) a plataforma criadores.app.

## Expertise

- Fluxo completo de convites para businesses e creators
- Sincronizacao entre 3 camadas: `auth.users` → `platform_users` → `businesses`/`creators`
- Dois sistemas de senha: Supabase Auth (encrypted_password) + platform_users (bcrypt password_hash)
- Login do portal criadores.app (bcrypt via platform_users)
- Triggers automaticos de sincronizacao no Supabase
- CORS e autenticacao multi-metodo (x-user-email, Bearer token)
- Email templates customizados via Resend
- Gerenciamento de equipe multi-user por business

## ARQUITETURA DOS DOIS PROJETOS

### CRM (criadores.digital) - Este repositorio
- Gerencia convites, permissoes, status de acesso
- Envia emails de convite via Resend
- Pagina `/senha` onde cliente cria a senha
- APIs que o portal consome (update-access-status, sync-password)

### Portal (criadores.app) - Repositorio separado: `/Users/luizvincenzi/Documents/Criadores/criadores/`
- Login proprio usando `platform_users` (bcrypt) - NAO usa Supabase Auth para login
- Fallback para tabela `users` (SOMENTE bcrypt - senhas hardcoded REMOVIDAS em Fev/2026)
- AuthStore (Zustand) persiste sessao em localStorage (`criadores-auth-storage`)
- Cookie de sessao `criadores-session` sincronizado para middleware auth
- Resolve business_id do platform_users.business_id para business_owners
- Onboarding proprio em `/onboarding` para convites via Supabase inviteUserByEmail

## Estrutura de Tres Camadas

```
auth.users (Supabase Auth)
  - encrypted_password (hash interno do Supabase)
  - raw_user_meta_data: { business_id, creator_id, entity_type, role }
      ↓ trigger: sync_auth_user_to_platform_users (migration 087)
      ↓ sync manual: /api/platform/sync-password (bcrypt)
platform_users (Tabela do Portal)
  - password_hash (bcrypt - USADO PELO LOGIN DO PORTAL)
  - business_id, creator_id, role
  - is_active, email_verified
      ↑ vinculado via platform_auth_user_id
businesses / creators (Tabelas do CRM)
  - platform_access_status: null|pending|granted|cancelled|revoked|denied|suspended
  - platform_auth_user_id: UUID (FK para auth.users)
  - platform_owner_email, platform_invitation_sent_at
```

### REGRA CRITICA: Duas Senhas

O sistema tem DOIS armazenamentos de senha que DEVEM estar sincronizados:

1. **Supabase Auth** (`auth.users.encrypted_password`) - Usado pela pagina `/senha` para criar senha
2. **Platform Users** (`platform_users.password_hash`) - Usado pelo portal criadores.app para login (bcrypt)

A sincronizacao eh feita pelo endpoint `/api/platform/sync-password` chamado pela pagina `/senha` logo apos `supabase.auth.updateUser({ password })`.

## Estados de Acesso

```
null ──→ pending (convite enviado)
           │
           ├──→ granted (senha criada, acesso ativo)
           │      │
           │      └──→ revoked (admin revogou)
           │             │
           │             └──→ pending (reenviar convite)
           │
           ├──→ cancelled (admin cancelou antes de aceitar)
           │
           └──→ denied / suspended (futuros)
```

## ENDPOINTS DO CRM (criadores.digital)

### Business Access (12 endpoints)

| Endpoint | Metodo | Auth | Status | Funcao |
|----------|--------|------|--------|--------|
| `/api/businesses/send-custom-invitation` | POST | requireAdmin | ATIVO | Envia convite customizado via Resend |
| `/api/businesses/check-invitation-status` | GET | requireAdmin | ATIVO | Verifica email/senha/atividade |
| `/api/businesses/update-access-status` | POST | DUAL AUTH | ATIVO | Atualiza status (pending→granted) |
| `/api/businesses/cancel-invitation` | DELETE | requireAdmin | ATIVO | Cancela convite (soft-delete user) |
| `/api/businesses/update-invitation-email` | POST | requireAdmin | ATIVO | Muda email do convite |
| `/api/businesses/revoke-access` | POST | requireAdmin | ATIVO | Revoga acesso ativo |
| `/api/businesses/reset-password` | POST | requireAdmin | ATIVO | Envia link reset senha |
| `/api/businesses/invitation-history` | GET | requireAdmin | ATIVO | Historico de convites |
| `/api/businesses/[id]/team` | GET/POST/DELETE | requireAdmin | ATIVO | Gerenciar equipe multi-user |
| `/api/businesses/[id]/transfer-ownership` | POST | requireAdmin | ATIVO | Transferir proprietario |
| `/api/businesses/send-invitation` | POST | Nenhum | DESATIVADO (410) | Legacy - retorna erro |
| `/api/businesses/resend-invitation` | POST | Nenhum | DESATIVADO (410) | Legacy - retorna erro |

### Creator Access (1 endpoint)

| Endpoint | Metodo | Auth | Status | Funcao |
|----------|--------|------|--------|--------|
| `/api/creators/send-invitation` | POST | requireAdmin | ATIVO | Envia convite via Supabase inviteUserByEmail |

### Platform Sync (1 endpoint)

| Endpoint | Metodo | Auth | Status | Funcao |
|----------|--------|------|--------|--------|
| `/api/platform/sync-password` | POST | Verificacao userId+timestamp | ATIVO | Sincroniza senha para platform_users.password_hash |

## ENDPOINTS DO PORTAL (criadores.app)

| Endpoint | Auth | Funcao |
|----------|------|--------|
| `/api/platform/auth/login` | Nenhum (valida bcrypt) | Login via platform_users |
| `/api/supabase/auth/login` | Nenhum (valida bcrypt) | Login via tabela users (SOMENTE bcrypt) |
| `/api/platform/auth/set-password` | JWT verificado (getUser) | Define senha no onboarding |
| `/api/platform/auth/activate-account` | Token | Ativa conta via activation_tokens |
| `/api/platform/auth/resend-invite` | Rate limit (3/email/hora) | Reenvia convite expirado |
| `/api/platform/auth/check-onboarding` | JWT | Verifica se onboarding completo |
| `/api/cleanup-data` | CRON_SECRET Bearer | Limpeza de dados (protegido) |

## METODOS DE AUTENTICACAO

### 1. x-user-email Header (CRM Interno)
```
Frontend → useAuthenticatedFetch() → adiciona header x-user-email
Backend → lib/auth/middleware.ts → requireAdmin() → valida na tabela users
```

### 2. Dual Auth (update-access-status)
```
Metodo A: x-user-email → CRM admin (role admin/manager)
Metodo B: Bearer token → Supabase Auth session (pagina /senha)
Metodo C: Password-set verification → userId + metadata.password_set_at (5min)
```

### 3. CORS Whitelist
```
Origens permitidas: criadores.app, criadores.digital, localhost:3000
```

## FLUXO COMPLETO: CONVITE BUSINESS

```
1. Admin abre business no CRM → InvitationManagementPanel.tsx
2. Clica "Enviar Convite de Acesso"
3. Frontend chama POST /api/businesses/send-custom-invitation
   - Auth: useAuthenticatedFetch → x-user-email header
   - Rate limit: 5 por admin/business/dia (in-memory)

4. Backend:
   a. createUser no Supabase Auth (com metadata: business_id, entity_type='business')
   b. Trigger sync_auth_user_to_platform_users dispara → cria platform_users
   c. generateLink({ type: 'recovery' }) → link com token de 24h
   d. Envia email via Resend (template customizado crIAdores)
   e. Atualiza business: platform_access_status='pending', platform_auth_user_id=userId

5. Cliente recebe email → clica "Ativar Meu Acesso"
   → Redireciona para criadores.digital/senha#access_token=...

6. Pagina /senha:
   a. Extrai tokens do hash da URL
   b. setSession({ access_token, refresh_token })
   c. Usuario digita nova senha (min 6 chars)
   d. supabase.auth.updateUser({ password }) → atualiza auth.users
   e. supabase.auth.updateUser({ data: { password_set_at } })
   f. POST /api/platform/sync-password → bcrypt → platform_users.password_hash ⭐
   g. POST /api/businesses/update-access-status → status='granted'
   h. Redireciona para criadores.app/login

7. Cliente faz login em criadores.app:
   a. POST /api/platform/auth/login → busca platform_users → bcrypt.compare
   b. Retorna: user.business_id, user.role, user.email
   c. AuthStore salva em localStorage (criadores-auth-storage)
   d. Dashboard carrega dados filtrados por business_id
```

## FLUXO COMPLETO: CONVITE CREATOR

```
1. Admin envia convite via /api/creators/send-invitation
   - Auth: requireAdmin (x-user-email header)
   - Usa Supabase inviteUserByEmail (template padrao Supabase)
   - Metadata: { entity_type: 'creator', creator_id, role: 'creator'|'marketing_strategist' }

2. Creator recebe email padrao do Supabase → clica link
   → Redireciona para criadores.app/login#access_token=...

3. Pagina /login detecta access_token → redireciona para /onboarding

4. Pagina /onboarding:
   a. Extrai sessao do Supabase Auth
   b. Verifica se ja fez onboarding
   c. Creator define senha
   d. POST /api/platform/auth/set-password → bcrypt → platform_users
   e. signInWithPassword() → login automatico
   f. Redireciona para /dashboard

5. Login subsequente: Mesmo fluxo do business (platform_users + bcrypt)
```

## COMPONENTES FRONTEND (CRM)

### InvitationManagementPanel.tsx
- Usa `useAuthenticatedFetch()` para todas chamadas (x-user-email header)
- Busca email automatico de `business.contact_info.email`
- Status badge: pending|granted|cancelled|revoked|denied|suspended
- Acoes por status:
  - Sem convite: "Enviar Convite" (1-click se email ja cadastrado)
  - Pending: "Reenviar Email de Convite"
  - Granted: "Enviar Link para Redefinir Senha" + "Revogar Acesso ao Portal"
  - Revoked/Cancelled: "Enviar Convite de Acesso" (reativar)

### TeamManagementPanel.tsx
- Gerencia multiplos usuarios por business
- Usa `/api/businesses/[id]/team`

## TABELAS DO BANCO

### businesses (colunas de acesso)
```sql
platform_access_status       VARCHAR  -- null|pending|granted|cancelled|revoked|denied|suspended
platform_owner_email         VARCHAR
platform_owner_name          VARCHAR
platform_auth_user_id        UUID     -- FK para auth.users.id
platform_invitation_sent_at  TIMESTAMP
platform_invitation_sent_by  UUID
platform_access_granted_at   TIMESTAMP
contact_info                 JSONB    -- { email, nome_responsavel, whatsapp, instagram }
```

### creators (colunas de acesso)
```sql
platform_auth_user_id        UUID     -- FK para auth.users.id
platform_access_status       VARCHAR  -- null|pending|granted|revoked
platform_invitation_sent_at  TIMESTAMP
platform_invitation_sent_by  UUID
```

### platform_users (autenticacao do portal)
```sql
id                    UUID PK   -- MESMO ID que auth.users.id
organization_id       UUID
email                 VARCHAR
full_name             VARCHAR
business_id           UUID      -- FK businesses.id (NULL para creators)
creator_id            UUID      -- FK creators.id (NULL para businesses)
role                  VARCHAR   -- business_owner|creator|marketing_strategist
roles                 VARCHAR[] -- Array de roles
password_hash         VARCHAR   -- bcrypt hash (USADO PELO LOGIN DO PORTAL)
email_verified        BOOLEAN
is_active             BOOLEAN
last_login            TIMESTAMP
last_password_change  TIMESTAMP
permissions           JSONB
preferences           JSONB
```

### audit_logs (registro de acoes)
```sql
organization_id  UUID
entity_type      VARCHAR  -- 'business'|'creator'
entity_id        UUID
action           VARCHAR  -- 'invitation_sent'|'access_granted'|'access_revoked'|'invitation_cancelled'
user_id          UUID     -- Quem executou a acao
metadata         JSONB    -- Detalhes do evento
created_at       TIMESTAMP
```

## VULNERABILIDADES CONHECIDAS

### ✅ CORRIGIDAS (Fev/2026)

1. ~~**Senhas hardcoded no portal**~~ → REMOVIDAS. Apenas bcrypt agora.
2. ~~**Middleware do portal desabilitado**~~ → REABILITADO com cookie `criadores-session`.
3. ~~**JWT decode sem verificacao de assinatura**~~ → Agora usa `supabaseAdmin.auth.getUser()`.
4. ~~**Endpoint cleanup-data sem auth**~~ → Agora requer `CRON_SECRET`.
5. ~~**Supabase keys hardcoded**~~ → Movidas para env vars.
6. ~~**Resend-invite sem rate limiting**~~ → Agora 3/email/hora.
7. ~~**Creator invitation sem autenticacao**~~ → Agora usa requireAdmin().

### PENDENTES

1. **Rate limiting in-memory** (reseta no cold start da Vercel)
   - Solucao: Migrar para Redis/Upstash

3. **Email do creator usa template padrao Supabase** (deveria usar Resend customizado)

4. **localStorage nunca expira** (sessao de 24h so checada client-side + middleware)

## SCRIPTS DE MANUTENCAO

### Deletar usuario e limpar dados
```bash
npx tsx scripts/delete-user-by-email.ts email@exemplo.com
# Deleta de auth.users + limpa businesses.platform_*
```

### Force delete (remove todas referencias)
```bash
npx tsx scripts/force-delete-user.ts email@exemplo.com
# Limpa businesses, creators, platform_users + deleta auth.users
```

### Verificar estado de um usuario
```sql
-- 1. Auth user
SELECT id, email, email_confirmed_at, last_sign_in_at, raw_user_meta_data
FROM auth.users WHERE email = 'email@exemplo.com';

-- 2. Platform user
SELECT id, email, role, business_id, creator_id, is_active, password_hash IS NOT NULL as has_password
FROM platform_users WHERE email = 'email@exemplo.com';

-- 3. Business
SELECT id, name, platform_access_status, platform_auth_user_id, platform_owner_email
FROM businesses WHERE platform_owner_email = 'email@exemplo.com';

-- 4. Creator
SELECT id, name, platform_access_status, platform_auth_user_id
FROM creators WHERE platform_auth_user_id = 'uuid-do-auth-user';
```

## MELHORIAS PENDENTES

### Semana 1-2 (Seguranca)
- [x] Remover senhas hardcoded do portal (fallback login) ✅ Fev/2026
- [x] Reabilitar middleware de rotas protegidas no portal ✅ Fev/2026
- [x] Verificacao JWT com assinatura no set-password ✅ Fev/2026
- [x] Proteger endpoint cleanup-data com CRON_SECRET ✅ Fev/2026
- [x] Mover Supabase keys para env vars ✅ Fev/2026
- [x] Rate limiting no resend-invite ✅ Fev/2026
- [x] Adicionar requireAdmin ao endpoint de convite de creators ✅ Fev/2026
- [ ] Migrar rate limiting para Redis/Upstash (persistente)

### Semana 3-4 (Funcionalidade)
- [ ] Customizar email de convite de creators (usar Resend como business)
- [ ] Pagina de link expirado com reenvio automatico
- [ ] Dashboard de metricas de acesso (convites enviados, aceitos, pendentes)
- [ ] Notificacao in-app quando convite eh aceito

### Futuro
- [ ] 2FA (Two-Factor Authentication)
- [ ] SSO/OAuth (Google, Microsoft)
- [ ] Bulk invitation via CSV
- [ ] Expiracaoo automatica apos X dias sem uso
- [ ] Multi-idioma (PT-BR, EN, ES)

## ARQUIVOS-CHAVE

### CRM (criadores.digital) - Este repo
```
/app/api/businesses/send-custom-invitation/route.ts  -- Envio de convite principal
/app/api/businesses/update-access-status/route.ts     -- Dual auth (CRM + portal)
/app/api/businesses/revoke-access/route.ts            -- Revogacao de acesso
/app/api/businesses/reset-password/route.ts           -- Reset de senha
/app/api/businesses/check-invitation-status/route.ts  -- Status do convite
/app/api/businesses/cancel-invitation/route.ts        -- Cancelar convite
/app/api/businesses/[id]/team/route.ts                -- Multi-user
/app/api/creators/send-invitation/route.ts            -- Convite creator (requireAdmin)
/app/api/platform/sync-password/route.ts              -- Sync senha → platform_users
/app/senha/page.tsx                                   -- Pagina criacao de senha
/app/auth/create-password/page.tsx                    -- Duplicata (deprecated)
/components/InvitationManagementPanel.tsx              -- Painel de gestao
/components/TeamManagementPanel.tsx                    -- Gestao multi-user
/lib/auth/middleware.ts                               -- requireAdmin, requireAuth
/hooks/useAuthenticatedFetch.ts                       -- Adiciona x-user-email
/lib/utils/rate-limit.ts                              -- Rate limiting in-memory
/scripts/delete-user-by-email.ts                      -- Cleanup script
/scripts/force-delete-user.ts                         -- Force cleanup script
```

### Portal (criadores.app) - Repo separado
```
/criadores/app/login/page.tsx                         -- Login page
/criadores/app/onboarding/page.tsx                    -- Onboarding creators
/criadores/app/api/platform/auth/login/route.ts       -- Login via platform_users (bcrypt)
/criadores/app/api/supabase/auth/login/route.ts       -- Fallback (SOMENTE bcrypt, sem hardcoded)
/criadores/app/api/platform/auth/set-password/route.ts -- Define senha onboarding (JWT verificado)
/criadores/store/authStore.ts                         -- Zustand auth store + cookie sync
/criadores/lib/auth.ts                                -- hashPassword, verifyPassword (bcrypt 12)
/criadores/lib/auth-types.ts                          -- Roles e permissoes
/criadores/lib/client-config.ts                       -- Config do modo cliente
/criadores/middleware.ts                              -- Rate limiting + security headers
```

### PRD e Docs
```
/docs/PRD_SISTEMA_ACESSO_CLIENTES.md                  -- PRD completo com 18 problemas
/docs/USER_ROLES.md                                   -- Sistema de roles
```

## REGRA CRITICA: managed_businesses[] (Fev/2026)

O campo `platform_users.managed_businesses` (UUID[]) define quais businesses um strategist pode ver no portal criadores.app. **Se este array estiver vazio, o strategist faz login mas NAO ve nenhum business.**

### Como Funciona

```
platform_users.managed_businesses = ['uuid-business-1', 'uuid-business-2']
                                        ↓
Portal criadores.app → GET /api/strategist/businesses
                                        ↓
Busca businesses por 3 fontes (dedup):
  1. managed_businesses[] do query param (client-sent)
  2. platform_users.managed_businesses[] do banco
  3. businesses.strategist_id = creator_id (legacy fallback)
```

### Quando Preencher managed_businesses

SEMPRE que um strategist for vinculado a um business:
1. **Ao atribuir strategist a business** (`businesses.strategist_id = creator_id`)
2. **Ao criar strategist_contract** com status `active`
3. **Ao enviar convite para creator/strategist**

### Como Preencher (via SQL)

```sql
-- Adicionar business ao managed_businesses
UPDATE platform_users
SET managed_businesses = array_append(
  COALESCE(managed_businesses, '{}'),
  'uuid-do-business'::UUID
),
updated_at = NOW()
WHERE creator_id = 'uuid-do-creator';
```

### Como Preencher (via API de debug)

```bash
curl -X POST https://criadores.digital/api/debug/fix-creator-access \
  -H "Content-Type: application/json" \
  -d '{"creatorId": "uuid-do-creator"}'
```

Este endpoint busca automaticamente todos businesses vinculados (via `strategist_id` e `strategist_contracts`) e popula `managed_businesses`.

### Diagnóstico de Acesso

```bash
# Verificar estado completo de um creator
curl "https://criadores.digital/api/debug/creator-access?creatorId=UUID&businessId=UUID"
```

Retorna: creator data, auth user, platform_user, external_user, linked businesses, contracts, e diagnostico automatico.

## TRIGGERS EM auth.users (Migration 503)

Existem 2 triggers ativos em `auth.users` que podem causar "Database error granting user":

1. **`on_auth_user_created`** → `sync_auth_user_to_platform_users()` (AFTER INSERT OR UPDATE)
   - Cria/atualiza platform_users baseado em raw_user_meta_data
   - Tem EXCEPTION WHEN OTHERS para nao bloquear auth

2. **`sync_auth_login_to_creator_trigger`** → `sync_auth_login_to_creator()` (AFTER UPDATE)
   - Atualiza `creators.platform_last_login_at`
   - Tem EXCEPTION WHEN OTHERS (adicionado na migration 503)

**REGRA**: Todos os triggers em auth.users DEVEM ter `EXCEPTION WHEN OTHERS THEN RETURN NEW` para nunca bloquear o Supabase Auth.

## Quando Usar Este Agente

- Enviar convites para businesses ou creators
- Debugar problemas de login no portal criadores.app
- Investigar dessincronizacao de senhas (auth.users vs platform_users)
- **Diagnosticar strategist sem acesso a business (managed_businesses vazio)**
- Revogar ou reativar acessos
- Gerenciar equipe multi-user
- Corrigir vulnerabilidades de seguranca no sistema de acesso
- Implementar novos fluxos de convite
- Entender o fluxo completo de ponta a ponta (CRM → email → /senha → portal login)
- **Corrigir triggers em auth.users que bloqueiam Supabase Auth**
