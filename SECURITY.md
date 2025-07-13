# 🔒 Guia de Segurança - CRM Criadores

## 📋 Resumo das Implementações

Este documento descreve todas as medidas de segurança implementadas no CRM Criadores para proteger dados sensíveis e garantir operação segura.

## 🛡️ Medidas de Segurança Implementadas

### 1. **Autenticação Segura**
- ✅ **Hash de senhas com bcrypt** (12 rounds)
- ✅ **Validação de força de senha**
- ✅ **Rate limiting no login** (5 tentativas por 15 minutos)
- ✅ **Verificação de usuário ativo**

### 2. **Validação de Input**
- ✅ **Validação com Zod** para todos os dados de entrada
- ✅ **Sanitização de strings** para prevenir XSS
- ✅ **Validação de email e WhatsApp**
- ✅ **Limitação de tamanho de campos**

### 3. **Headers de Segurança**
- ✅ **X-Frame-Options: DENY** (previne clickjacking)
- ✅ **X-Content-Type-Options: nosniff**
- ✅ **X-XSS-Protection: 1; mode=block**
- ✅ **Content-Security-Policy** configurado
- ✅ **Referrer-Policy: strict-origin-when-cross-origin**

### 4. **Rate Limiting**
- ✅ **Login**: 5 tentativas por 15 minutos por IP
- ✅ **APIs gerais**: 100 requisições por minuto por IP
- ✅ **Headers informativos** (X-RateLimit-*)

### 5. **Detecção de Ameaças**
- ✅ **Detecção de User-Agents suspeitos**
- ✅ **Prevenção de path traversal**
- ✅ **Bloqueio de métodos HTTP perigosos**
- ✅ **Log de eventos de segurança**

### 6. **Proteção de Credenciais**
- ✅ **Variáveis de ambiente seguras**
- ✅ **.env.local no .gitignore**
- ✅ **Credenciais não hardcoded**
- ✅ **Rotação de chaves recomendada**

## 🚀 Como Implementar

### Passo 1: Instalar Dependências
```bash
npm install bcryptjs @types/bcryptjs zod tsx jest @types/jest
```

### Passo 2: Regenerar Chaves Google Cloud
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá para "IAM & Admin" > "Service Accounts"
3. Encontre `crm-criadores@crmcriadores.iam.gserviceaccount.com`
4. Delete a chave atual
5. Gere nova chave JSON
6. Atualize as variáveis no Vercel

### Passo 3: Migrar Senhas Existentes
```bash
# Executar migração (APENAS UMA VEZ)
npm run migrate-passwords

# Verificar migração
npm run verify-passwords
```

### Passo 4: Executar Testes
```bash
# Executar todos os testes de segurança
npm test

# Executar auditoria de segurança
npm run security-audit
```

## 🔧 Configuração de Produção

### Variáveis de Ambiente Obrigatórias
```bash
# Google Sheets API (NOVAS CREDENCIAIS)
GOOGLE_PROJECT_ID=crmcriadores
GOOGLE_CLIENT_EMAIL=crm-criadores@crmcriadores.iam.gserviceaccount.com
GOOGLE_SPREADSHEET_ID=14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[NOVA_CHAVE]\n-----END PRIVATE KEY-----"
GOOGLE_PRIVATE_KEY_ID=[NOVO_ID]
GOOGLE_CLIENT_ID=[NOVO_CLIENT_ID]

# Ambiente
NODE_ENV=production
```

### Headers de Segurança (Vercel)
Adicionar ao `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

## 📊 Monitoramento

### Métricas de Segurança
- **Tentativas de login falhadas**: < 10/dia
- **IPs bloqueados**: Monitorar lista
- **Eventos suspeitos**: Alertas automáticos
- **Performance**: Impacto < 20%

### Logs de Segurança
```typescript
// Exemplo de log de evento
{
  "timestamp": "2024-01-15T10:30:00Z",
  "type": "failed_login",
  "severity": "medium",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "details": "Senha incorreta para admin@exemplo.com"
}
```

## 🧪 Testes de Segurança

### Executar Testes
```bash
# Todos os testes
npm test

# Apenas testes de segurança
npm test security.test.ts

# Com coverage
npm test -- --coverage
```

### Testes Incluídos
- ✅ Hash e verificação de senhas
- ✅ Validação de input
- ✅ Sanitização de dados
- ✅ Detecção de ameaças
- ✅ Rate limiting
- ✅ Geração de tokens

## 🚨 Resposta a Incidentes

### Em Caso de Suspeita de Comprometimento

1. **Imediato** (< 1 hora):
   - Revogar todas as chaves Google Cloud
   - Bloquear IPs suspeitos
   - Forçar logout de todos os usuários

2. **Curto Prazo** (< 24 horas):
   - Gerar novas credenciais
   - Resetar senhas de todos os usuários
   - Analisar logs de auditoria

3. **Médio Prazo** (< 1 semana):
   - Investigação completa
   - Relatório de incidente
   - Melhorias de segurança

### Contatos de Emergência
- **Administrador do Sistema**: [Seu contato]
- **Google Cloud Support**: [Caso necessário]
- **Vercel Support**: [Para problemas de infraestrutura]

## 📚 Recursos Adicionais

### Documentação
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security](https://cloud.google.com/security)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

### Ferramentas de Auditoria
- `npm audit` - Vulnerabilidades em dependências
- `eslint-plugin-security` - Análise estática de código
- `helmet` - Headers de segurança adicionais

## ✅ Checklist de Segurança

### Implementação
- [ ] Dependências instaladas
- [ ] Chaves Google Cloud regeneradas
- [ ] Senhas migradas para hash
- [ ] Middleware de segurança ativo
- [ ] Testes passando
- [ ] Headers de segurança configurados

### Monitoramento
- [ ] Logs de segurança funcionando
- [ ] Alertas configurados
- [ ] Dashboard de métricas
- [ ] Backup de configurações

### Manutenção
- [ ] Rotação de chaves agendada
- [ ] Auditoria mensal de usuários
- [ ] Atualização de dependências
- [ ] Revisão de logs de segurança

---

**⚠️ IMPORTANTE**: Este documento deve ser mantido atualizado conforme novas medidas de segurança são implementadas.
