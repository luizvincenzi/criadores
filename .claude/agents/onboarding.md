# Agente de Onboarding & Acesso a Plataforma

Este agente documenta TODO o processo de liberacao de acesso, convite, criacao de senha e ativacao de usuarios na plataforma criadores.app. Envolve dois projetos que trabalham juntos.

## Visao Geral da Arquitetura

```
CRM (criadores.digital)                  Plataforma (criadores.app)
[Admin cria/convida usuario]  ------>    [Usuario recebe email]
[Supabase Auth invite]        ------>    [Redirect /auth/callback]
[Grava em creators/businesses] ------>   [Onboarding: cria senha]
[Trigger sync platform_users] ------>   [Login com bcrypt]
```

**Projeto CRM (crmcriadores):** Onde o admin INICIA o processo
**Projeto Plataforma (criadores):** Onde o usuario COMPLETA o processo

---

## 1. FLUXO COMPLETO: CONVIDAR MARKETING STRATEGIST

### Passo 1 - CRM: Admin cria creator e envia convite

**Pagina:** `/creators` (crmcriadores)
**Componente:** `AddCreatorModal`
**API:** `POST /api/creators/send-invitation`

**O que acontece:**
1. Admin cria creator com `is_strategist: true`
2. Clica em "Enviar Convite" na lista de creators
3. API chama `supabaseAdmin.auth.admin.inviteUserByEmail()`:
   ```typescript
   await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
     redirectTo: 'https://www.criadores.app/auth/callback',
     data: {
       full_name: creatorName,
       creator_id: creatorId,
       role: 'marketing_strategist', // ou 'creator'
       entity_type: 'creator',
       invited_at: new Date().toISOString()
     }
   });
   ```
4. Atualiza tabela `creators`:
   - `platform_access_status = 'pending'`
   - `platform_invitation_sent_at = NOW()`
   - `platform_invitation_sent_by = sentBy`
5. Rate limit: nao permite reenvio dentro de 24h

**Arquivo CRM:** `/app/api/creators/send-invitation/route.ts`

### Passo 2 - Plataforma: Creator recebe email e clica no link

**Destino do link:** `https://www.criadores.app/auth/callback#access_token=...&type=invite`

**Pagina de login detecta o convite:**
```
/login -> detecta hash com type=invite
       -> redireciona para /onboarding com o hash
```

**Se o link expirou:**
- Detecta `error=access_denied&error_code=otp_expired`
- Salva email no localStorage
- Mostra botao "Solicitar Novo Link de Ativacao"
- Chama `/api/platform/auth/resend-invite`

**Arquivo:** `/app/login/page.tsx`

### Passo 3 - Plataforma: Onboarding (criacao de senha)

**Pagina:** `/onboarding`
**API check:** `POST /api/platform/auth/check-onboarding` (verifica se ja tem password_hash)

**O que acontece:**
1. Carrega sessao Supabase Auth do token no hash
2. Extrai metadata: email, full_name, creator_id, role, entity_type
3. Usuario digita senha (min 8 chars) + confirmacao
4. Chama `POST /api/platform/auth/set-password`:
   - Decodifica JWT access_token para extrair user ID
   - Atualiza senha no Supabase Auth (admin API)
   - Gera bcrypt hash (12 salt rounds)
   - Se platform_user JA existe: atualiza password_hash, is_active, email_verified
   - Se NAO existe: cria novo platform_user com todos os dados
   - Invalida activation_tokens (marca used_at)
5. Auto-login: espera 1s, faz login automatico, redireciona para /dashboard

**Arquivos:**
- `/app/onboarding/page.tsx`
- `/app/api/platform/auth/set-password/route.ts`
- `/app/api/platform/auth/check-onboarding/route.ts`

---

## 2. FLUXO COMPLETO: CONVIDAR BUSINESS OWNER

### Passo 1 - CRM: Admin envia convite para empresa

**Pagina:** `/negocios/empresas/[id]` (crmcriadores)
**Componente:** `InvitationManagementPanel`
**APIs disponiveis:**
- `POST /api/businesses/send-invitation` (via Supabase Auth email)
- `POST /api/businesses/send-custom-invitation` (via Resend com HTML customizado)

**Fluxo via send-invitation:**
1. Valida business existe
2. Se authUserId ja existe mas NAO confirmou email: reenvia invite
3. Se usuario NOVO:
   - Cria user no Supabase Auth: `auth.admin.createUser()`
   - Gera link de recovery: `auth.admin.generateLink({type: 'recovery'})`
   - Envia email de reset: `auth.resetPasswordForEmail()`
4. Atualiza tabela `businesses`:
   - `platform_auth_user_id = userId`
   - `platform_invitation_sent_at = NOW()`
   - `platform_access_status = 'pending'`
   - `platform_owner_email = ownerEmail`
   - `platform_owner_name = ownerName`

**Fluxo via send-custom-invitation (Resend):**
1. Cria/atualiza user no Supabase Auth
2. Gera link de recovery
3. Envia email HTML customizado via Resend API:
   - From: `Equipe Criadores <contato@criadores.digital>`
   - Subject: Convite para Acessar a Plataforma Criadores
   - Template com logo, botao CTA, detalhes do business

**Arquivos CRM:**
- `/app/api/businesses/send-invitation/route.ts`
- `/app/api/businesses/send-custom-invitation/route.ts`
- `/components/InvitationManagementPanel.tsx`

### Passo 2 - Plataforma: Business owner recebe email

**Para send-invitation:** Link redireciona para `/senha` (pagina de criacao de senha)
**Para send-custom-invitation:** Link redireciona para `/senha` (via recovery link)

### Passo 3 - Plataforma: Criacao de senha

**Pagina:** `/senha`

**O que acontece:**
1. Extrai access_token + refresh_token do URL hash
2. Seta sessao Supabase com os tokens
3. Usuario digita senha + confirmacao
4. No submit:
   - Atualiza senha no Supabase Auth
   - Atualiza metadata (email_verified, password_set_at)
   - Chama `/api/platform/auth/update-password-hash` para sincronizar bcrypt hash no platform_users
5. Redireciona para login apos 2 segundos

**Arquivo:** `/app/senha/page.tsx`

---

## 3. FLUXO ALTERNATIVO: ATIVACAO POR TOKEN

**Pagina:** `/activate/[token]`

Usado quando platform_user foi criado com um `activation_token` (tabela `activation_tokens`).

**Fluxo:**
1. Token extraido da URL
2. Valida via `POST /api/platform/auth/validate-activation-token`:
   - Token existe em `activation_tokens`
   - `used_at` IS NULL (nao foi usado)
   - `expires_at` nao passou (se definido)
   - Usuario existe em `platform_users`
3. Mostra formulario de senha
4. Submit via `POST /api/platform/auth/activate-account`:
   - Valida token novamente
   - Atualiza senha no Supabase Auth
   - Gera bcrypt hash
   - Salva em platform_users
   - Marca token como usado (`used_at = NOW()`)
5. Auto-login e redirect para /dashboard

**Arquivos:**
- `/app/activate/[token]/page.tsx`
- `/app/api/platform/auth/validate-activation-token/route.ts`
- `/app/api/platform/auth/activate-account/route.ts`

---

## 4. ATRIBUIR STRATEGIST A UM BUSINESS

**Pagina CRM:** `/negocios/empresas/[id]`
**Componente:** `BusinessInfoTab` com `StrategistSelector`
**API:** `PATCH /api/businesses/[id]`

**O que acontece:**
1. Admin seleciona estrategista no dropdown
2. PATCH atualiza `businesses`:
   - `has_strategist = true`
   - `strategist_id = creatorId`
3. Sincroniza `platform_users`:
   - Atualiza role para `marketing_strategist`
   - Atualiza roles array para `['creator', 'marketing_strategist']`

**IMPORTANTE:** O campo `managed_businesses[]` no `platform_users` e a fonte de verdade para quais businesses o estrategista pode gerenciar. Mas a atribuicao automatica deste array NAO esta totalmente implementada. Hoje e necessario adicionar manualmente os business IDs ao array.

---

## 5. SISTEMA DE AUTENTICACAO (LOGIN)

**Pagina:** `/login`
**API:** `POST /api/platform/auth/login`
**Store:** Zustand em `criadores-auth-storage` (localStorage)

**Fluxo de login:**
1. Usuario envia email (convertido para lowercase) + senha
2. API busca em `platform_users` por email + org (DEFAULT_ORG)
3. Filtra apenas `is_active = true`
4. Validacao de senha (3 camadas):
   - **Camada 1:** bcrypt compare com `password_hash` (se existe)
   - **Camada 2:** Fallback para credenciais hardcoded (usuarios conhecidos durante transicao)
   - **Camada 3:** Rejeita se nenhum match
5. Atualiza `last_login` no sucesso
6. Retorna objeto user completo
7. AuthStore persiste sessao com expiracao de 24h

**Fallback CRM:** Se login em platform_users falha, tenta `/api/supabase/auth/login` (tabela `users` do CRM)

**Arquivo:** `/app/api/platform/auth/login/route.ts`

---

## 6. TABELAS DO BANCO (Supabase)

### platform_users (fonte de verdade para auth)
```
id                    UUID PK (= creator_id quando creator)
email                 VARCHAR (lowercase, unique por org)
full_name             VARCHAR
password_hash         TEXT (bcrypt, 12 salt rounds)
role                  ENUM: creator | marketing_strategist | business_owner
roles                 ARRAY de roles
creator_id            UUID FK -> creators
business_id           UUID FK -> businesses
managed_businesses    UUID[] (businesses do strategist)
is_active             BOOLEAN
email_verified        BOOLEAN
last_login            TIMESTAMP
last_password_change  TIMESTAMP
organization_id       UUID (sempre DEFAULT_ORG)
```

### activation_tokens
```
id          UUID PK
email       TEXT NOT NULL
token       TEXT NOT NULL UNIQUE
user_id     UUID FK -> platform_users
expires_at  TIMESTAMP (opcional)
used_at     TIMESTAMP (NULL = nao usado)
created_at  TIMESTAMP
```

### creators (campos de plataforma)
```
platform_access_status       VARCHAR: pending | granted | denied | suspended | revoked
platform_email               VARCHAR
platform_password_hash       TEXT
platform_roles               ARRAY
platform_invitation_sent_at  TIMESTAMP
platform_auth_user_id        UUID (link para Supabase Auth)
is_strategist                BOOLEAN
```

### businesses (campos de plataforma)
```
platform_access_status       VARCHAR: pending | granted
platform_owner_email         VARCHAR
platform_owner_name          VARCHAR
platform_invitation_sent_at  TIMESTAMP
platform_auth_user_id        UUID (link para Supabase Auth)
```

### platform_access_audit
```
Logs de auditoria de acessos: action, resource_type, IP, user_agent
```

---

## 7. TRIGGERS E SYNC AUTOMATICO

### sync_creator_to_platform_user (Migration 030/033)
**Dispara quando:** `creators.platform_access_status` muda para `'granted'`
**Faz:**
- Cria registro em `platform_users` com MESMO UUID do creator
- Sincroniza email, password_hash, roles
- Define is_active = true

### sync_business_to_platform_user (Migration 030)
**Dispara quando:** `businesses.platform_access_status` muda para `'granted'`
**Faz:**
- Cria platform_user(s) para owner e additional_users
- Define role = business_owner

---

## 8. ENVIO DE EMAILS

### Via Supabase Auth (send-invitation)
- Usa template padrao do Supabase
- Convite com magic link
- Redirect para `/auth/callback`

### Via Resend (send-custom-invitation)
- Email HTML customizado
- From: `Equipe Criadores <contato@criadores.digital>`
- Template com branding, logo, botao CTA
- Link de recovery do Supabase Auth

### Via Supabase Auth (resetPasswordForEmail)
- Email padrao de reset de senha
- Redirect para `/senha`

---

## 9. DIAGNOSTICO DE PROBLEMAS

### Usuario diz "nao recebi o email"
1. Verificar em `creators` ou `businesses` se `platform_invitation_sent_at` foi preenchido
2. Verificar se email esta correto em `platform_owner_email` ou `platform_email`
3. Verificar spam/lixo eletronica
4. Reenviar via CRM ou via `/api/platform/auth/resend-invite`

### Usuario diz "link expirou"
1. Links do Supabase Auth expiram (tipicamente 24h)
2. A pagina de login detecta automaticamente e oferece reenvio
3. Ou reenviar pelo CRM

### Usuario diz "acesso negado" apos login
1. Verificar `platform_users.is_active = true`
2. Verificar `platform_users.role` e `roles[]` estao corretos
3. Para strategists: verificar `managed_businesses[]` contem os business IDs certos
4. Para business_owners: verificar `business_id` esta preenchido
5. Verificar se `password_hash` existe (se NULL, onboarding nao foi concluido)

### Usuario duplicado
Existe caso real: `financeiro.brooftop@gmail.com` com espaco no final criou registro duplicado.
- Verificar emails com espacos: `SELECT * FROM platform_users WHERE email LIKE '% '`
- Limpar duplicatas mantendo o que tem password_hash

### Strategist nao ve businesses
1. Verificar `managed_businesses[]` em platform_users
2. Verificar `businesses.strategist_id` = `creators.id` (fallback legacy)
3. API `/api/strategist/businesses` usa 3 fontes com deduplicacao

### Onboarding nao completa
1. Verificar se `password_hash` ficou NULL em platform_users
2. Verificar se token do email esta valido (nao expirado)
3. Verificar `activation_tokens.used_at` - se ja foi marcado como usado
4. Tentar fluxo alternativo: `/activate/[token]`

---

## 10. QUERIES UTEIS PARA DEBUG (via Supabase MCP)

### Ver todos os platform_users e status
```sql
SELECT id, email, full_name, role, roles, is_active, email_verified,
       password_hash IS NOT NULL as has_password,
       business_id, creator_id, managed_businesses, last_login
FROM platform_users ORDER BY created_at DESC;
```

### Ver convites pendentes (creators)
```sql
SELECT id, name, platform_email, platform_access_status,
       platform_invitation_sent_at, platform_auth_user_id
FROM creators
WHERE platform_access_status = 'pending'
ORDER BY platform_invitation_sent_at DESC;
```

### Ver convites pendentes (businesses)
```sql
SELECT id, name, platform_owner_email, platform_owner_name,
       platform_access_status, platform_invitation_sent_at
FROM businesses
WHERE platform_access_status = 'pending'
ORDER BY platform_invitation_sent_at DESC;
```

### Ver tokens de ativacao
```sql
SELECT id, email, token, user_id, expires_at, used_at
FROM activation_tokens
ORDER BY created_at DESC;
```

### Encontrar emails duplicados ou com espaco
```sql
SELECT email, COUNT(*) as count
FROM platform_users
GROUP BY email HAVING COUNT(*) > 1;

SELECT id, email, full_name FROM platform_users WHERE email LIKE '% ';
```

### Verificar se strategist tem managed_businesses corretos
```sql
SELECT pu.email, pu.full_name, pu.managed_businesses,
       array_agg(b.name) as business_names
FROM platform_users pu
LEFT JOIN businesses b ON b.id = ANY(pu.managed_businesses)
WHERE pu.role = 'marketing_strategist'
GROUP BY pu.id;
```

---

## 11. MAPA DE ARQUIVOS

### Plataforma (criadores.app)
| Arquivo | Funcao |
|---------|--------|
| `/app/login/page.tsx` | Login + deteccao de convites |
| `/app/onboarding/page.tsx` | Criacao de senha (via Supabase Auth invite) |
| `/app/activate/[token]/page.tsx` | Ativacao via token (activation_tokens) |
| `/app/senha/page.tsx` | Reset/criacao de senha (via recovery link) |
| `/app/api/platform/auth/login/route.ts` | API de login (bcrypt + fallback) |
| `/app/api/platform/auth/set-password/route.ts` | API criar senha (onboarding) |
| `/app/api/platform/auth/activate-account/route.ts` | API ativar conta (token) |
| `/app/api/platform/auth/validate-activation-token/route.ts` | API validar token |
| `/app/api/platform/auth/check-onboarding/route.ts` | API verificar onboarding |
| `/app/api/platform/auth/resend-invite/route.ts` | API reenviar convite |
| `/store/authStore.ts` | Estado de auth (Zustand + localStorage) |

### CRM (crmcriadores)
| Arquivo | Funcao |
|---------|--------|
| `/app/api/creators/send-invitation/route.ts` | Enviar convite para creator |
| `/app/api/businesses/send-invitation/route.ts` | Enviar convite para business (Supabase Auth) |
| `/app/api/businesses/send-custom-invitation/route.ts` | Enviar convite para business (Resend HTML) |
| `/app/api/platform-users/create/route.ts` | Criar platform_user direto |
| `/app/api/businesses/check-invitation-status/route.ts` | Verificar status do convite |
| `/app/api/businesses/update-access-status/route.ts` | Atualizar status de acesso |
| `/components/InvitationManagementPanel.tsx` | UI de gerenciar convites (business) |
| `/components/AddCreatorModal.tsx` | UI de criar creator/strategist |
| `/components/BusinessDetailPage/tabs/BusinessInfoTab.tsx` | UI de atribuir strategist |

### Migrations relevantes
| Migration | Funcao |
|-----------|--------|
| `029_create_platform_users.sql` | Schema da tabela platform_users |
| `030_add_platform_access_control_FIXED.sql` | Triggers de sync, campos platform_* |
| `031_create_business_content_social.sql` | Tabela de conteudo (usa platform_users) |
| `033_fix_creator_platform_sync.sql` | Fix do trigger de sync |
| `081_add_password_hash_to_platform_users.sql` | Campos de senha e verificacao |

---

## 12. DADOS REAIS DO BANCO (Snapshot Fev/2026)

### Platform users ativos com senha
- Luana Ribeiro (creator) - ultimo login 06/02/2026
- Barbara Gonzales (creator) - ultimo login 02/02/2026
- Kau Theodoro (marketing_strategist) - ultimo login 13/01/2026
- Roberson (business_owner) - ultimo login 12/11/2025
- Nathalia (business_owner) - ultimo login 11/11/2025
- LUIZ TESTE (business_owner) - ultimo login 27/11/2025

### Platform users SEM senha (onboarding pendente)
- Julie Camarao (creator) - sem password, sem login
- Luiz Vincenzi/connectcityops (business_owner) - sem password
- Cris/financeiro.brooftop (business_owner) - DUPLICADO (com e sem espaco no email)

### Businesses com convite enviado
- Aconchego Pet2 - status: granted
- Bread King Londrina - status: granted
- Faborelo - status: granted
- Roberson Gomes Consorcios - status: granted

### Businesses com convite pendente
- John O Groats, Seu Vendrame, Lavih Spa, UniCV, TUR360 - sem convite enviado

---

## 13. PROBLEMAS CONHECIDOS

1. **Email duplicado com espaco:** `financeiro.brooftop@gmail.com` existe 2x (com e sem trailing space)
2. **managed_businesses nao auto-populado:** Quando strategist e atribuido a novo business, o array nao e atualizado automaticamente
3. **Credenciais hardcoded:** Login API tem fallback com senhas em texto plano no codigo (risco de seguranca)
4. **Dupla autenticacao:** Sistema usa TANTO Supabase Auth QUANTO platform_users com bcrypt. Podem ficar dessincronizados
5. **Triggers podem falhar silenciosamente:** Se o trigger `sync_creator_to_platform_user` falhar, o platform_user nao e criado
