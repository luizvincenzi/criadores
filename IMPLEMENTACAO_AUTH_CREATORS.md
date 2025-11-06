# 🎉 Implementação de Autenticação para Creators

## ✅ O que foi implementado

### 1. Página de Callback de Autenticação
**Arquivo**: `app/auth/callback/page.tsx`

Esta página processa o callback do Supabase Auth e redireciona para a página apropriada:
- `type=invite` → Redireciona para `/onboarding`
- `type=recovery` → Redireciona para `/reset-password`
- Login normal → Redireciona para `/dashboard`
- Erro → Redireciona para `/login` com mensagem de erro

### 2. Página de Onboarding Atualizada
**Arquivo**: `app/onboarding/page.tsx`

Agora suporta tanto **business owners** quanto **creators**:
- Detecta o `entity_type` do token JWT
- Extrai `creator_id` para creators
- Extrai `business_id` para business owners
- Mostra informações apropriadas no formulário

### 3. API Set Password Atualizada
**Arquivo**: `app/api/platform/auth/set-password/route.ts`

Agora suporta creators:
- Detecta `entity_type` para diferenciar business de creator
- Adiciona `creator_id` ao criar usuário creator
- Configura permissões apropriadas para creators
- Mantém compatibilidade com business owners

### 4. Scripts de Convite
**Arquivos**: 
- `scripts/invite-creator.ts`
- `scripts/invite-business-owner.ts`

Scripts para facilitar o envio de convites:
```bash
# Enviar convite para creator
npm run invite-creator

# Enviar convite para business owner
npm run invite-business
```

### 5. Documentação
**Arquivo**: `CONFIGURACAO_SUPABASE_AUTH_CALLBACK.md`

Documentação completa sobre:
- Como configurar Redirect URLs no Supabase
- Fluxo de autenticação para business e creators
- Como enviar convites
- Troubleshooting

## 🔧 Configuração Necessária no Supabase

### ⚠️ URGENTE: Configure as Redirect URLs

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** → **URL Configuration**
4. Configure:

**Site URL**:
```
https://www.criadores.app
```

**Redirect URLs** (adicione todas):
```
https://www.criadores.app/auth/callback
https://criadores.app/auth/callback
http://localhost:3000/auth/callback
```

## 📋 Como Usar

### Enviar Convite para Creator

#### Opção 1: Via Script (Recomendado)
1. Edite `scripts/invite-creator.ts` com os dados do creator:
   ```typescript
   const creatorEmail = 'creator@email.com';
   const creatorFullName = 'Nome do Creator';
   const creatorId = 'uuid-do-creator'; // UUID da tabela creators
   ```

2. Execute:
   ```bash
   npm run invite-creator
   ```

#### Opção 2: Via Supabase Dashboard
1. Acesse **Authentication** → **Users**
2. Clique em **Invite User**
3. Preencha:
   - **Email**: email do creator
   - **Redirect URL**: `https://www.criadores.app/auth/callback`
   - **User Metadata**:
     ```json
     {
       "full_name": "Nome do Creator",
       "creator_id": "uuid-do-creator",
       "role": "creator",
       "entity_type": "creator"
     }
     ```

### Enviar Convite para Business Owner

#### Opção 1: Via Script (Recomendado)
1. Edite `scripts/invite-business-owner.ts` com os dados do business:
   ```typescript
   const ownerEmail = 'owner@email.com';
   const ownerFullName = 'Nome do Owner';
   const businessId = 'uuid-do-business'; // UUID da tabela businesses
   ```

2. Execute:
   ```bash
   npm run invite-business
   ```

#### Opção 2: Via Supabase Dashboard
1. Acesse **Authentication** → **Users**
2. Clique em **Invite User**
3. Preencha:
   - **Email**: email do owner
   - **Redirect URL**: `https://www.criadores.app/auth/callback`
   - **User Metadata**:
     ```json
     {
       "full_name": "Nome do Owner",
       "business_name": "Nome da Empresa",
       "business_id": "uuid-do-business",
       "role": "business_owner",
       "entity_type": "business"
     }
     ```

## 🔄 Fluxo Completo

### Para Creators:
1. ✅ Admin executa `npm run invite-creator`
2. ✅ Creator recebe email com link
3. ✅ Clica no link → `https://www.criadores.app/auth/callback#access_token=...&type=invite`
4. ✅ `/auth/callback` detecta `type=invite` → Redireciona para `/onboarding`
5. ✅ `/onboarding` mostra formulário com dados do creator
6. ✅ Creator cria senha
7. ✅ API `/api/platform/auth/set-password` cria usuário em `platform_users`
8. ✅ Login automático via Supabase Auth
9. ✅ Redireciona para `/dashboard`
10. ✅ Dashboard redireciona para `/campanhas-criador` (baseado no role)

### Para Business Owners:
1. ✅ Admin executa `npm run invite-business`
2. ✅ Owner recebe email com link
3. ✅ Clica no link → `https://www.criadores.app/auth/callback#access_token=...&type=invite`
4. ✅ `/auth/callback` detecta `type=invite` → Redireciona para `/onboarding`
5. ✅ `/onboarding` mostra formulário com dados do business
6. ✅ Owner cria senha
7. ✅ API `/api/platform/auth/set-password` cria usuário em `platform_users`
8. ✅ Login automático via Supabase Auth
9. ✅ Redireciona para `/dashboard`
10. ✅ Dashboard redireciona para `/dashboard/empresa` (baseado no role)

## 🐛 Troubleshooting

### Problema: Link redireciona para home em vez de /auth/callback
**Causa**: Redirect URLs não configuradas no Supabase
**Solução**: Configure as Redirect URLs conforme instruções acima

### Problema: Erro 404 em /auth/callback
**Causa**: Arquivo não foi criado ou não foi deployado
**Solução**: Verifique se `app/auth/callback/page.tsx` existe e faça deploy

### Problema: Não redireciona para /onboarding
**Causa**: `type=invite` não está sendo detectado
**Solução**: Verifique os logs do console no navegador

### Problema: Erro ao criar senha
**Causa**: Dados do token inválidos ou API com erro
**Solução**: Verifique os logs da API `/api/platform/auth/set-password`

### Problema: Creator_id não está sendo salvo
**Causa**: `creator_id` não foi enviado no user_metadata do convite
**Solução**: Verifique se o convite foi enviado com o `creator_id` correto

## 📊 Logs de Debug

A aplicação possui logs detalhados em cada etapa:

```
🔐 [Auth Callback] Processando callback...
🎉 [Auth Callback] Convite detectado, redirecionando para onboarding
🔐 [Onboarding] Hash params: { accessToken: '✅ Presente', type: 'invite' }
📋 [Onboarding] Dados do token: { email, user_metadata }
📋 [Onboarding] Tipo de entidade: creator
🔐 [Set Password] Iniciando criação de senha para: email@example.com
📋 [Set Password] Tipo de entidade: creator Role: creator
✅ [Set Password] Senha atualizada com sucesso
🔐 [Onboarding] Iniciando login automático via Supabase Auth...
✅ [Onboarding] Login completo realizado
```

## 🔒 Segurança

- ✅ Token JWT validado em cada etapa
- ✅ Senha com hash bcrypt (12 rounds)
- ✅ Validação de email obrigatória
- ✅ Redirect URLs whitelist no Supabase
- ✅ HTTPS obrigatório em produção
- ✅ `entity_type` validado para evitar confusão entre business e creator
- ✅ IDs (creator_id, business_id) validados antes de salvar

## 📝 Arquivos Modificados/Criados

### Novos Arquivos:
- ✅ `app/auth/callback/page.tsx`
- ✅ `scripts/invite-creator.ts`
- ✅ `scripts/invite-business-owner.ts`
- ✅ `CONFIGURACAO_SUPABASE_AUTH_CALLBACK.md`
- ✅ `IMPLEMENTACAO_AUTH_CREATORS.md`

### Arquivos Modificados:
- ✅ `app/onboarding/page.tsx` - Suporte para creators
- ✅ `app/api/platform/auth/set-password/route.ts` - Suporte para creators
- ✅ `package.json` - Novos scripts

## 🎯 Próximos Passos

1. **Configure as Redirect URLs no Supabase Dashboard** (URGENTE)
2. Teste o fluxo completo com um creator real
3. Verifique se o login automático funciona
4. Teste o acesso ao dashboard após login
5. Verifique se o creator é redirecionado para `/campanhas-criador`

## ✅ Checklist de Implementação

- [x] Criar página `/auth/callback`
- [x] Atualizar página `/onboarding` para suportar creators
- [x] Atualizar API `/api/platform/auth/set-password` para suportar creators
- [x] Criar script `invite-creator.ts`
- [x] Criar script `invite-business-owner.ts`
- [x] Adicionar scripts ao `package.json`
- [x] Criar documentação completa
- [ ] **Configurar Redirect URLs no Supabase** (VOCÊ PRECISA FAZER)
- [ ] Testar fluxo completo com creator
- [ ] Testar fluxo completo com business owner

## 🎉 Resultado Final

Após configurar as Redirect URLs no Supabase, o sistema estará 100% funcional para:
- ✅ Enviar convites para creators
- ✅ Enviar convites para business owners
- ✅ Processar callback de autenticação
- ✅ Criar senha no onboarding
- ✅ Login automático
- ✅ Redirecionamento para dashboard apropriado

