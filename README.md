# 🎯 Plataforma crIAdores Cliente

Sistema de gestão de campanhas com influenciadores para empresas clientes.

## 🔒 Sistema de Autenticação Multi-Nível

### Tipos de Usuário:
- **👑 Administradores:** Acesso total à plataforma
- **🏢 Empresas:** Acesso apenas aos próprios dados
- **👥 Criadores:** Acesso apenas às campanhas atribuídas

## 🛡️ Recursos de Segurança

### Filtros de Segurança Rigorosos:
- ✅ Validação por `business_id` em todas as APIs
- ✅ Headers de segurança automáticos
- ✅ Isolamento total entre empresas
- ✅ Logs de auditoria detalhados
- ✅ Middleware de segurança avançado

### APIs Implementadas:
- `/api/client/events` - Gestão de eventos filtrada
- `/api/client/campaigns` - Campanhas isoladas por empresa
- `/api/client/creators` - Criadores apenas das campanhas autorizadas

## 🎨 Interface

### Funcionalidades:
- ✅ Landing page crIAdores com proposta de valor
- ✅ Sistema de login com validação completa
- ✅ Dashboard personalizado por empresa
- ✅ Gestão de eventos, campanhas e criadores
- ✅ Sistema de tarefas integrado

## 🚀 Tecnologias

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Supabase
- **Banco:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth + Zustand
- **Deploy:** Vercel

## ⚙️ Configuração

### Variáveis de Ambiente:
```env
NEXT_PUBLIC_CLIENT_MODE=true
NEXT_PUBLIC_CLIENT_BUSINESS_ID=[UUID-da-empresa]
NEXT_PUBLIC_BASE_URL=https://criadores.app
NEXT_PUBLIC_SUPABASE_URL=[URL-do-supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[chave-supabase]
```

### Instalação:
```bash
npm install
npm run dev
```

## 🔐 Segurança

### Garantias:
- ✅ **Isolamento Total:** Cada empresa vê apenas seus dados
- ✅ **Validação Dupla:** Middleware + API validation
- ✅ **Auditoria Completa:** Logs de todas as ações
- ✅ **Controle de Acesso:** Permissões por tipo de usuário
- ✅ **Filtros Múltiplos:** organization_id + business_id + validações

### Headers de Segurança:
```typescript
'x-client-business-id': businessId,
'x-client-mode': 'true',
'x-criadores-platform': 'client'
```

## 📊 Status

✅ **Sistema de autenticação implementado**  
✅ **Filtros de segurança ativos**  
✅ **APIs com isolamento de dados**  
✅ **Interface responsiva funcionando**  
✅ **Middleware de segurança ativo**  
✅ **Pronto para deploy no Vercel**  

---

**Desenvolvido pela equipe crIAdores** 🚀
