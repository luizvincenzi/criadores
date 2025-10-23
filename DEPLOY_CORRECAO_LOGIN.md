# 🚀 Deploy - Correção de Login

## 📋 Pré-requisitos

- [ ] Testes locais passaram (veja `CHECKLIST_FINAL_LOGIN.md`)
- [ ] Código foi revisado
- [ ] Documentação está completa
- [ ] Sem erros de compilação

---

## 🔄 Processo de Deploy

### Passo 1: Commit Local

```bash
# Verificar mudanças
git status

# Adicionar arquivos modificados
git add app/api/supabase/auth/login/route.ts
git add app/api/platform/auth/login/route.ts

# Commit com mensagem descritiva
git commit -m "🔐 Fix: Usar bcrypt para validação de senha em vez de lista hardcoded

- Atualizar app/api/supabase/auth/login/route.ts
- Atualizar app/api/platform/auth/login/route.ts
- Adicionar suporte a password_hash bcrypt
- Manter compatibilidade com usuários antigos
- Adicionar tratamento de erros robusto

Fixes: Usuário alannaalicia17@gmail.com não conseguia fazer login"
```

### Passo 2: Push para Repositório

```bash
# Push para branch atual
git push origin [seu-branch]

# Ou push para main (se pronto para produção)
git push origin main
```

### Passo 3: Criar Pull Request (se necessário)

```
Título: 🔐 Fix: Usar bcrypt para validação de senha

Descrição:
## Problema
Usuário alannaalicia17@gmail.com não conseguia fazer login.

## Causa
Sistema de validação de senha estava usando lista hardcoded.

## Solução
Atualizar para usar bcrypt se password_hash existir.

## Mudanças
- app/api/supabase/auth/login/route.ts
- app/api/platform/auth/login/route.ts

## Testes
- [x] Testes locais passaram
- [x] Sem erros de compilação
- [x] Compatibilidade mantida

## Checklist
- [x] Código revisado
- [x] Documentação atualizada
- [x] Testes executados
```

### Passo 4: Deploy em Staging

```bash
# Se usar Vercel
vercel --prod --scope=seu-scope

# Se usar outro serviço
# Siga as instruções do seu provedor
```

### Passo 5: Teste em Staging

```bash
# Teste o login em staging
https://staging.seu-dominio.com/login

# Email: alannaalicia17@gmail.com
# Senha: [A SENHA]

# Verifique:
# - Login funciona
# - Dashboard carrega
# - Permissões funcionam
# - Logs estão corretos
```

### Passo 6: Deploy em Produção

```bash
# Se usar Vercel
vercel --prod

# Se usar outro serviço
# Siga as instruções do seu provedor
```

### Passo 7: Teste em Produção

```bash
# Teste o login em produção
https://seu-dominio.com/login

# Email: alannaalicia17@gmail.com
# Senha: [A SENHA]

# Verifique:
# - Login funciona
# - Dashboard carrega
# - Permissões funcionam
# - Logs estão corretos
```

---

## ✅ Checklist de Deploy

### Antes do Deploy
- [ ] Testes locais passaram
- [ ] Código foi revisado
- [ ] Sem erros de compilação
- [ ] Documentação está atualizada
- [ ] Commit foi feito
- [ ] Push foi feito

### Durante o Deploy
- [ ] Build completa sem erros
- [ ] Sem warnings críticos
- [ ] Variáveis de ambiente estão corretas
- [ ] Banco de dados está acessível

### Depois do Deploy
- [ ] Teste o login em staging
- [ ] Teste o login em produção
- [ ] Verifique os logs
- [ ] Monitore por erros
- [ ] Comunique aos usuários (se necessário)

---

## 🔍 Monitoramento Pós-Deploy

### Logs para Monitorar

```
✅ Esperado:
🔐 Tentativa de login para: alannaalicia17@gmail.com
🔐 Validando senha com bcrypt para: alannaalicia17@gmail.com
✅ Validação de senha com bcrypt para usuário: alannaalicia17@gmail.com
✅ Login realizado com sucesso: alannaalicia17@gmail.com

❌ Não esperado:
❌ Usuário não encontrado
❌ Senha incorreta
❌ Erro ao validar senha
```

### Métricas para Monitorar

- Taxa de sucesso de login
- Tempo de resposta da API
- Erros de autenticação
- Uso de CPU/Memória

---

## 🚨 Rollback (Se Necessário)

### Se Algo Deu Errado

```bash
# Revert do commit
git revert [commit-hash]

# Push do revert
git push origin main

# Deploy do revert
vercel --prod
```

### Comunicar o Problema

1. Notifique o time
2. Investigue o erro
3. Corrija o código
4. Teste novamente
5. Faça novo deploy

---

## 📞 Suporte Pós-Deploy

### Se Usuários Reportarem Problemas

1. Verifique os logs
2. Verifique o banco de dados
3. Teste o login localmente
4. Verifique a senha do usuário
5. Reporte o problema com detalhes

### Documentação de Referência

- `TESTE_LOGIN_ALANNA_PASSO_A_PASSO.md` - Como testar
- `GERAR_PASSWORD_HASH.md` - Como gerar hashes
- `SQL_VERIFICAR_USUARIO_ALANNA.sql` - Verificar banco
- `CHECKLIST_FINAL_LOGIN.md` - Validação completa

---

## ✨ Conclusão

Parabéns! O deploy foi concluído com sucesso! 🎉

O usuário Alanna agora consegue fazer login em produção.

