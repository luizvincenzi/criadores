# 🔍 DEBUG - LP Não Atualiza Após Versão 20

## 🚨 PROBLEMA REPORTADO

Você criou a versão 20 da LP de advogados no Supabase, mas a mudança não apareceu no site.

---

## 🛠️ FERRAMENTAS DE DEBUG CRIADAS

### 1. **Endpoint de Debug**

Criei um endpoint que mostra EXATAMENTE qual versão está sendo buscada do banco:

```
https://criadores.app/api/debug/lp-version?slug=empresas/social-media-advogados
```

**O que ele retorna:**
```json
{
  "success": true,
  "slug": "empresas/social-media-advogados",
  "name": "Social Media para Advogados",
  "version_number": 20,
  "version_created_at": "2025-10-14T12:45:00Z",
  "hero_title": "Título da versão 20",
  "hero_subtitle": "Subtítulo da versão 20",
  "timestamp": "2025-10-14T12:50:00Z"
}
```

### 2. **Logs no Console**

Adicionei logs detalhados que aparecem no Vercel:
- 🔍 LP ID e slug sendo buscado
- ✅ Número da versão encontrada
- 📝 Primeiros 50 caracteres do título
- 📝 Data de criação da versão

---

## 🧪 PASSO A PASSO PARA DEBUG

### **Passo 1: Aguardar Deploy**

Aguarde 1-2 minutos para o deploy completar no Vercel.

**Verificar:** https://vercel.com/seu-projeto/deployments

---

### **Passo 2: Testar Endpoint de Debug**

Abra no navegador (ou use curl):

```bash
curl https://criadores.app/api/debug/lp-version?slug=empresas/social-media-advogados
```

**OU acesse direto:**
```
https://criadores.app/api/debug/lp-version?slug=empresas/social-media-advogados
```

**O que verificar:**
- ✅ `version_number` deve ser **20**
- ✅ `hero_title` deve ser o título da versão 20
- ✅ `timestamp` deve ser recente (agora)

**Se `version_number` for 20:**
- ✅ O banco está correto
- ✅ O service está buscando corretamente
- ❌ O problema é no cache do navegador ou CDN

**Se `version_number` NÃO for 20:**
- ❌ Há um problema no banco ou na query
- Vá para o Passo 3

---

### **Passo 3: Verificar Versão 20 no Banco**

Abra o Supabase SQL Editor e execute:

```sql
-- Ver TODAS as versões da LP de advogados
SELECT 
  version_number,
  created_at,
  change_description,
  snapshot->'variables'->'hero'->>'title' as titulo,
  snapshot->'variables'->'hero'->>'subtitle' as subtitulo
FROM lp_versions 
WHERE lp_id = (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados')
ORDER BY version_number DESC;
```

**O que verificar:**
- ✅ Versão 20 existe?
- ✅ Versão 20 tem o título correto?
- ✅ Versão 20 é a MAIOR version_number?

**Se versão 20 NÃO existe:**
- ❌ O INSERT falhou
- Tente criar novamente (veja Passo 5)

**Se versão 20 existe mas não é a maior:**
- ❌ Alguém criou versão 21, 22, etc.
- O sistema SEMPRE busca a maior versão
- Crie uma nova versão com número maior

---

### **Passo 4: Verificar LP ID**

```sql
-- Ver ID da LP de advogados
SELECT id, slug, name, status, is_active
FROM landing_pages
WHERE slug = 'empresas/social-media-advogados';
```

**O que verificar:**
- ✅ `status` = 'active'
- ✅ `is_active` = true
- ✅ Anote o `id` (deve ser algo como `20000000-0000-0000-0000-000000000006`)

---

### **Passo 5: Criar Versão 21 (Teste Definitivo)**

Se a versão 20 não funcionou, vamos criar versão 21 com um título MUITO ÓBVIO:

```sql
INSERT INTO lp_versions (lp_id, version_number, snapshot, change_description)
VALUES (
  (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados'),
  21, -- ← VERSÃO 21
  '{
    "seo": {
      "title": "Social Media para Advogados | Marketing Jurídico Ético | crIAdores",
      "description": "Social media especializada para advogados e escritórios de advocacia. Conteúdo jurídico ético que gera autoridade e clientes qualificados.",
      "keywords": ["marketing jurídico", "social media para advogados", "marketing para advogados", "advocacia digital"],
      "og_image": "/assets/og-advogados.jpg",
      "og_type": "website",
      "canonical": "https://criadores.app/empresas/social-media-advogados",
      "robots": "index, follow"
    },
    "config": {
      "segment": "advogados",
      "chatbot_url": "/chatcriadores-advogados",
      "conversion_goal": "chatbot_click",
      "features": {
        "show_urgency": true,
        "show_countdown": false,
        "show_compliance": true
      }
    },
    "variables": {
      "hero": {
        "title": "🚀 VERSÃO 21 FUNCIONANDO - Construa Autoridade e Atraia Clientes Qualificados",
        "subtitle": "Se você está vendo VERSÃO 21, o sistema está funcionando perfeitamente! 🎉",
        "cta_text": "Falar Com Especialista Agora",
        "cta_url": "/chatcriadores-advogados",
        "urgency_badge": "100% Compliance OAB • Marketing Ético • Captação de Clientes",
        "social_proof": {
          "compliance": 100,
          "advogados_atendidos": 12
        },
        "trust_badges": ["Compliance OAB", "Conteúdo Jurídico", "Captação de Clientes"]
      },
      "problema": {
        "title": "Por Que Advogados Precisam de Marketing Digital?",
        "subtitle": "O cliente moderno pesquisa online antes de contratar um advogado",
        "agitation": "Mas você não tem tempo para criar conteúdo. Por isso criamos uma solução completa de marketing jurídico — ético, profissional e que gera clientes qualificados.",
        "problems": [
          {
            "icon": "🔍",
            "title": "82% Pesquisam Online",
            "description": "Antes de escolher um advogado ou escritório"
          },
          {
            "icon": "⚖️",
            "title": "Autoridade Digital",
            "description": "Conteúdo jurídico gera confiança e credibilidade"
          },
          {
            "icon": "💼",
            "title": "Captação Qualificada",
            "description": "Clientes chegam mais informados e prontos para contratar"
          }
        ]
      },
      "faq": [
        {
          "question": "O conteúdo segue as normas da OAB?",
          "answer": "Sim! 100%. Todo conteúdo é revisado por especialista em marketing jurídico e segue rigorosamente as normas da OAB."
        }
      ]
    }
  }'::jsonb,
  'Teste definitivo - versão 21 com título óbvio'
);
```

---

### **Passo 6: Testar Novamente**

**6.1. Testar Endpoint de Debug:**
```
https://criadores.app/api/debug/lp-version?slug=empresas/social-media-advogados
```

**Deve retornar:**
```json
{
  "version_number": 21,
  "hero_title": "🚀 VERSÃO 21 FUNCIONANDO - Construa Autoridade..."
}
```

**6.2. Testar Página Pública:**
```
https://criadores.app/empresas/social-media-advogados
```

**Deve mostrar:**
- ✅ Título: "🚀 VERSÃO 21 FUNCIONANDO - Construa Autoridade..."

**6.3. Force Refresh:**
- Chrome/Edge: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5` (Windows) ou `Cmd + Shift + R` (Mac)

**6.4. Testar em Aba Anônima:**
- Chrome: `Ctrl + Shift + N` (Windows) ou `Cmd + Shift + N` (Mac)

---

## 🔍 POSSÍVEIS CAUSAS

### **Causa 1: Cache do Navegador**
- **Sintoma:** Endpoint de debug mostra versão 21, mas página mostra versão antiga
- **Solução:** Force refresh (Ctrl+Shift+R) ou aba anônima

### **Causa 2: Cache do CDN (Vercel)**
- **Sintoma:** Endpoint de debug mostra versão 21, mas página mostra versão antiga (mesmo em aba anônima)
- **Solução:** Aguardar 1-2 minutos ou fazer redeploy no Vercel

### **Causa 3: Deploy Não Completou**
- **Sintoma:** Endpoint de debug retorna 404 ou erro
- **Solução:** Aguardar deploy completar no Vercel

### **Causa 4: Versão 20 Não Foi Criada Corretamente**
- **Sintoma:** Endpoint de debug mostra version_number < 20
- **Solução:** Verificar no banco (Passo 3) e criar versão 21 (Passo 5)

### **Causa 5: Há Versão Mais Recente**
- **Sintoma:** Endpoint de debug mostra version_number > 20 (ex: 22, 23)
- **Solução:** Alguém criou versões mais recentes. Sistema sempre busca a MAIOR versão.

---

## 📊 CHECKLIST DE VERIFICAÇÃO

- [ ] Deploy completado no Vercel
- [ ] Endpoint de debug retorna versão 21
- [ ] Endpoint de debug mostra título correto
- [ ] Versão 21 existe no banco
- [ ] Versão 21 é a MAIOR version_number
- [ ] LP tem status='active' e is_active=true
- [ ] Force refresh no navegador
- [ ] Testado em aba anônima
- [ ] Página mostra "🚀 VERSÃO 21 FUNCIONANDO"

---

## 🎯 PRÓXIMOS PASSOS

### **Se Funcionar:**
1. ✅ Confirme que vê "🚀 VERSÃO 21 FUNCIONANDO"
2. ✅ Crie versão 22 com o conteúdo final correto
3. ✅ Remova emojis de teste do título

### **Se NÃO Funcionar:**
1. ❌ Copie o resultado do endpoint de debug
2. ❌ Copie o resultado da query SQL (Passo 3)
3. ❌ Me envie os 2 resultados para investigar

---

## 🚀 COMANDOS RÁPIDOS

### Verificar Versão Atual (API):
```bash
curl https://criadores.app/api/debug/lp-version?slug=empresas/social-media-advogados
```

### Verificar Versões no Banco (SQL):
```sql
SELECT version_number, created_at, 
       snapshot->'variables'->'hero'->>'title' as titulo
FROM lp_versions 
WHERE lp_id = (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados')
ORDER BY version_number DESC LIMIT 5;
```

### Ver Logs no Vercel:
1. Acesse: https://vercel.com/seu-projeto/deployments
2. Clique no último deployment
3. Clique em "Functions"
4. Procure por logs com 🔍, ✅, 📝

---

**Aguarde o deploy completar e teste o endpoint de debug. Me envie o resultado! 🔍**

