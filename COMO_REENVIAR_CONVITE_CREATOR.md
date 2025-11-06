# 🔧 Como Reenviar Convite para Creator

## ✅ Correções Implementadas

Adicionamos detecção de convite em **3 páginas** para garantir que funcione:

1. ✅ `/auth/callback` - Página dedicada para processar callbacks do Supabase
2. ✅ `/login` - Página de login (já tinha, mas confirmamos)
3. ✅ `/` (home) - Página inicial (NOVO - adicionado agora)

Agora, **não importa onde o link do Supabase redirecione**, o sistema vai detectar o `type=invite` e redirecionar para `/onboarding`.

## 📋 Passos para Reenviar o Convite

### Opção 1: Via Supabase Dashboard (Mais Rápido)

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Projeto: criadores

2. **Vá em Authentication → Users**

3. **Encontre a usuária "Kau Theodoro"**
   - Email: `kauanatheodoro@gmail.com`

4. **DELETE o usuário**
   - Clique nos 3 pontinhos ao lado do usuário
   - Clique em "Delete User"
   - Confirme a exclusão

5. **Envie um NOVO convite**
   - Clique em "Invite User"
   - Preencha:
     - **Email**: `kauanatheodoro@gmail.com`
     - **Redirect URL**: `https://www.criadores.app/auth/callback` (ou deixe em branco)
     - **User Metadata**:
       ```json
       {
         "full_name": "Kau Theodoro",
         "creator_id": "UUID_DA_KAU_NA_TABELA_CREATORS",
         "role": "creator",
         "entity_type": "creator"
       }
       ```

6. **Clique em "Invite User"**

7. **A Kau receberá um novo email**
   - Peça para ela clicar no link
   - Agora deve funcionar e redirecionar para `/onboarding`

### Opção 2: Via Script (Mais Automatizado)

1. **Edite o arquivo `scripts/invite-creator.ts`**
   ```typescript
   const creatorEmail = 'kauanatheodoro@gmail.com';
   const creatorFullName = 'Kau Theodoro';
   const creatorId = 'UUID_DA_KAU_NA_TABELA_CREATORS'; // Pegue o UUID da tabela creators
   ```

2. **Execute o script**
   ```bash
   npm run invite-creator
   ```

3. **O script vai:**
   - Verificar se o creator existe na tabela `creators`
   - Verificar se já existe um usuário com este email
   - Se existir, vai avisar para deletar primeiro
   - Se não existir, vai enviar o convite

## 🔍 Como Encontrar o Creator ID da Kau

### Via Supabase Dashboard:

1. Acesse o Supabase Dashboard
2. Vá em **Table Editor** → **creators**
3. Procure por "Kau Theodoro" ou pelo email dela
4. Copie o **ID** (UUID)

### Via SQL:

Execute no SQL Editor do Supabase:
```sql
SELECT id, name, email 
FROM creators 
WHERE email = 'kauanatheodoro@gmail.com' 
   OR name ILIKE '%Kau%Theodoro%';
```

## ⚠️ IMPORTANTE: Configurar Redirect URLs no Supabase

**Antes de reenviar o convite**, configure as Redirect URLs no Supabase:

1. Acesse **Authentication** → **URL Configuration**
2. Configure:

**Site URL:**
```
https://www.criadores.app
```

**Redirect URLs (adicione TODAS):**
```
https://www.criadores.app/auth/callback
https://criadores.app/auth/callback
https://www.criadores.app/
https://criadores.app/
http://localhost:3000/auth/callback
```

## 🧪 Como Testar

Depois de reenviar o convite:

1. **Peça para a Kau abrir o email**
2. **Clicar no link de convite**
3. **Verificar se:**
   - ✅ Redireciona para uma página com formulário de senha
   - ✅ Mostra o nome dela: "Kau Theodoro"
   - ✅ Mostra o email: "kauanatheodoro@gmail.com"
   - ✅ Mostra "Tipo: Criador"
   - ✅ Tem um campo para criar senha
   - ✅ Tem um botão "Criar Senha e Acessar"

4. **Ela deve criar uma senha**
   - Mínimo 8 caracteres
   - Clicar em "Criar Senha e Acessar"

5. **Após criar a senha:**
   - ✅ Deve fazer login automático
   - ✅ Deve redirecionar para `/dashboard`
   - ✅ Dashboard deve redirecionar para `/campanhas-criador` (baseado no role)

## 🐛 Se Ainda Não Funcionar

### Problema: Ainda redireciona para página de login

**Solução 1: Verificar se o deploy foi feito**
```bash
# Se estiver usando Vercel
vercel --prod

# Ou se estiver usando outro serviço, faça o deploy
```

**Solução 2: Limpar cache do navegador**
- Peça para a Kau abrir o link em uma aba anônima/privada
- Ou limpar o cache do navegador

**Solução 3: Verificar os logs**
- Abra o Console do navegador (F12)
- Procure por mensagens começando com:
  - `🎉 [Home] Convite detectado`
  - `🎉 [Login] Convite detectado`
  - `🎉 [Auth Callback] Convite detectado`
  - `🔐 [Onboarding] Hash params`

### Problema: Erro ao criar senha

**Solução: Verificar logs da API**
- Abra o Console do navegador (F12)
- Vá na aba "Network"
- Procure pela requisição para `/api/platform/auth/set-password`
- Veja a resposta e o erro

## 📞 Suporte

Se ainda tiver problemas:

1. **Tire um print da tela** que aparece quando a Kau clica no link
2. **Abra o Console do navegador** (F12) e tire um print dos logs
3. **Copie a URL completa** que aparece no navegador
4. **Me envie** essas informações para eu ajudar

## ✅ Checklist Final

Antes de reenviar o convite, confirme:

- [ ] Configurou as Redirect URLs no Supabase Dashboard
- [ ] Deletou o usuário antigo da Kau (se existir)
- [ ] Tem o Creator ID da Kau da tabela `creators`
- [ ] Fez o deploy das alterações (se necessário)
- [ ] Testou em uma aba anônima/privada

## 🎯 Resultado Esperado

Quando tudo estiver funcionando:

1. ✅ Kau recebe email com link
2. ✅ Clica no link
3. ✅ Abre página de onboarding com formulário de senha
4. ✅ Cria senha
5. ✅ Login automático
6. ✅ Redireciona para dashboard de criador
7. ✅ Pode acessar as campanhas dela

## 📝 Exemplo de User Metadata Completo

```json
{
  "full_name": "Kau Theodoro",
  "creator_id": "685c132e-aeb0-41be-9c9a-2f21f6b04c47",
  "role": "creator",
  "entity_type": "creator",
  "email_verified": true,
  "invited_at": "2025-01-06T18:54:00.000Z"
}
```

**Substitua o `creator_id` pelo UUID real da Kau na tabela `creators`!**

