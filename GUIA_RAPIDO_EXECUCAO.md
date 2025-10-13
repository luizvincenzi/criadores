# ⚡ GUIA RÁPIDO DE EXECUÇÃO - SISTEMA DE LPs

## 🎯 OBJETIVO

Migrar as 6 Landing Pages existentes para o banco de dados e validar que tudo está funcionando.

---

## ⏱️ TEMPO ESTIMADO: 30 minutos

---

## 📝 PASSO A PASSO

### 1️⃣ Acessar Supabase (2 min)

1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto
4. Vá em **SQL Editor** (menu lateral esquerdo)

---

### 2️⃣ Executar Migration (5 min)

1. Clique em **New Query**
2. Copie TODO o conteúdo de `database/migrations/001_landing_pages_system.sql`
3. Cole no editor
4. Clique em **Run** (ou Ctrl+Enter)
5. Aguarde a execução (pode levar 30-60 segundos)

**✅ Resultado esperado:**
```
Success. No rows returned
```

**❌ Se der erro:**
- Verifique se já existe alguma tabela com nome `landing_pages` ou `lp_*`
- Se sim, delete as tabelas antigas primeiro

---

### 3️⃣ Executar Seeds - Templates (3 min)

1. Clique em **New Query**
2. Copie TODO o conteúdo de `database/seeds/001_initial_templates.sql`
3. Cole no editor
4. Clique em **Run**

**✅ Resultado esperado:**
```
Success. 3 rows affected
```

---

### 4️⃣ Executar Seeds - LP Principal (3 min)

1. Clique em **New Query**
2. Copie TODO o conteúdo de `database/seeds/002_initial_landing_pages.sql`
3. Cole no editor
4. Clique em **Run**

**✅ Resultado esperado:**
```
Success. 4 rows affected
(1 LP + 3 produtos relacionados)
```

---

### 5️⃣ Executar Seeds - Demais LPs (10 min)

Execute **na ordem**:

#### 5.1 - Mentoria + Social Media
1. Clique em **New Query**
2. Copie TODO o conteúdo de `database/seeds/003_all_landing_pages.sql`
3. Cole no editor
4. Clique em **Run**

**✅ Resultado esperado:**
```
Success. 4 rows affected
(2 LPs + 2 produtos relacionados)
```

#### 5.2 - Criadores
1. Clique em **New Query**
2. Copie TODO o conteúdo de `database/seeds/004_lp_criadores.sql`
3. Cole no editor
4. Clique em **Run**

**✅ Resultado esperado:**
```
Success. 2 rows affected
(1 LP + 1 produto relacionado)
```

#### 5.3 - Médicos
1. Clique em **New Query**
2. Copie TODO o conteúdo de `database/seeds/005_lp_medicos.sql`
3. Cole no editor
4. Clique em **Run**

**✅ Resultado esperado:**
```
Success. 2 rows affected
(1 LP + 1 produto relacionado)
```

#### 5.4 - Advogados
1. Clique em **New Query**
2. Copie TODO o conteúdo de `database/seeds/006_lp_advogados.sql`
3. Cole no editor
4. Clique em **Run**

**✅ Resultado esperado:**
```
Success. 2 rows affected
(1 LP + 1 produto relacionado)
```

---

### 6️⃣ Validar Dados (5 min)

Execute estas queries para validar:

#### Verificar Templates
```sql
SELECT id, name, slug, methodology 
FROM lp_templates 
ORDER BY created_at;
```

**✅ Esperado:** 3 linhas
- combo-completo
- produto-unico
- segmento-especifico

---

#### Verificar LPs
```sql
SELECT slug, name, category, status 
FROM landing_pages 
ORDER BY created_at;
```

**✅ Esperado:** 6 linhas (todas com status 'active')
- empresas
- empresas/mentoria
- empresas/social-media
- empresas/criadores
- empresas/social-media-medicos
- empresas/social-media-advogados

---

#### Verificar Produtos Relacionados
```sql
SELECT 
  lp.slug,
  COUNT(lpp.product_id) as total_produtos
FROM landing_pages lp
LEFT JOIN lp_products lpp ON lp.id = lpp.lp_id
GROUP BY lp.id, lp.slug
ORDER BY lp.created_at;
```

**✅ Esperado:**
- empresas: 3 produtos
- empresas/mentoria: 1 produto
- empresas/social-media: 1 produto
- empresas/criadores: 1 produto
- empresas/social-media-medicos: 1 produto
- empresas/social-media-advogados: 1 produto

---

#### Ver Conteúdo de uma LP
```sql
SELECT 
  slug,
  name,
  variables->>'hero' as hero_section,
  seo->>'title' as seo_title
FROM landing_pages
WHERE slug = 'empresas';
```

**✅ Esperado:** 1 linha com JSON do hero e título SEO

---

### 7️⃣ Testar API (2 min)

Se você já tem o criadores.app rodando, teste:

```bash
# Buscar todas as LPs
curl https://criadores.app/api/landing-pages

# Buscar LP específica
curl https://criadores.app/api/landing-pages/empresas
```

**✅ Esperado:** JSON com dados da LP

---

## ✅ CHECKLIST FINAL

Após executar tudo, confirme:

- [ ] 5 tabelas criadas (lp_templates, landing_pages, lp_products, lp_analytics, lp_versions)
- [ ] 3 templates inseridos
- [ ] 6 LPs inseridas (todas com status 'active')
- [ ] 9 relacionamentos LP ↔ Produto criados
- [ ] Queries de validação retornam dados corretos
- [ ] API retorna dados (se já estiver implementada)

---

## 🎉 PRONTO!

Seu banco de dados está populado com todas as 6 LPs!

---

## 🔧 TROUBLESHOOTING

### Erro: "relation already exists"
**Causa:** Tabelas já existem  
**Solução:** 
```sql
-- Delete as tabelas antigas (CUIDADO: isso apaga todos os dados)
DROP TABLE IF EXISTS lp_versions CASCADE;
DROP TABLE IF EXISTS lp_analytics CASCADE;
DROP TABLE IF EXISTS lp_products CASCADE;
DROP TABLE IF EXISTS landing_pages CASCADE;
DROP TABLE IF EXISTS lp_templates CASCADE;

-- Execute a migration novamente
```

---

### Erro: "foreign key violation"
**Causa:** Tentou inserir LP antes de inserir template  
**Solução:** Execute os seeds na ordem correta (templates primeiro)

---

### Erro: "duplicate key value"
**Causa:** LP com mesmo slug já existe  
**Solução:**
```sql
-- Ver LPs existentes
SELECT slug FROM landing_pages;

-- Deletar LP específica
DELETE FROM landing_pages WHERE slug = 'empresas';

-- Executar seed novamente
```

---

### Erro: "invalid input syntax for type json"
**Causa:** JSON malformado no seed  
**Solução:** Copie o arquivo novamente (pode ter cortado no meio)

---

## 📞 PRÓXIMOS PASSOS

Agora que o banco está populado:

1. **Criar projeto criadores.digital** (ver `GUIA_DESENVOLVIMENTO_CRIADORES_DIGITAL.md`)
2. **Atualizar criadores.app** para buscar LPs do banco
3. **Testar renderização** de todas as 6 LPs
4. **Configurar analytics** (opcional)

---

**Dúvidas?** Consulte:
- `database/seeds/README_SEEDS.md` - Documentação completa dos seeds
- `ARQUITETURA_VISUAL.md` - Diagramas da arquitetura
- `README_SISTEMA_LPS.md` - Visão geral do sistema

---

**Tempo total:** ~30 minutos  
**Dificuldade:** ⭐⭐ (Fácil)

🚀 **Vamos lá!**

