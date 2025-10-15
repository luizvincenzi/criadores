# 🧪 TESTAR LOGIN - GUIA RÁPIDO

## ✅ Servidor Rodando
- URL: http://localhost:3000/login
- Status: ✅ Online

---

## 👥 CREDENCIAIS PARA TESTAR

### **Teste 1: Pietra Mantovani (Creator + Marketing Strategist)**
```
Email: pietramantovani98@gmail.com
Senha: 2#Todoscria
```

**Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento para dashboard
- ✅ Acesso a funcionalidades de creator
- ✅ Acesso a funcionalidades de marketing strategist

---

### **Teste 2: Marilia Marques (Marketing Strategist + Creator)**
```
Email: marilia12cavalheiro@gmail.com
Senha: 2#Todoscria
```

**Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento para dashboard
- ✅ Acesso a funcionalidades de marketing strategist
- ✅ Acesso a funcionalidades de creator

---

## 🔍 O QUE VERIFICAR

### **1. Tela de Login**
- [ ] Formulário aparece corretamente
- [ ] Campos de email e senha funcionam
- [ ] Botão "Entrar" está habilitado

### **2. Processo de Login**
- [ ] Ao clicar em "Entrar", mostra loading
- [ ] Não mostra erro "Email ou senha incorretos"
- [ ] Redireciona para dashboard após login

### **3. Dashboard**
- [ ] Mostra nome do usuário correto
- [ ] Mostra role correto
- [ ] Menu lateral aparece
- [ ] Pode navegar entre páginas

### **4. Console do Navegador (F12)**
Verificar logs:
```
✅ [crIAdores] Iniciando login para: pietramantovani98@gmail.com
✅ [Platform] Login realizado com sucesso
✅ [crIAdores] Login realizado com sucesso
```

---

## 🐛 SE DER ERRO

### **Erro: "Email ou senha incorretos"**

**Verificar:**
1. Email está correto (copiar e colar)
2. Senha está correta: `2#Todoscria`
3. Abrir Console (F12) e verificar logs

**Logs esperados:**
```javascript
🔐 [crIAdores] Iniciando login para: pietramantovani98@gmail.com
🔐 [Platform] Tentativa de login para: pietramantovani98@gmail.com
✅ [Platform] Login realizado com sucesso
```

**Se aparecer:**
```javascript
❌ [Platform] Usuário não encontrado
⚠️ [crIAdores] Não encontrado em platform_users, tentando users...
```

**Solução:**
Execute no Supabase SQL Editor:
```sql
SELECT * FROM platform_users 
WHERE email = 'pietramantovani98@gmail.com';
```

Se não retornar nada, execute:
```sql
SELECT grant_creator_platform_access(
  '975c1933-cfa0-4b3a-9660-f14259ec4b26'::uuid,
  'pietramantovani98@gmail.com',
  ARRAY['creator', 'marketing_strategist']::platform_user_role[],
  '00000000-0000-0000-0000-000000000001'::uuid
);
```

---

### **Erro: "Erro interno do servidor"**

**Verificar:**
1. Servidor está rodando (http://localhost:3000)
2. Console do terminal mostra erros
3. Console do navegador (F12) mostra erros

**Solução:**
```bash
# Parar servidor (Ctrl+C)
# Reiniciar
npm run dev
```

---

### **Login funciona mas não redireciona**

**Verificar:**
1. Console do navegador (F12)
2. Verificar se `localStorage` tem dados:
```javascript
// No console do navegador
localStorage.getItem('criadores-auth-storage')
```

**Deve retornar algo como:**
```json
{
  "state": {
    "user": {
      "id": "975c1933-cfa0-4b3a-9660-f14259ec4b26",
      "email": "pietramantovani98@gmail.com",
      "full_name": "Pietra Mantovani",
      "role": "creator",
      "roles": ["creator", "marketing_strategist"]
    },
    "isAuthenticated": true
  }
}
```

---

## 📊 CHECKLIST DE TESTE

### **Teste Básico**
- [ ] Abrir http://localhost:3000/login
- [ ] Inserir email: `pietramantovani98@gmail.com`
- [ ] Inserir senha: `2#Todoscria`
- [ ] Clicar em "Entrar"
- [ ] Verificar se redireciona para dashboard
- [ ] Verificar se mostra nome "Pietra Mantovani"

### **Teste de Permissões**
- [ ] Verificar menu lateral
- [ ] Tentar acessar "Campanhas"
- [ ] Tentar acessar "Conteúdo"
- [ ] Tentar acessar "Briefings"
- [ ] Verificar se não mostra erro de permissão

### **Teste de Logout**
- [ ] Clicar em "Sair" (se houver)
- [ ] Verificar se volta para tela de login
- [ ] Verificar se `localStorage` foi limpo

### **Teste com Segundo Usuário**
- [ ] Fazer logout
- [ ] Login com: `marilia12cavalheiro@gmail.com`
- [ ] Senha: `2#Todoscria`
- [ ] Verificar se mostra nome "Marilia Marques"
- [ ] Verificar role "marketing_strategist"

---

## 🎯 RESULTADO ESPERADO

### **✅ Sucesso Total**
```
1. Login com Pietra: ✅
2. Acesso ao dashboard: ✅
3. Navegação funciona: ✅
4. Logout funciona: ✅
5. Login com Marilia: ✅
6. Acesso ao dashboard: ✅
```

### **⚠️ Sucesso Parcial**
```
1. Login funciona: ✅
2. Dashboard carrega: ✅
3. Algumas páginas não carregam: ⚠️
   → Verificar permissões RLS
4. Alguns dados não aparecem: ⚠️
   → Verificar business_id/creator_id
```

### **❌ Falha**
```
1. Login não funciona: ❌
   → Verificar console e logs
2. Erro "Email ou senha incorretos": ❌
   → Verificar se usuário existe em platform_users
3. Erro 500: ❌
   → Verificar logs do servidor
```

---

## 📝 REPORTAR RESULTADOS

Após testar, me informe:

### **Se funcionou:**
```
✅ Login funcionou!
- Usuário: [nome]
- Dashboard carregou: [sim/não]
- Navegação funciona: [sim/não]
- Dados aparecem: [sim/não]
```

### **Se não funcionou:**
```
❌ Login não funcionou
- Erro mostrado: [mensagem]
- Console do navegador: [copiar logs]
- Console do servidor: [copiar logs]
```

---

## 🚀 PRÓXIMOS PASSOS

Após confirmar que login funciona:

1. ✅ Testar acesso a diferentes páginas
2. ✅ Verificar permissões de cada role
3. ✅ Testar criação/edição de dados
4. ✅ Verificar isolamento de dados (RLS)
5. ⏳ Implementar hash de senha
6. ⏳ Adicionar mais usuários

---

**Última atualização:** 2025-10-15  
**Status:** 🧪 Pronto para testar

