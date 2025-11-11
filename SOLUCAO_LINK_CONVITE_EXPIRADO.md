# 🔧 Solução: Link de Convite Expirado

## 📋 Problema Identificado

Quando um business owner ou creator recebia um convite por email e clicava no link pela **segunda vez** (após fechar a página), o sistema mostrava um erro:

```
https://www.criadores.app/login#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

**Mensagem de erro:** "Acesso restrito a usuários autorizados"

### Por que isso acontecia?

O Supabase Auth gera links de convite com **tokens de uso único** (OTP - One Time Password). Após o primeiro clique:
- ✅ **Primeira vez**: Token válido → Redireciona para `/onboarding`
- ❌ **Segunda vez**: Token expirado → Erro `otp_expired`

---

## ✅ Solução Implementada

### 1. **Detecção Automática de Link Expirado**

Na página de login (`app/login/page.tsx`), adicionamos detecção do erro `otp_expired`:

```typescript
// Detectar link de convite expirado
if (errorType === 'access_denied' && errorCode === 'otp_expired') {
  console.log('⚠️ [Login] Link de convite expirado detectado');
  setInviteExpired(true);
  setError('O link de ativação expirou ou já foi utilizado. Solicite um novo link abaixo.');
  // Limpar o hash da URL
  window.history.replaceState(null, '', window.location.pathname);
  return;
}
```

### 2. **Botão de Reenvio de Convite**

Quando o link expira, mostramos automaticamente um botão para solicitar novo link:

```typescript
{inviteExpired && (
  <Button
    type="button"
    variant="secondary"
    size="lg"
    loading={resendingInvite}
    className="w-full"
    onClick={handleResendInvite}
    disabled={resendingInvite || !email}
  >
    {resendingInvite ? 'Enviando...' : '📧 Solicitar Novo Link de Ativação'}
  </Button>
)}
```

### 3. **API de Reenvio de Convite**

Criamos uma nova API em `app/api/platform/auth/resend-invite/route.ts` que:

1. ✅ Verifica se o usuário existe no Supabase Auth
2. ✅ Verifica se o usuário já completou o onboarding (já tem senha)
3. ✅ Reenvia o convite com os mesmos metadados originais
4. ✅ Retorna mensagem de sucesso ou erro apropriada

```typescript
// Reenviar convite via Supabase Admin API
const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
  email,
  {
    redirectTo: 'https://www.criadores.app/auth/callback',
    data: {
      ...userMetadata,
      email_verified: true,
      invited_at: new Date().toISOString()
    }
  }
);
```

---

## 🎯 Fluxo Completo Agora

### Cenário 1: Primeira vez clicando no link
1. ✅ Usuário recebe email com link de convite
2. ✅ Clica no link
3. ✅ Redireciona para `/onboarding`
4. ✅ Cria senha
5. ✅ Login automático
6. ✅ Acessa dashboard

### Cenário 2: Segunda vez clicando no link (ANTES - PROBLEMA)
1. ❌ Usuário clica no link novamente
2. ❌ Mostra erro "access_denied"
3. ❌ Usuário fica perdido sem saber o que fazer

### Cenário 2: Segunda vez clicando no link (AGORA - SOLUÇÃO)
1. ✅ Usuário clica no link novamente
2. ✅ Sistema detecta que o link expirou
3. ✅ Mostra mensagem amigável: "O link de ativação expirou ou já foi utilizado"
4. ✅ Mostra botão: "📧 Solicitar Novo Link de Ativação"
5. ✅ Usuário digita seu email
6. ✅ Clica no botão
7. ✅ Recebe novo email com link válido
8. ✅ Clica no novo link
9. ✅ Redireciona para `/onboarding`
10. ✅ Cria senha e acessa o sistema

---

## 🔒 Segurança

### Validações Implementadas:

1. **Email obrigatório**: Não permite reenvio sem email
2. **Usuário deve existir**: Verifica se o usuário foi convidado anteriormente
3. **Não reenvia se já ativo**: Se o usuário já criou senha, não reenvia convite
4. **Preserva metadados**: Mantém todas as informações originais (business_id, role, etc.)
5. **Service Role**: Usa credenciais de admin apenas no servidor

### Mensagens de Erro Apropriadas:

- ❌ **Usuário não encontrado**: "Usuário não encontrado. Entre em contato com o administrador."
- ❌ **Já completou onboarding**: "Sua conta já está ativa. Use o formulário de login acima para acessar."
- ❌ **Erro no servidor**: "Erro ao reenviar convite. Tente novamente mais tarde."

---

## 📊 Estados da UI

### Estado 1: Login Normal
```
┌─────────────────────────────┐
│  Email: [____________]      │
│  Senha: [____________]      │
│  [Entrar]                   │
└─────────────────────────────┘
```

### Estado 2: Link Expirado Detectado
```
┌─────────────────────────────┐
│  ⚠️ O link de ativação      │
│  expirou ou já foi          │
│  utilizado.                 │
│                             │
│  Email: [____________]      │
│  Senha: [____________]      │
│  [Entrar]                   │
│                             │
│  [📧 Solicitar Novo Link]   │
└─────────────────────────────┘
```

### Estado 3: Reenviando Convite
```
┌─────────────────────────────┐
│  Email: [____________]      │
│  Senha: [____________]      │
│  [Entrar]                   │
│                             │
│  [⏳ Enviando...]           │
└─────────────────────────────┘
```

### Estado 4: Convite Reenviado com Sucesso
```
┌─────────────────────────────┐
│  ✅ Novo link de ativação   │
│  enviado! Verifique seu     │
│  email.                     │
│                             │
│  Email: [____________]      │
│  Senha: [____________]      │
│  [Entrar]                   │
└─────────────────────────────┘
```

---

## 🧪 Como Testar

### Teste 1: Link Expirado
1. Envie um convite para um novo usuário
2. Copie o link do email
3. Clique no link (deve funcionar normalmente)
4. **Feche a página SEM criar senha**
5. Cole o link novamente no navegador
6. ✅ Deve mostrar mensagem de link expirado
7. ✅ Deve mostrar botão de reenvio

### Teste 2: Reenvio de Convite
1. Na tela de link expirado
2. Digite o email do usuário
3. Clique em "Solicitar Novo Link de Ativação"
4. ✅ Deve mostrar mensagem de sucesso
5. ✅ Deve receber novo email
6. ✅ Novo link deve funcionar normalmente

### Teste 3: Usuário Já Ativo
1. Complete o onboarding (crie senha)
2. Tente solicitar novo link
3. ✅ Deve mostrar: "Sua conta já está ativa. Use o formulário de login acima."

---

## 📁 Arquivos Modificados

### 1. `app/login/page.tsx`
- ✅ Adicionada detecção de `otp_expired`
- ✅ Adicionado estado `inviteExpired`
- ✅ Adicionada função `handleResendInvite()`
- ✅ Adicionado botão de reenvio
- ✅ Adicionadas mensagens de sucesso/erro

### 2. `app/api/platform/auth/resend-invite/route.ts` (NOVO)
- ✅ Endpoint POST para reenviar convites
- ✅ Validação de email
- ✅ Verificação de usuário existente
- ✅ Verificação de onboarding completo
- ✅ Reenvio via Supabase Admin API

---

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras:

1. **Rate Limiting**: Limitar número de reenvios por hora
2. **Log de Reenvios**: Registrar quando convites são reenviados
3. **Email Customizado**: Personalizar mensagem do email de reenvio
4. **Expiração Configurável**: Permitir configurar tempo de expiração do link
5. **Notificação Admin**: Notificar admin quando muitos reenvios ocorrem

---

## ✅ Resultado Final

Agora, **não importa quantas vezes** o usuário clicar no link de convite:

- ✅ **Primeira vez**: Funciona normalmente
- ✅ **Segunda vez em diante**: Mostra opção de solicitar novo link
- ✅ **Experiência do usuário**: Muito melhor, sem frustração
- ✅ **Suporte**: Menos tickets de "link não funciona"
- ✅ **Autonomia**: Usuário resolve sozinho sem precisar de admin

**Problema resolvido! 🎉**

