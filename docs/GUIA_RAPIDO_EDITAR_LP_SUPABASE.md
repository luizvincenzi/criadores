# 🚀 GUIA RÁPIDO - Editar LP no Supabase

## ✅ IMPORTANTE: Como o Sistema Funciona

O sistema **SEMPRE** busca a versão com `version_number` MAIOR da tabela `lp_versions`.

**Exemplo:**
- Se você tem versões: 1, 2, 3, 4, 5, 6, 7, 8, **9**
- O site mostra a versão **9** (maior número)
- Se você editar a versão 5 → Site continua mostrando versão 9
- Se você editar a tabela `landing_pages` → Site ignora (usa `lp_versions`)

---

## 📝 PASSO A PASSO - Editar LP de Advogados

### 1️⃣ Abrir Supabase SQL Editor

Acesse: https://supabase.com/dashboard/project/SEU_PROJETO/sql

### 2️⃣ Descobrir o ID da LP

```sql
SELECT id, slug, name 
FROM landing_pages 
WHERE slug = 'empresas/social-media-advogados';
```

**Copie o `id`** (exemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### 3️⃣ Ver Versão Atual

```sql
SELECT 
  version_number,
  created_at,
  snapshot->'variables'->'hero'->>'title' as titulo_atual
FROM lp_versions 
WHERE lp_id = 'SEU_LP_ID_AQUI' -- ← Colar o ID copiado
ORDER BY version_number DESC 
LIMIT 1;
```

**Anote o `version_number`** (exemplo: 9)

### 4️⃣ Copiar Snapshot Completo

```sql
SELECT snapshot 
FROM lp_versions 
WHERE lp_id = 'SEU_LP_ID_AQUI'
ORDER BY version_number DESC 
LIMIT 1;
```

**Copie TODO o JSON** que aparecer.

### 5️⃣ Editar o JSON

Cole o JSON em um editor de texto e faça suas mudanças.

**Exemplo - Mudar o título:**

```json
{
  "variables": {
    "hero": {
      "title": "NOVO TÍTULO AQUI", // ← Edite aqui
      "subtitle": "Novo subtítulo aqui", // ← Edite aqui
      ...
    },
    ...
  },
  ...
}
```

### 6️⃣ Criar Nova Versão

```sql
INSERT INTO lp_versions (lp_id, version_number, snapshot, change_description)
VALUES (
  'SEU_LP_ID_AQUI', -- ← Colar o ID da LP
  10, -- ← INCREMENTAR! Se última era 9, nova é 10
  '{
    "seo": {...},
    "config": {...},
    "variables": {
      "hero": {
        "title": "NOVO TÍTULO AQUI",
        ...
      },
      ...
    }
  }'::jsonb, -- ← Colar o JSON editado (não esquecer ::jsonb no final!)
  'Atualizei o título do hero' -- ← Descrição da mudança
);
```

**ATENÇÃO:**
- ✅ Incrementar `version_number` (se última é 9, nova é 10)
- ✅ Colar JSON completo editado
- ✅ Adicionar `::jsonb` no final do JSON
- ✅ Usar aspas simples `'` ao redor do JSON

### 7️⃣ Verificar se Funcionou

```sql
-- Ver última versão
SELECT 
  version_number,
  created_at,
  snapshot->'variables'->'hero'->>'title' as titulo
FROM lp_versions 
WHERE lp_id = 'SEU_LP_ID_AQUI'
ORDER BY version_number DESC 
LIMIT 1;
```

Deve mostrar a versão 10 com o novo título!

### 8️⃣ Testar no Navegador

Acesse: `https://criadores.app/empresas/social-media-advogados`

**Dica:** Adicione `?v=123` para forçar reload:
`https://criadores.app/empresas/social-media-advogados?v=123`

---

## 🎯 EXEMPLO COMPLETO - Mudar "MAIS UM" do Título

Você quer mudar:
```
"MAIS UM Construa Autoridade..."
```

Para:
```
"Construa Autoridade..."
```

### SQL Completo:

```sql
-- 1. Ver ID da LP
SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados';
-- Resultado: a1b2c3d4-e5f6-7890-abcd-ef1234567890

-- 2. Ver versão atual
SELECT version_number FROM lp_versions 
WHERE lp_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
ORDER BY version_number DESC LIMIT 1;
-- Resultado: 9

-- 3. Copiar snapshot
SELECT snapshot FROM lp_versions 
WHERE lp_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
ORDER BY version_number DESC LIMIT 1;
-- Copiar TODO o JSON

-- 4. Criar versão 10 com título corrigido
INSERT INTO lp_versions (lp_id, version_number, snapshot, change_description)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  10, -- Nova versão!
  '{
    "seo": {
      "title": "Social Media para Advogados | Marketing Jurídico Ético | crIAdores",
      "robots": "index, follow",
      "og_type": "website",
      "keywords": ["marketing jurídico", "social media para advogados"],
      "og_image": "/assets/og-advogados.jpg",
      "canonical": "https://criadores.app/empresas/social-media-advogados",
      "description": "Social media especializada para advogados e escritórios."
    },
    "config": {
      "segment": "advogados",
      "features": {
        "show_urgency": true,
        "show_countdown": false,
        "show_compliance": true
      },
      "chatbot_url": "/chatcriadores-advogados"
    },
    "variables": {
      "hero": {
        "title": "Construa Autoridade e Atraia Clientes Qualificados Para Seu Escritório",
        "subtitle": "Social media especializada para advogados e escritórios de advocacia.",
        "cta_text": "Falar Com Especialista Agora",
        "cta_url": "/chatcriadores-advogados"
      },
      "problema": {
        "title": "Por Que Advogados Precisam de Marketing Digital?",
        "subtitle": "O cliente moderno pesquisa online antes de contratar"
      }
    }
  }'::jsonb,
  'Removido MAIS UM do título'
);

-- 5. Verificar
SELECT version_number, snapshot->'variables'->'hero'->>'title' as titulo
FROM lp_versions 
WHERE lp_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
ORDER BY version_number DESC LIMIT 1;
```

---

## ⚠️ ERROS COMUNS

### ❌ Erro: "Editei mas não aparece"

**Causa:** Você editou uma versão antiga ou a tabela `landing_pages`.

**Solução:** Sempre criar NOVA versão com `version_number` incrementado.

### ❌ Erro: "syntax error at or near"

**Causa:** Esqueceu `::jsonb` no final do JSON.

**Solução:** Adicionar `::jsonb` depois do JSON:
```sql
'{"variables": {...}}'::jsonb
```

### ❌ Erro: "duplicate key value"

**Causa:** Já existe uma versão com esse `version_number`.

**Solução:** Incrementar mais (se tem 10, usar 11).

---

## 🎨 Campos Principais para Editar

### Hero (Topo da Página)
```json
"hero": {
  "title": "Título principal",
  "subtitle": "Subtítulo",
  "cta_text": "Texto do botão",
  "cta_url": "/chatcriadores-advogados"
}
```

### Problema
```json
"problema": {
  "title": "Título da seção",
  "subtitle": "Subtítulo",
  "problems": [
    {
      "icon": "🔍",
      "title": "Título do problema",
      "description": "Descrição"
    }
  ]
}
```

### Soluções (Preços)
```json
"solucoes": [
  {
    "title": "Nome do plano",
    "description": "Descrição",
    "price_monthly": 2500,
    "price_semestral": 1500,
    "benefits": ["Benefício 1", "Benefício 2"]
  }
]
```

### Depoimentos
```json
"depoimentos": [
  {
    "name": "Nome do cliente",
    "role": "Cargo",
    "company": "Empresa",
    "text": "Depoimento",
    "result": "+25 consultas/mês"
  }
]
```

---

## 📊 Verificar Histórico Completo

```sql
SELECT 
  version_number,
  created_at,
  change_description,
  snapshot->'variables'->'hero'->>'title' as titulo
FROM lp_versions 
WHERE lp_id = 'SEU_LP_ID_AQUI'
ORDER BY version_number DESC;
```

---

## ✅ Checklist Antes de Salvar

- [ ] Copiei o ID correto da LP
- [ ] Vi qual é a última `version_number`
- [ ] Incrementei o `version_number` (+1)
- [ ] Copiei o snapshot completo
- [ ] Editei apenas o que preciso mudar
- [ ] Adicionei `::jsonb` no final do JSON
- [ ] Adicionei descrição da mudança
- [ ] Testei no navegador

---

**Pronto! Agora você pode editar suas LPs diretamente no Supabase e elas atualizam automaticamente no site! 🚀**

