# ❓ FAQ - Correção de Login

## 🎯 Perguntas Gerais

### P: O que foi corrigido?
**R:** O sistema de validação de senha foi atualizado para usar bcrypt em vez de uma lista hardcoded de credenciais.

### P: Por que o usuário Alanna não conseguia fazer login?
**R:** O sistema procurava o email dela em uma lista hardcoded de credenciais, mas ela não estava nessa lista. Agora o sistema usa o `password_hash` bcrypt armazenado no banco de dados.

### P: Outros usuários foram afetados?
**R:** Não. A correção mantém compatibilidade com usuários antigos que usam a lista hardcoded.

### P: Preciso fazer algo para os usuários antigos?
**R:** Não. Eles continuam funcionando normalmente com a lista hardcoded.

---

## 🔐 Perguntas sobre Senha

### P: Como gerar um password_hash para um novo usuário?
**R:** Veja o documento `GERAR_PASSWORD_HASH.md` para 3 opções:
1. Gerador online (mais fácil)
2. Node.js
3. TypeScript (recomendado)

### P: Qual é a senha do usuário Alanna?
**R:** A senha foi definida quando o usuário foi adicionado ao banco. Você precisa saber qual é ou resetá-la.

### P: Como resetar a senha de um usuário?
**R:** Execute no Supabase SQL Editor:
```sql
-- Gere o hash primeiro (veja GERAR_PASSWORD_HASH.md)
UPDATE users 
SET password_hash = '$2a$12$SEU_HASH_AQUI'
WHERE email = 'alannaalicia17@gmail.com';
```

### P: O hash bcrypt é seguro?
**R:** Sim! Bcrypt com salt 12 é considerado muito seguro e é o padrão da indústria.

### P: Posso usar a mesma senha para vários usuários?
**R:** Tecnicamente sim, mas não é recomendado por questões de segurança. Cada usuário deve ter sua própria senha única.

---

## 🧪 Perguntas sobre Testes

### P: Como testar se o login funciona?
**R:** Veja `TESTE_LOGIN_ALANNA_PASSO_A_PASSO.md` para 3 opções:
1. Via interface web (recomendado)
2. Via cURL
3. Via script TypeScript

### P: O que fazer se o login não funcionar?
**R:** Veja a seção "Troubleshooting" em `TESTE_LOGIN_ALANNA_PASSO_A_PASSO.md`.

### P: Como verificar se o usuário está no banco?
**R:** Execute o script `SQL_VERIFICAR_USUARIO_ALANNA.sql` no Supabase SQL Editor.

### P: Como verificar os logs do servidor?
**R:** Abra o terminal onde o Next.js está rodando e procure por mensagens como:
```
🔐 Tentativa de login para: alannaalicia17@gmail.com
🔐 Validando senha com bcrypt para: alannaalicia17@gmail.com
✅ Login realizado com sucesso: alannaalicia17@gmail.com
```

---

## 🔧 Perguntas Técnicas

### P: Quais arquivos foram modificados?
**R:** Apenas 2 arquivos:
1. `app/api/supabase/auth/login/route.ts`
2. `app/api/platform/auth/login/route.ts`

### P: O que mudou exatamente?
**R:** A função `validatePassword` agora:
1. Primeiro tenta validar com bcrypt se `password_hash` existir
2. Se não houver hash, usa a lista hardcoded (compatibilidade)
3. Adiciona tratamento de erros robusto

### P: Por que manter a lista hardcoded?
**R:** Para compatibilidade com usuários antigos que ainda não têm `password_hash` no banco.

### P: Quando posso remover a lista hardcoded?
**R:** Quando todos os usuários tiverem `password_hash` no banco. Você pode verificar com:
```sql
SELECT COUNT(*) FROM users WHERE password_hash IS NULL;
```

### P: O bcrypt é lento?
**R:** Não. Bcrypt é otimizado e muito rápido para validação de senha (< 100ms).

---

## 🚀 Perguntas sobre Deploy

### P: Como fazer deploy?
**R:** Veja `DEPLOY_CORRECAO_LOGIN.md` para instruções completas.

### P: Preciso fazer algo no banco de dados antes do deploy?
**R:** Não. O banco já está pronto. Apenas certifique-se de que o usuário tem `password_hash`.

### P: E se algo der errado no deploy?
**R:** Veja a seção "Rollback" em `DEPLOY_CORRECAO_LOGIN.md`.

### P: Como monitorar após o deploy?
**R:** Veja a seção "Monitoramento Pós-Deploy" em `DEPLOY_CORRECAO_LOGIN.md`.

---

## 📊 Perguntas sobre Banco de Dados

### P: Como verificar se o usuário está no banco?
**R:** Execute:
```sql
SELECT * FROM users WHERE email = 'alannaalicia17@gmail.com';
```

### P: Como verificar se o password_hash é válido?
**R:** Execute:
```sql
SELECT 
  email,
  password_hash,
  LENGTH(password_hash) as hash_length,
  SUBSTRING(password_hash, 1, 4) as hash_prefix
FROM users 
WHERE email = 'alannaalicia17@gmail.com';
```
O hash deve ter 60 caracteres e começar com `$2a$` ou `$2b$`.

### P: Como listar todos os usuários com hash?
**R:** Execute:
```sql
SELECT 
  email,
  CASE 
    WHEN password_hash IS NULL THEN '❌ Sem hash'
    WHEN LENGTH(password_hash) = 60 THEN '✅ Com hash'
    ELSE '⚠️ Hash inválido'
  END as status
FROM users
ORDER BY email;
```

---

## 🐛 Perguntas sobre Troubleshooting

### P: Login retorna "Email ou senha incorretos"
**R:** Verifique:
1. Email está correto (sem espaços)
2. Senha está correta
3. Usuário tem `is_active = true`
4. Usuário tem `password_hash` válido

### P: Erro 500 no servidor
**R:** Verifique:
1. Logs do servidor
2. Se `bcryptjs` está instalado: `npm list bcryptjs`
3. Se `verifyPassword` está importado corretamente

### P: Usuário faz login mas não acessa dashboard
**R:** Verifique:
1. Se `is_active = true`
2. Se tem `permissions` definidas
3. Se tem `role` definida
4. Logs do navegador (F12 → Console)

### P: Hash não funciona
**R:** Verifique:
1. Hash foi copiado completamente (60 caracteres)
2. Hash começa com `$2a$` ou `$2b$`
3. Senha está correta (sem espaços extras)

---

## 📚 Perguntas sobre Documentação

### P: Qual documento devo ler primeiro?
**R:** Comece por `SUMARIO_EXECUTIVO_LOGIN.md` (2 minutos).

### P: Onde está o guia de testes?
**R:** `TESTE_LOGIN_ALANNA_PASSO_A_PASSO.md`

### P: Onde está o guia de deploy?
**R:** `DEPLOY_CORRECAO_LOGIN.md`

### P: Como gerar password_hash?
**R:** `GERAR_PASSWORD_HASH.md`

### P: Onde está o índice de toda a documentação?
**R:** `INDICE_DOCUMENTACAO_LOGIN.md`

---

## 🎯 Perguntas sobre Próximos Passos

### P: O que fazer agora?
**R:**
1. Leia `SUMARIO_EXECUTIVO_LOGIN.md`
2. Teste localmente (veja `TESTE_LOGIN_ALANNA_PASSO_A_PASSO.md`)
3. Execute `CHECKLIST_FINAL_LOGIN.md`
4. Faça deploy (veja `DEPLOY_CORRECAO_LOGIN.md`)

### P: Quanto tempo vai levar?
**R:**
- Ler documentação: 60 minutos
- Testar localmente: 30 minutos
- Deploy: 15 minutos
- **Total: ~2 horas**

### P: Preciso de ajuda?
**R:** Veja a seção "Suporte" em qualquer documento ou abra uma issue.

---

## ✨ Conclusão

Se sua pergunta não está aqui, consulte:
- `TESTE_LOGIN_ALANNA_PASSO_A_PASSO.md` para testes
- `GERAR_PASSWORD_HASH.md` para gerar hashes
- `DEPLOY_CORRECAO_LOGIN.md` para deploy
- `INDICE_DOCUMENTACAO_LOGIN.md` para índice completo

