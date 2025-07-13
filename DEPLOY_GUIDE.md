# 🚀 Guia de Deploy Seguro - CRM Criadores

## 📋 CHECKLIST PRÉ-DEPLOY

### ✅ Verificações Locais
- [x] Servidor funcionando em localhost:3000
- [x] Login funcionando com senhas migradas
- [x] Todas as funcionalidades testadas
- [x] Senhas migradas para bcrypt hash
- [x] Headers de segurança configurados
- [x] Rate limiting implementado

### ✅ Arquivos de Configuração
- [x] `vercel.json` - Configuração de deploy e headers de segurança
- [x] `middleware.ts` - Rate limiting e proteções
- [x] `.env.local` - Variáveis de ambiente (NÃO commitado)
- [x] `.gitignore` - Arquivos sensíveis ignorados

## 🔐 REGENERAR CREDENCIAIS GOOGLE CLOUD (CRÍTICO)

### ANTES DO DEPLOY, VOCÊ DEVE:

1. **Acessar Google Cloud Console:**
   - URL: https://console.cloud.google.com/
   - Projeto: `crmcriadores`

2. **Revogar Chave Atual:**
   - Ir para "IAM & Admin" > "Service Accounts"
   - Encontrar: `crm-criadores@crmcriadores.iam.gserviceaccount.com`
   - Deletar chave atual: `a23a43d57506d684472491e9848273f0f295fc5d`

3. **Gerar Nova Chave:**
   - Clicar em "Add Key" > "Create new key"
   - Escolher formato JSON
   - Baixar o arquivo JSON

4. **Extrair Informações da Nova Chave:**
   ```json
   {
     "type": "service_account",
     "project_id": "crmcriadores",
     "private_key_id": "[NOVO_PRIVATE_KEY_ID]",
     "private_key": "-----BEGIN PRIVATE KEY-----\n[NOVA_CHAVE]\n-----END PRIVATE KEY-----\n",
     "client_email": "crm-criadores@crmcriadores.iam.gserviceaccount.com",
     "client_id": "[NOVO_CLIENT_ID]",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/crm-criadores%40crmcriadores.iam.gserviceaccount.com"
   }
   ```

## 🚀 PROCESSO DE DEPLOY

### PASSO 1: Commit e Push para GitHub

```bash
# Verificar status
git status

# Adicionar arquivos
git add .

# Commit com as configurações de produção
git commit -m "feat: add production configuration for secure deployment

🚀 PRODUCTION READY:
- Add vercel.json with security headers and build config
- Configure --legacy-peer-deps for dependency resolution
- Set maxDuration for API functions (30s)
- Add security headers (HSTS, CSP, X-Frame-Options)
- Configure Brazilian region (gru1) for better performance

🔐 SECURITY FEATURES:
- Strict-Transport-Security with preload
- X-Frame-Options: DENY (clickjacking protection)
- X-Content-Type-Options: nosniff
- Cache-Control for API routes
- Referrer-Policy: strict-origin-when-cross-origin

📋 NEXT STEPS:
1. Regenerate Google Cloud credentials
2. Configure environment variables in Vercel
3. Deploy to production"

# Push para GitHub
git push origin main
```

### PASSO 2: Configurar Vercel

1. **Acessar Vercel Dashboard:**
   - URL: https://vercel.com/dashboard
   - Login com sua conta

2. **Importar Projeto:**
   - Clicar em "New Project"
   - Conectar com GitHub
   - Selecionar repositório: `luizvincenzi/crmcriadores`

3. **Configurar Variáveis de Ambiente:**
   
   **IMPORTANTE:** Use as NOVAS credenciais geradas no Google Cloud!
   
   ```bash
   # Google Sheets API (NOVAS CREDENCIAIS)
   GOOGLE_PROJECT_ID=crmcriadores
   GOOGLE_CLIENT_EMAIL=crm-criadores@crmcriadores.iam.gserviceaccount.com
   GOOGLE_SPREADSHEET_ID=14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI
   GOOGLE_PRIVATE_KEY=[NOVA_CHAVE_COMPLETA_COM_\n]
   GOOGLE_PRIVATE_KEY_ID=[NOVO_PRIVATE_KEY_ID]
   GOOGLE_CLIENT_ID=[NOVO_CLIENT_ID]
   
   # Ambiente
   NODE_ENV=production
   ```

4. **Deploy:**
   - Clicar em "Deploy"
   - Aguardar build completar

### PASSO 3: Verificações Pós-Deploy

1. **Testar URL de Produção:**
   - Acessar URL fornecida pelo Vercel
   - Testar login com usuários existentes
   - Verificar todas as funcionalidades

2. **Verificar Headers de Segurança:**
   ```bash
   # Testar headers de segurança
   curl -I https://[SEU-DOMINIO].vercel.app
   ```

3. **Testar Rate Limiting:**
   - Fazer múltiplas tentativas de login incorretas
   - Verificar se é bloqueado após 5 tentativas

## 🔧 COMANDOS ÚTEIS

### Verificar Build Local:
```bash
npm run build
npm start
```

### Verificar Logs do Vercel:
```bash
npx vercel logs [deployment-url]
```

### Redeploy:
```bash
git push origin main  # Trigger automático no Vercel
```

## 🚨 TROUBLESHOOTING

### Erro de Build:
- Verificar se `--legacy-peer-deps` está no vercel.json
- Verificar se todas as dependências estão no package.json

### Erro de Autenticação Google:
- Verificar se as novas credenciais estão corretas
- Verificar se a chave privada tem `\n` corretos
- Verificar se o service account tem permissões

### Erro de Rate Limiting:
- Verificar se o middleware está funcionando
- Verificar logs do Vercel para erros

## ✅ CHECKLIST PÓS-DEPLOY

- [ ] URL de produção funcionando
- [ ] Login funcionando com usuários existentes
- [ ] Todas as páginas carregando (dashboard, negócios, criadores, campanhas, jornada)
- [ ] Kanban drag & drop funcionando
- [ ] Integração Google Sheets funcionando
- [ ] Headers de segurança presentes
- [ ] Rate limiting ativo
- [ ] Performance aceitável (< 3s carregamento)

## 🎯 DOMÍNIO PERSONALIZADO (OPCIONAL)

Se quiser usar um domínio personalizado:

1. **Comprar domínio** (ex: crmcriadores.com)
2. **Configurar no Vercel:**
   - Settings > Domains
   - Adicionar domínio
   - Configurar DNS conforme instruções
3. **Certificado SSL automático** (Vercel cuida disso)

## 📞 SUPORTE

Em caso de problemas:
- **Vercel Docs:** https://vercel.com/docs
- **Google Cloud Support:** https://cloud.google.com/support
- **Next.js Docs:** https://nextjs.org/docs
