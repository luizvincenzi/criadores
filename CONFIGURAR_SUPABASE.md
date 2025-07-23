# 🔧 CONFIGURAÇÃO DO SUPABASE - PASSO A PASSO

## 📋 PASSOS PARA OBTER AS CREDENCIAIS:

### 1️⃣ **Acesse o Supabase Dashboard**
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione seu projeto (ou crie um novo se não tiver)

### 2️⃣ **Obtenha as Credenciais**
- No painel do projeto, vá em **Settings** (⚙️) no menu lateral
- Clique em **API** 
- Você verá 3 informações importantes:

#### 📍 **Project URL**
```
https://[seu-projeto-id].supabase.co
```

#### 🔑 **API Keys**
- **anon/public key** - Chave pública (pode ser exposta no frontend)
- **service_role key** - Chave secreta (⚠️ NUNCA exponha publicamente)

### 3️⃣ **Configure o arquivo .env.local**

Substitua as variáveis no arquivo `.env.local` com seus valores reais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-chave-anon-aqui]
SUPABASE_SERVICE_ROLE_KEY=[sua-chave-service-role-aqui]
```

### 4️⃣ **Execute as Migrações do Banco**

Após configurar as credenciais, execute:

```bash
# Criar organização padrão
npx tsx scripts/create-default-organization.ts

# Verificar estrutura do banco
npx tsx scripts/verify-migration.ts
```

### 5️⃣ **Reinicie o Servidor**

```bash
# Pare o servidor atual (Ctrl+C)
# Reinicie:
npm run dev
```

## 🔍 **Como Encontrar Seu Projeto Supabase:**

Se você não tem certeza qual projeto usar:

1. **Verifique projetos existentes** em https://supabase.com/dashboard
2. **Procure por um projeto** que tenha as tabelas do CRM:
   - `organizations`
   - `businesses` 
   - `users`
   - `creators`
   - `campaigns`

3. **Se não tiver projeto**, crie um novo:
   - Clique em "New Project"
   - Escolha um nome (ex: "crm-criadores")
   - Selecione uma região próxima (ex: South America)
   - Defina uma senha forte para o banco

## ⚠️ **IMPORTANTE:**

- **NUNCA** compartilhe a `service_role key` publicamente
- **SEMPRE** use `.env.local` para desenvolvimento local
- **VERIFIQUE** se o `.env.local` está no `.gitignore`

## 🆘 **Precisa de Ajuda?**

Se você não conseguir encontrar as credenciais ou tiver dúvidas:

1. **Me informe** se você já tem um projeto Supabase
2. **Compartilhe** apenas a URL do projeto (sem as chaves)
3. **Posso ajudar** a criar um novo projeto se necessário
