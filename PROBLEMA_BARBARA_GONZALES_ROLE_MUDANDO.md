# 🚨 PROBLEMA: Barbara Gonzales - Role Mudando Automaticamente

**Data:** 2025-12-19  
**Reportado por:** Luiz Vincenzi  
**Usuária Afetada:** Barbara Gonzales  
**Problema:** Role mudando de `marketing_strategist` para `creator` automaticamente

---

## 📋 RESUMO DO PROBLEMA

Barbara Gonzales reportou que estava sem acesso à plataforma. Ao verificar no Supabase:

1. ✅ **Antes:** `platform_user_role` = `marketing_strategist` (correto)
2. ❌ **Depois:** `platform_user_role` = `creator` (errado - sem acesso)
3. 🔧 **Correção Manual:** Atualizado manualmente para `marketing_strategist` na plataforma
4. ⚠️ **Problema:** Role voltou a mudar para `creator` automaticamente

---

## 🔍 CAUSA RAIZ IDENTIFICADA

### **TRIGGER AUTOMÁTICO NO SUPABASE**

Existe um trigger chamado `trigger_sync_creator_platform_access` que **sobrescreve automaticamente** o `role` em `platform_users` sempre que a tabela `creators` é atualizada.

**Arquivo:** `supabase/migrations/033_fix_creator_platform_sync.sql`

**Trigger:**
```sql
CREATE TRIGGER trigger_sync_creator_platform_access
  AFTER INSERT OR UPDATE OF platform_access_status, platform_email, platform_roles, platform_password_hash ON creators
  FOR EACH ROW
  EXECUTE FUNCTION sync_creator_to_platform_user();
```

**Função Problemática:**
```sql
ON CONFLICT (id) DO UPDATE SET
  is_active = true,
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,  -- ← SOBRESCREVE O ROLE!
  roles = EXCLUDED.roles,
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();
```

**Lógica do Role:**
```sql
role = CASE 
  WHEN 'marketing_strategist' = ANY(NEW.platform_roles) THEN 'marketing_strategist'
  ELSE 'creator'  -- ← SE NÃO TIVER marketing_strategist em platform_roles, vira 'creator'!
END,
```

---

## 🎯 CENÁRIO PROVÁVEL

1. **Barbara Gonzales** tem `role = 'marketing_strategist'` em `platform_users`
2. **Alguém ou algum processo** atualiza a tabela `creators` (pode ser qualquer campo: `platform_email`, `platform_password_hash`, etc.)
3. **Trigger dispara** automaticamente
4. **Trigger verifica** `platform_roles` na tabela `creators`
5. **Se `platform_roles` NÃO contém `'marketing_strategist'`**, o trigger sobrescreve para `'creator'`
6. **Barbara perde acesso** porque agora é `creator` em vez de `marketing_strategist`

---

## 🔎 INVESTIGAÇÃO NECESSÁRIA

Execute o script `SQL_INVESTIGAR_BARBARA_GONZALES.sql` no Supabase para verificar:

### **1. Verificar `platform_roles` na tabela `creators`:**
```sql
SELECT 
  name,
  platform_email,
  platform_roles  -- ← DEVE CONTER 'marketing_strategist'
FROM creators
WHERE platform_email ILIKE '%barbara%gonzales%';
```

**Resultado Esperado:**
- ✅ `platform_roles = ['marketing_strategist', 'creator']` → Trigger vai manter `marketing_strategist`
- ❌ `platform_roles = ['creator']` → Trigger vai sobrescrever para `creator` (PROBLEMA!)

### **2. Verificar `role` em `platform_users`:**
```sql
SELECT 
  email,
  role,
  roles
FROM platform_users
WHERE email ILIKE '%barbara%gonzales%';
```

**Resultado Esperado:**
- ✅ `role = 'marketing_strategist'`
- ✅ `roles = ['marketing_strategist', 'creator']`

---

## ✅ SOLUÇÕES

### **SOLUÇÃO 1: Corrigir `platform_roles` na Tabela `creators` (RÁPIDA)**

Se `platform_roles` não contém `'marketing_strategist'`, execute:

```sql
UPDATE creators
SET 
  platform_roles = ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  updated_at = NOW()
WHERE platform_email ILIKE '%barbara%gonzales%';
```

**Vantagem:** Rápido, resolve imediatamente  
**Desvantagem:** Se alguém atualizar `creators` novamente e remover `marketing_strategist`, o problema volta

---

### **SOLUÇÃO 2: Modificar o Trigger (PERMANENTE) ✅ RECOMENDADO**

Execute o script `SQL_CORRIGIR_TRIGGER_BARBARA_GONZALES.sql` no Supabase.

**O que faz:**
1. ✅ Modifica a função `sync_creator_to_platform_user()` para **PRESERVAR** `marketing_strategist` se já estiver definido
2. ✅ Mesmo que `creators` seja atualizado, o `role` não será sobrescrito
3. ✅ Corrige Barbara Gonzales especificamente
4. ✅ Previne o problema para outros usuários no futuro

**Lógica Melhorada:**
```sql
role = CASE
  -- Se o role atual é marketing_strategist E está em platform_roles, preservar
  WHEN platform_users.role = 'marketing_strategist' 
       AND 'marketing_strategist' = ANY(EXCLUDED.roles) 
  THEN 'marketing_strategist'
  -- Caso contrário, usar o novo role
  ELSE EXCLUDED.role
END,
```

---

## 📊 ARQUIVOS CRIADOS

1. **`SQL_INVESTIGAR_BARBARA_GONZALES.sql`** - Script para investigar o problema
2. **`SQL_CORRIGIR_TRIGGER_BARBARA_GONZALES.sql`** - Script para corrigir permanentemente
3. **`PROBLEMA_BARBARA_GONZALES_ROLE_MUDANDO.md`** - Este documento

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Execute `SQL_INVESTIGAR_BARBARA_GONZALES.sql` no Supabase SQL Editor
2. 📋 Verifique os resultados (especialmente `platform_roles` em `creators`)
3. ✅ Execute `SQL_CORRIGIR_TRIGGER_BARBARA_GONZALES.sql` no Supabase SQL Editor
4. ✅ Verifique se Barbara Gonzales consegue acessar a plataforma
5. 📝 Monitore por alguns dias para garantir que o problema não volta

---

## 📌 PREVENÇÃO FUTURA

- ✅ Sempre definir `platform_roles` corretamente ao criar/atualizar creators
- ✅ Usar o trigger modificado que preserva `marketing_strategist`
- ✅ Adicionar validação na UI para impedir remoção acidental de roles
- ✅ Criar audit log para rastrear mudanças em `platform_users.role`

---

## 🔗 REFERÊNCIAS

- Migration: `supabase/migrations/033_fix_creator_platform_sync.sql`
- Trigger: `trigger_sync_creator_platform_access`
- Função: `sync_creator_to_platform_user()`
- Tabelas: `creators`, `platform_users`

