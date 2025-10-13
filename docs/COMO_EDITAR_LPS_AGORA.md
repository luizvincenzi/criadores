# 🎯 Como Editar Landing Pages - GUIA COMPLETO

## ✅ PROBLEMA RESOLVIDO!

Agora você tem **3 formas** de editar suas Landing Pages:

---

## 📋 Opção 1: Via API (RECOMENDADO)

### Passo 1: Descobrir o ID da LP

Execute no Supabase SQL Editor:

```sql
SELECT id, slug, name 
FROM landing_pages 
WHERE slug = 'empresas/social-media-advogados';
```

Copie o `id` (UUID).

### Passo 2: Criar Nova Versão via API

```bash
curl -X POST "http://localhost:3007/api/landing-pages/SEU_LP_ID/versions" \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "hero": {
        "headline": "Seu Novo Headline Aqui",
        "subheadline": "Seu novo subheadline",
        "cta_text": "Falar com Especialista"
      },
      "problema": {
        "titulo": "Título da seção problema",
        "descricao": "Descrição..."
      }
    },
    "change_description": "Atualizei o headline e problema",
    "created_by": "admin"
  }'
```

### Passo 3: Verificar

Acesse a LP no navegador: `http://localhost:3007/empresas/social-media-advogados`

**A mudança deve aparecer IMEDIATAMENTE!**

---

## 📋 Opção 2: Via Supabase (Manual)

### ⚠️ IMPORTANTE: Não edite a tabela `landing_pages`!

O sistema **SEMPRE** busca de `lp_versions`. Editar `landing_pages` não funciona!

### Passo 1: Ver Versões Atuais

```sql
SELECT version_number, created_at, 
       snapshot->'variables'->'hero'->>'headline' as headline
FROM lp_versions 
WHERE lp_id = 'SEU_LP_ID'
ORDER BY version_number DESC;
```

### Passo 2: Copiar Última Versão

```sql
-- Copiar snapshot da última versão
SELECT snapshot 
FROM lp_versions 
WHERE lp_id = 'SEU_LP_ID'
ORDER BY version_number DESC 
LIMIT 1;
```

Copie o JSON completo.

### Passo 3: Criar Nova Versão

```sql
INSERT INTO lp_versions (lp_id, version_number, snapshot, change_description)
VALUES (
  'SEU_LP_ID',
  11, -- ← Incrementar! Se última é 10, nova é 11
  '{
    "variables": {
      "hero": {
        "headline": "NOVO HEADLINE AQUI",
        "subheadline": "Novo subheadline",
        ...
      },
      ...
    },
    "config": {...},
    "seo": {...}
  }'::jsonb,
  'Descrição da mudança'
);
```

**ATENÇÃO:**
- ✅ Sempre **INCREMENTAR** o `version_number`
- ✅ Copiar o JSON completo e editar
- ✅ Usar `::jsonb` no final do JSON
- ❌ **NUNCA** editar versão existente (criar nova!)

---

## 📋 Opção 3: Via Service (Código)

```typescript
import { landingPagesService } from '@/lib/services/landingPagesService';

// Criar nova versão
const newVersion = await landingPagesService.createVersion(
  'SEU_LP_ID',
  {
    variables: {
      hero: {
        headline: 'Novo Headline',
        subheadline: 'Novo Subheadline',
        cta_text: 'Falar com Especialista'
      },
      problema: {
        titulo: 'Título',
        descricao: 'Descrição'
      }
    },
    change_description: 'Atualizei hero e problema',
    created_by: 'admin'
  }
);

console.log('Nova versão criada:', newVersion.version_number);
```

---

## 🔍 Como Verificar se Funcionou

### 1. Via SQL (Supabase)

```sql
-- Ver última versão
SELECT version_number, created_at,
       snapshot->'variables'->'hero'->>'headline' as headline
FROM lp_versions 
WHERE lp_id = 'SEU_LP_ID'
ORDER BY version_number DESC 
LIMIT 1;
```

### 2. Via API

```bash
curl "http://localhost:3007/api/landing-pages/SEU_LP_ID/versions" | jq '.data.versions[0]'
```

### 3. Via Navegador

Acesse: `http://localhost:3007/empresas/social-media-advogados`

**Dica:** Adicione `?v=timestamp` para forçar reload:
`http://localhost:3007/empresas/social-media-advogados?v=123456`

---

## 🐛 Troubleshooting

### Problema: "Editei mas não aparece"

**Causa:** Você editou a tabela `landing_pages` ou uma versão antiga.

**Solução:**
1. Execute o script de verificação: `scripts/verificar-lp-advogados.sql`
2. Veja qual é a `version_number` da última versão
3. Crie uma NOVA versão com `version_number` MAIOR

### Problema: "Tenho 9 versões, qual está ativa?"

**Resposta:** A com `version_number` MAIOR.

```sql
SELECT version_number, created_at
FROM lp_versions 
WHERE lp_id = 'SEU_LP_ID'
ORDER BY version_number DESC 
LIMIT 1;
```

Esta é a que aparece no site!

### Problema: "Como voltar para versão anterior?"

**Opção A - Via API:**
```bash
# Buscar versão antiga
curl "http://localhost:3007/api/landing-pages/SEU_LP_ID/versions"

# Criar nova versão com dados da antiga
curl -X POST "http://localhost:3007/api/landing-pages/SEU_LP_ID/versions" \
  -d '{ "variables": {...dados da versão antiga...} }'
```

**Opção B - Via SQL:**
```sql
-- Copiar snapshot da versão 5 (por exemplo)
INSERT INTO lp_versions (lp_id, version_number, snapshot, change_description)
SELECT 
  lp_id,
  (SELECT MAX(version_number) + 1 FROM lp_versions WHERE lp_id = 'SEU_LP_ID'),
  snapshot,
  'Restaurado versão 5'
FROM lp_versions 
WHERE lp_id = 'SEU_LP_ID' AND version_number = 5;
```

---

## 📊 Estrutura do Snapshot

```json
{
  "variables": {
    "hero": {
      "headline": "Título principal",
      "subheadline": "Subtítulo",
      "cta_text": "Texto do botão",
      "background_color": "#1a1a2e"
    },
    "problema": {
      "titulo": "Título da seção",
      "descricao": "Descrição",
      "bullets": ["Item 1", "Item 2"]
    },
    "solucoes": [
      {
        "titulo": "Solução 1",
        "descricao": "Descrição",
        "preco": "R$ 997",
        "bullets": ["Benefício 1", "Benefício 2"]
      }
    ],
    "combo": {
      "titulo": "Combo Especial",
      "preco_original": "R$ 2.991",
      "preco_combo": "R$ 1.997",
      "economia": "R$ 994"
    },
    "depoimentos": [
      {
        "nome": "João Silva",
        "cargo": "Advogado",
        "texto": "Excelente serviço!",
        "foto": "/images/joao.jpg"
      }
    ],
    "faq": [
      {
        "pergunta": "Como funciona?",
        "resposta": "Funciona assim..."
      }
    ]
  },
  "config": {
    "theme": "dark",
    "layout": "default"
  },
  "seo": {
    "title": "Título SEO",
    "description": "Descrição SEO",
    "keywords": ["palavra1", "palavra2"]
  }
}
```

---

## 🚀 Próximos Passos

### Já Implementado:
- ✅ API de versionamento
- ✅ Métodos no service
- ✅ Scripts de verificação

### Ainda Falta (Opcional):
- [ ] Interface web de edição
- [ ] Preview em tempo real
- [ ] Comparação de versões
- [ ] Restauração com 1 clique

**Quer que eu implemente a interface web?**

---

## 📝 Resumo Rápido

**Para editar uma LP:**

1. **Via API (mais fácil):**
   ```bash
   curl -X POST "http://localhost:3007/api/landing-pages/ID/versions" \
     -H "Content-Type: application/json" \
     -d '{"variables": {...}}'
   ```

2. **Via Supabase:**
   - Copiar snapshot da última versão
   - Criar nova linha em `lp_versions`
   - Incrementar `version_number`
   - Editar JSON do snapshot

3. **Via Código:**
   ```typescript
   await landingPagesService.createVersion(lpId, { variables: {...} });
   ```

**NUNCA edite a tabela `landing_pages` diretamente!**

---

**Criado em:** 2025-01-XX  
**Status:** ✅ Funcionando  
**Testado:** Sim

