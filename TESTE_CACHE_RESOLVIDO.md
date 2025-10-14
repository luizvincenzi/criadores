# 🧪 TESTE - Cache de LPs Resolvido

## ✅ O QUE FOI CORRIGIDO

**Problema:** Você editava LPs no Supabase mas mudanças não apareciam na URL pública.

**Causa:** Next.js estava cacheando as páginas indefinidamente.

**Solução:** Desabilitei o cache em todas as páginas de LP.

---

## 🚀 COMO TESTAR AGORA

### 1️⃣ Aguardar Deploy no Vercel

O código já foi enviado para o GitHub. Aguarde o deploy completar no Vercel (1-2 minutos).

**Verificar deploy:**
- Acesse: https://vercel.com/seu-projeto/deployments
- Aguarde status: ✅ Ready

---

### 2️⃣ Testar Edição de LP

#### Passo 1: Ver Versão Atual

Abra o Supabase SQL Editor e execute:

```sql
-- Ver última versão da LP de advogados
SELECT 
  version_number,
  created_at,
  snapshot->'variables'->'hero'->>'title' as titulo_atual,
  snapshot->'variables'->'hero'->>'subtitle' as subtitulo_atual
FROM lp_versions 
WHERE lp_id = (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados')
ORDER BY version_number DESC 
LIMIT 1;
```

**Resultado esperado:**
- `version_number`: 18
- `titulo_atual`: "OI EAEConstrua Autoridade..."

---

#### Passo 2: Criar Versão 19 (Teste)

```sql
-- Criar versão 19 para testar se cache foi desabilitado
INSERT INTO lp_versions (lp_id, version_number, snapshot, change_description)
VALUES (
  (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados'),
  19,
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
      "chatbot_url": "/chatcriadores-advogados",
      "conversion_goal": "chatbot_click"
    },
    "variables": {
      "hero": {
        "title": "✅ CACHE RESOLVIDO - Construa Autoridade e Atraia Clientes Qualificados",
        "subtitle": "Se você está vendo este título, o cache foi desabilitado com sucesso! 🎉",
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
  'Teste de cache desabilitado - versão 19'
);
```

---

#### Passo 3: Verificar no Site

**Acesse imediatamente:**
```
https://criadores.app/empresas/social-media-advogados
```

**O que você DEVE ver:**
- ✅ Título: "✅ CACHE RESOLVIDO - Construa Autoridade..."
- ✅ Subtítulo: "Se você está vendo este título, o cache foi desabilitado com sucesso! 🎉"

**Se aparecer:**
- ✅ **SUCESSO!** Cache foi desabilitado, mudanças aparecem instantaneamente
- ❌ Se ainda mostrar versão antiga, aguarde mais 1 minuto e force refresh (Ctrl+Shift+R)

---

### 3️⃣ Criar Versão 20 (Versão Final Correta)

Depois de confirmar que funciona, crie a versão 20 com o conteúdo correto (sem "OI EAE"):

```sql
-- Copiar snapshot da versão 18
SELECT snapshot FROM lp_versions 
WHERE lp_id = (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados')
AND version_number = 18;
```

**Copie o JSON completo**, edite para remover "OI EAE" do título e subtítulo, e execute:

```sql
INSERT INTO lp_versions (lp_id, version_number, snapshot, change_description)
VALUES (
  (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados'),
  20,
  '{ ... JSON EDITADO AQUI ... }'::jsonb,
  'Removido OI EAE do título e subtítulo'
);
```

---

## 📊 VERIFICAÇÃO COMPLETA

### Checklist de Teste:

- [ ] Deploy completado no Vercel
- [ ] Versão 19 criada no Supabase
- [ ] Acessou URL pública
- [ ] Viu título "✅ CACHE RESOLVIDO"
- [ ] Criou versão 20 com conteúdo correto
- [ ] Verificou que versão 20 aparece imediatamente

---

## 🎯 RESULTADO ESPERADO

### Antes (COM CACHE):
```
1. Criar versão 18 no Supabase
2. Acessar URL pública
3. ❌ Ainda mostra versão 9
4. ❌ Precisa rebuild/redeploy
```

### Depois (SEM CACHE):
```
1. Criar versão 19 no Supabase
2. Acessar URL pública
3. ✅ Mostra versão 19 IMEDIATAMENTE
4. ✅ Sem rebuild/redeploy
```

---

## 🔧 TROUBLESHOOTING

### Problema: Ainda mostra versão antiga

**Solução 1: Force Refresh**
- Chrome/Edge: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5` (Windows) ou `Cmd + Shift + R` (Mac)

**Solução 2: Limpar Cache do Navegador**
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files

**Solução 3: Testar em Aba Anônima**
- Chrome: `Ctrl + Shift + N` (Windows) ou `Cmd + Shift + N` (Mac)

**Solução 4: Verificar Deploy**
- Confirme que deploy completou no Vercel
- Verifique que commit `92bdbec` foi deployado

---

### Problema: Erro ao criar versão

**Erro: "duplicate key value"**
- Já existe versão 19
- Use version_number 20, 21, etc.

**Erro: "syntax error"**
- Esqueceu `::jsonb` no final do JSON
- Adicione: `'{ ... }'::jsonb`

**Erro: "invalid JSON"**
- JSON mal formatado
- Use um validador: https://jsonlint.com/

---

## 📝 COMANDOS ÚTEIS

### Ver Todas as Versões:
```sql
SELECT version_number, created_at, change_description,
       snapshot->'variables'->'hero'->>'title' as titulo
FROM lp_versions 
WHERE lp_id = (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados')
ORDER BY version_number DESC;
```

### Ver Versão Específica:
```sql
SELECT snapshot 
FROM lp_versions 
WHERE lp_id = (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados')
AND version_number = 18;
```

### Deletar Versão de Teste:
```sql
-- Apenas se quiser remover versão 19 de teste
DELETE FROM lp_versions 
WHERE lp_id = (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados')
AND version_number = 19;
```

---

## ✅ CONFIRMAÇÃO FINAL

Quando tudo funcionar, você deve conseguir:

1. ✅ Editar LP no Supabase (criar nova versão)
2. ✅ Acessar URL pública
3. ✅ Ver mudança IMEDIATAMENTE
4. ✅ Sem precisar rebuild
5. ✅ Sem precisar redeploy
6. ✅ Sem precisar limpar cache

---

## 🎉 SUCESSO!

Se você conseguiu ver a versão 19 com "✅ CACHE RESOLVIDO", significa que:

- ✅ Cache foi desabilitado com sucesso
- ✅ Sistema está funcionando perfeitamente
- ✅ Pode editar LPs livremente no Supabase
- ✅ Mudanças aparecem instantaneamente

**Agora é só criar a versão 20 com o conteúdo correto e pronto! 🚀**

