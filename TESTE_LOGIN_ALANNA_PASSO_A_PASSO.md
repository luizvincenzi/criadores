# 🧪 Teste de Login - Alanna Alícia

## Informações do Usuário

```
Email: alannaalicia17@gmail.com
Nome: Alanna Alícia
Role: strategist
Roles: ["marketing_strategist", "creator"]
Status: Ativo (is_active: true)
Organization: 00000000-0000-0000-0000-000000000001
```

---

## ⚠️ IMPORTANTE: Qual é a Senha?

A senha do usuário foi definida quando foi adicionado ao banco. Você precisa saber qual é.

### Opções:
1. **Se você definiu uma senha**: Use essa senha
2. **Se foi gerada automaticamente**: Verifique o email de boas-vindas
3. **Se não sabe**: Você pode resetar a senha no banco de dados

### Como Resetar a Senha (se necessário)

Se precisar resetar, execute no Supabase SQL Editor:

```sql
-- Gerar novo hash bcrypt para a senha "NovaSenh@123"
-- Use um gerador online: https://bcrypt-generator.com/
-- Ou execute este script Node.js:

const bcrypt = require('bcryptjs');
const password = 'NovaSenh@123';
const hash = bcrypt.hashSync(password, 12);
console.log(hash);

-- Depois atualize no banco:
UPDATE users 
SET password_hash = '$2a$12$...' 
WHERE email = 'alannaalicia17@gmail.com';
```

---

## 🧪 Teste 1: Via Interface Web (Recomendado)

### Passo 1: Abrir a página de login
```
1. Abra seu navegador
2. Acesse: http://localhost:3000/login
3. Você deve ver a página de login do crIAdores
```

### Passo 2: Preencher credenciais
```
1. Campo "Email": alannaalicia17@gmail.com
2. Campo "Senha": [INSIRA A SENHA AQUI]
3. Clique em "Entrar"
```

### Passo 3: Verificar resultado
```
✅ SUCESSO: Redirecionado para /dashboard
❌ FALHA: Mensagem "Email ou senha incorretos"
```

### Passo 4: Verificar console do navegador
```
Abra DevTools (F12) → Console
Procure por mensagens como:
- 🔐 [crIAdores] Iniciando login para: alannaalicia17@gmail.com
- 🔐 Validando senha com bcrypt para: alannaalicia17@gmail.com
- ✅ [crIAdores] Login realizado com sucesso
```

---

## 🧪 Teste 2: Via cURL (Terminal)

### Comando:
```bash
curl -X POST http://localhost:3000/api/supabase/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alannaalicia17@gmail.com",
    "password": "INSIRA_A_SENHA_AQUI"
  }'
```

### Resposta Esperada (Sucesso):
```json
{
  "success": true,
  "user": {
    "id": "292a98fb-0e0d-4975-8037-463e40000000",
    "email": "alannaalicia17@gmail.com",
    "full_name": "Alanna Alícia",
    "role": "strategist",
    "roles": ["marketing_strategist", "creator"],
    "is_active": true,
    "permissions": {
      "tasks": {"read": true, "write": true, "delete": false},
      "reports": {"read": true, "write": false, "delete": false},
      "conteudo": {"read": true, "write": true, "delete": false},
      "briefings": {"read": true, "write": false, "delete": false},
      "campaigns": {"read": true, "write": false, "delete": false}
    }
  }
}
```

### Resposta Esperada (Falha):
```json
{
  "error": "Email ou senha incorretos"
}
```

---

## 🧪 Teste 3: Via Script TypeScript

### Executar:
```bash
npx tsx scripts/test-login-alanna.ts
```

### O que o script faz:
1. Busca o usuário no banco
2. Verifica se tem password_hash
3. Testa validação de senha com bcrypt
4. Exibe resultado detalhado

---

## 📊 Verificar Logs do Servidor

### Se estiver rodando localmente:
```bash
# Terminal onde o Next.js está rodando
# Procure por mensagens como:

🔐 Tentativa de login para: alannaalicia17@gmail.com
🔐 Validando senha com bcrypt para: alannaalicia17@gmail.com
✅ Validação de senha com bcrypt para usuário: alannaalicia17@gmail.com
✅ Login realizado com sucesso: alannaalicia17@gmail.com
```

---

## 🔍 Troubleshooting

### Problema: "Email ou senha incorretos"

**Causa 1: Senha errada**
- Verifique se a senha está correta
- Teste com a senha padrão se houver

**Causa 2: Usuário não encontrado**
- Verifique se o email está correto: `alannaalicia17@gmail.com`
- Verifique se `is_active = true` no banco

**Causa 3: Password hash inválido**
- Verifique se o `password_hash` está no formato bcrypt
- Deve começar com `$2a$` ou `$2b$`

### Problema: Erro 500 no servidor

**Solução:**
1. Verifique os logs do servidor
2. Certifique-se de que `verifyPassword` está importado corretamente
3. Verifique se `bcryptjs` está instalado: `npm list bcryptjs`

### Problema: Usuário faz login mas não acessa dashboard

**Solução:**
1. Verifique se o usuário tem `is_active = true`
2. Verifique se tem `permissions` definidas
3. Verifique se tem `role` definida

---

## ✅ Checklist de Teste

- [ ] Usuário existe no banco de dados
- [ ] `is_active = true`
- [ ] `password_hash` está preenchido
- [ ] `password_hash` começa com `$2a$` ou `$2b$`
- [ ] Senha testada está correta
- [ ] Página de login carrega sem erros
- [ ] Login bem-sucedido via web
- [ ] Login bem-sucedido via cURL
- [ ] Redirecionamento para dashboard funciona
- [ ] Dados do usuário aparecem no dashboard

---

## 📞 Próximos Passos

Se o login funcionar:
1. ✅ Teste acesso ao dashboard
2. ✅ Teste permissões (tasks, reports, etc)
3. ✅ Teste logout
4. ✅ Teste login novamente

Se o login não funcionar:
1. ❌ Verifique a senha
2. ❌ Verifique o password_hash no banco
3. ❌ Verifique os logs do servidor
4. ❌ Abra uma issue com os detalhes

