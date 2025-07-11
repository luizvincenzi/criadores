# Deploy do CRM crIAdores no Vercel

## 🚀 Instruções de Deploy

### 1. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, adicione as seguintes variáveis de ambiente:

```bash
# Google Sheets API
GOOGLE_SPREADSHEET_ID=14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[SUA_CHAVE_PRIVADA]\n-----END PRIVATE KEY-----"
GOOGLE_CLIENT_EMAIL=crm-criadores@crmcriadores.iam.gserviceaccount.com
GOOGLE_PROJECT_ID=crmcriadores

# Google Calendar API  
GOOGLE_CALENDAR_ID=6115d050020f0be9264f21f81b1b18731082e16669a4f8dac3e9f34ce79c6c36@group.calendar.google.com
```

### 2. Configuração do Projeto no Vercel

1. **Conectar Repositório:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Conecte o repositório: `luizvincenzi/crmcriadores`

2. **Configurações de Build:**
   - Framework Preset: `Next.js`
   - Root Directory: `crm-interno`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Configurações Avançadas:**
   - Node.js Version: `18.x`
   - Regions: `São Paulo (gru1)`

### 3. Configuração Inicial Pós-Deploy

Após o deploy, acesse:

1. **Configurar Sistema:**
   - Vá para: `https://seu-dominio.vercel.app/test-auth`
   - Clique em "Criar Aba Users" para configurar a planilha

2. **Fazer Login:**
   - Vá para: `https://seu-dominio.vercel.app/login`
   - Use as credenciais:
     - **Email:** luizvincenzi@gmail.com
     - **Senha:** admin123

### 4. Estrutura do Projeto

```
crm-interno/
├── app/
│   ├── (dashboard)/          # Páginas protegidas
│   ├── api/auth/            # APIs de autenticação
│   ├── login/               # Página de login
│   └── test-auth/           # Página de configuração
├── components/
│   ├── AuthGuard.tsx        # Proteção de rotas
│   └── ui/                  # Componentes de UI
└── store/
    └── authStore.ts         # Estado de autenticação
```

### 5. Funcionalidades Implementadas

- ✅ Sistema de login com Google Sheets
- ✅ Proteção de rotas
- ✅ Auditoria de ações
- ✅ Interface Material Design 3
- ✅ Kanban drag & drop
- ✅ Integração Google Calendar
- ✅ Gestão de negócios, criadores e campanhas

### 6. Troubleshooting

**Erro de Build:**
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme que a chave privada do Google está formatada corretamente

**Erro de Autenticação:**
- Execute `/test-auth` para criar a aba Users
- Verifique as credenciais do Google Sheets

**Erro 404:**
- Confirme que o Root Directory está definido como `crm-interno`

### 7. Domínio Personalizado (Opcional)

Para usar um domínio personalizado:
1. Vá em Settings > Domains no Vercel
2. Adicione seu domínio
3. Configure os DNS conforme instruções

---

**Suporte:** Para dúvidas, verifique os logs no painel do Vercel ou consulte a documentação do Next.js.
