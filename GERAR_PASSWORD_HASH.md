# 🔐 Como Gerar Password Hash para Novos Usuários

## 📌 Contexto

Quando você adiciona um novo usuário ao banco de dados, precisa gerar um `password_hash` bcrypt para a senha. Este documento mostra como fazer isso.

---

## 🛠️ Opção 1: Usar Gerador Online (Mais Fácil)

### Passo 1: Acesse o site
```
https://bcrypt-generator.com/
```

### Passo 2: Digite a senha
```
Senha: SuaSenha123!
```

### Passo 3: Gere o hash
```
Clique em "Generate Hash"
```

### Passo 4: Copie o resultado
```
Exemplo de resultado:
$2a$12$u1VkeDZ4r8882wlCyGu0R..qimEnCyYxQtvsYJFZ4GKctrQucybx2
```

### Passo 5: Use no banco
```sql
UPDATE users 
SET password_hash = '$2a$12$u1VkeDZ4r8882wlCyGu0R..qimEnCyYxQtvsYJFZ4GKctrQucybx2'
WHERE email = 'alannaalicia17@gmail.com';
```

---

## 🛠️ Opção 2: Usar Node.js (Mais Seguro)

### Passo 1: Crie um arquivo `generate-hash.js`
```javascript
const bcrypt = require('bcryptjs');

const password = 'SuaSenha123!'; // Substitua pela senha desejada
const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erro:', err);
  } else {
    console.log('Hash gerado:');
    console.log(hash);
  }
});
```

### Passo 2: Execute
```bash
node generate-hash.js
```

### Passo 3: Copie o resultado
```
Hash gerado:
$2a$12$u1VkeDZ4r8882wlCyGu0R..qimEnCyYxQtvsYJFZ4GKctrQucybx2
```

### Passo 4: Use no banco
```sql
UPDATE users 
SET password_hash = '$2a$12$u1VkeDZ4r8882wlCyGu0R..qimEnCyYxQtvsYJFZ4GKctrQucybx2'
WHERE email = 'alannaalicia17@gmail.com';
```

---

## 🛠️ Opção 3: Usar TypeScript (Recomendado)

### Passo 1: Crie um arquivo `scripts/generate-password-hash.ts`
```typescript
import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = process.argv[2] || 'DefaultPassword123!';
  const saltRounds = 12;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Hash gerado com sucesso:');
    console.log(hash);
    console.log('\n📋 Use este hash no banco de dados:');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'seu@email.com';`);
  } catch (error) {
    console.error('❌ Erro ao gerar hash:', error);
  }
}

generateHash();
```

### Passo 2: Execute
```bash
npx tsx scripts/generate-password-hash.ts "SuaSenha123!"
```

### Passo 3: Copie o resultado
```
🔐 Hash gerado com sucesso:
$2a$12$u1VkeDZ4r8882wlCyGu0R..qimEnCyYxQtvsYJFZ4GKctrQucybx2

📋 Use este hash no banco de dados:
UPDATE users SET password_hash = '$2a$12$u1VkeDZ4r8882wlCyGu0R..qimEnCyYxQtvsYJFZ4GKctrQucybx2' WHERE email = 'seu@email.com';
```

---

## 📝 Exemplo Prático: Alanna

### Cenário
Você quer definir a senha `Alanna@2024!` para o usuário Alanna.

### Passo 1: Gerar hash
```bash
npx tsx scripts/generate-password-hash.ts "Alanna@2024!"
```

### Passo 2: Resultado
```
$2a$12$aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdefghijklmnopqr
```

### Passo 3: Atualizar no banco
```sql
UPDATE users 
SET password_hash = '$2a$12$aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdefghijklmnopqr'
WHERE email = 'alannaalicia17@gmail.com';
```

### Passo 4: Testar login
```bash
curl -X POST http://localhost:3000/api/supabase/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alannaalicia17@gmail.com",
    "password": "Alanna@2024!"
  }'
```

---

## ⚠️ Importante

### Segurança
- ✅ Nunca compartilhe o hash
- ✅ Nunca compartilhe a senha em texto plano
- ✅ Use senhas fortes (mínimo 8 caracteres, com números e símbolos)
- ✅ Cada hash é único, mesmo para a mesma senha

### Validação
- ✅ Hash sempre começa com `$2a$` ou `$2b$`
- ✅ Hash tem sempre 60 caracteres
- ✅ Hash é seguro para armazenar no banco

### Teste
- ✅ Sempre teste o login após gerar o hash
- ✅ Verifique os logs do servidor
- ✅ Confirme que o usuário consegue acessar o dashboard

---

## 🔍 Verificar Hash no Banco

### Ver hash de um usuário
```sql
SELECT email, password_hash 
FROM users 
WHERE email = 'alannaalicia17@gmail.com';
```

### Verificar se hash é válido
```sql
-- Hash deve começar com $2a$ ou $2b$
-- Hash deve ter 60 caracteres
SELECT 
  email,
  password_hash,
  LENGTH(password_hash) as hash_length,
  SUBSTRING(password_hash, 1, 4) as hash_prefix
FROM users 
WHERE email = 'alannaalicia17@gmail.com';
```

---

## 🚀 Próximos Passos

1. ✅ Gere o hash para a senha desejada
2. ✅ Atualize o banco de dados
3. ✅ Teste o login
4. ✅ Verifique os logs
5. ✅ Confirme acesso ao dashboard

---

## 📞 Troubleshooting

### Problema: Hash não funciona
- Verifique se o hash foi copiado completamente
- Verifique se tem 60 caracteres
- Verifique se começa com `$2a$` ou `$2b$`

### Problema: Senha não funciona
- Verifique se a senha está correta
- Verifique se não tem espaços extras
- Teste com uma senha simples primeiro

### Problema: Erro ao gerar hash
- Verifique se bcryptjs está instalado: `npm list bcryptjs`
- Verifique se TypeScript está configurado
- Tente usar a opção online

