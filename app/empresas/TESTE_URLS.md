# 🧪 GUIA DE TESTES - TODAS AS URLs

## 🚀 Servidor Rodando
**Porta:** 3007  
**URL Base:** http://localhost:3007

---

## 📄 LANDING PAGES (6 no total)

### 1. LP Principal - Combo Completo
**URL:** http://localhost:3007/empresas  
**Chatbot:** http://localhost:3007/chatcriadores-empresas

**O que testar:**
- [ ] Hero carrega corretamente
- [ ] Seção "Por Que Nascemos" aparece
- [ ] Seção "O Poder dos Criadores" com dados
- [ ] **3 Soluções Individuais** aparecem em ordem:
  - [ ] Solução #1: Mentoria (R$ 2.500/mês)
  - [ ] Solução #2: Social Media (R$ 2.800/mês)
  - [ ] Solução #3: Criadores (R$ 2.300/mês)
- [ ] Seção "Combo Completo" aparece DEPOIS das individuais
- [ ] Tabela comparativa Individual vs Combo
- [ ] Economia de R$ 1.700/mês destacada
- [ ] Processo em 5 passos
- [ ] Depoimentos
- [ ] Urgência (3 vagas)
- [ ] FAQ
- [ ] CTA "Falar Com Especialista Agora" redireciona para chatbot
- [ ] **SEM Gabriel D'Ávila**
- [ ] **SEM cores vermelhas**

---

### 2. LP Mentoria
**URL:** http://localhost:3007/empresas/mentoria  
**Chatbot:** http://localhost:3007/chatcriadores-mentoria

**O que testar:**
- [ ] Hero com "De Empresário Sobrecarregado a Estrategista"
- [ ] **Gabriel D'Ávila APARECE** (seção completa)
- [ ] 4 benefícios principais
- [ ] Preço: R$ 2.500/mês ou R$ 1.500/mês (semestral)
- [ ] Processo
- [ ] Depoimentos
- [ ] Urgência (8 vagas)
- [ ] FAQ
- [ ] CTA redireciona para /chatcriadores-mentoria
- [ ] **SEM cores vermelhas**

---

### 3. LP Social Media
**URL:** http://localhost:3007/empresas/social-media  
**Chatbot:** http://localhost:3007/chatcriadores-social-media

**O que testar:**
- [ ] Hero com "Presença Digital Profissional Sem Contratar Uma Equipe"
- [ ] **NÃO tem "Terceirize Seu Marketing"**
- [ ] Comparação de custos (R$ 12.500 vs R$ 2.800)
- [ ] Economia de 77% destacada
- [ ] 6 benefícios principais
- [ ] Preço: R$ 2.800/mês ou R$ 1.800/mês (semestral)
- [ ] **SEM Gabriel D'Ávila**
- [ ] Processo
- [ ] Depoimentos
- [ ] Urgência (5 vagas)
- [ ] FAQ
- [ ] CTA redireciona para /chatcriadores-social-media
- [ ] **SEM cores vermelhas**

---

### 4. LP Criadores Locais
**URL:** http://localhost:3007/empresas/criadores  
**Chatbot:** http://localhost:3007/chatcriadores-criadores

**O que testar:**
- [ ] Hero com "O Segredo dos Negócios Locais Que Estão Lotando"
- [ ] Comparação Tráfego Pago vs Criadores
- [ ] R$ 5.000 → R$ 8.000 vs R$ 2.300 → R$ 25.000
- [ ] 4 benefícios principais
- [ ] Preço: R$ 2.300/mês ou R$ 1.300/mês (semestral)
- [ ] **SEM Gabriel D'Ávila**
- [ ] Processo
- [ ] Depoimentos
- [ ] Urgência (6 vagas)
- [ ] FAQ
- [ ] CTA redireciona para /chatcriadores-criadores
- [ ] **SEM cores vermelhas**

---

### 5. LP Social Media Médicos
**URL:** http://localhost:3007/empresas/social-media-medicos  
**Chatbot:** http://localhost:3007/chatcriadores-medicos

**O que testar:**
- [ ] Hero com "Atraia Mais Pacientes"
- [ ] Badge "100% Compliance CFM"
- [ ] Seção "Por Que Médicos Precisam de Marketing Digital"
- [ ] 77% pesquisam online
- [ ] 6 benefícios (conteúdo educativo, compliance, etc.)
- [ ] Preço: R$ 2.800/mês ou R$ 1.800/mês (semestral)
- [ ] **SEM Gabriel D'Ávila**
- [ ] Processo
- [ ] Urgência (5 vagas)
- [ ] FAQ
- [ ] CTA redireciona para /chatcriadores-medicos
- [ ] **SEM cores vermelhas**

---

### 6. LP Social Media Advogados
**URL:** http://localhost:3007/empresas/social-media-advogados  
**Chatbot:** http://localhost:3007/chatcriadores-advogados

**O que testar:**
- [ ] Hero com "Construa Autoridade e Atraia Clientes Qualificados"
- [ ] Badge "100% Compliance OAB"
- [ ] Seção "Por Que Advogados Precisam de Marketing Digital"
- [ ] 82% pesquisam online
- [ ] 6 benefícios (conteúdo jurídico, compliance, etc.)
- [ ] Preço: R$ 2.800/mês ou R$ 1.800/mês (semestral)
- [ ] **SEM Gabriel D'Ávila**
- [ ] Processo
- [ ] Urgência (5 vagas)
- [ ] FAQ
- [ ] CTA redireciona para /chatcriadores-advogados
- [ ] **SEM cores vermelhas**

---

## 💬 CHATBOTS (6 no total)

### 1. Chatbot Empresas (Combo)
**URL:** http://localhost:3007/chatcriadores-empresas  
**Mensagem:** "Vamos descobrir qual solução é ideal para o seu negócio crescer no digital?"

### 2. Chatbot Mentoria
**URL:** http://localhost:3007/chatcriadores-mentoria  
**Mensagem:** "Vamos conversar sobre a mentoria com Gabriel D'Ávila!"

### 3. Chatbot Social Media
**URL:** http://localhost:3007/chatcriadores-social-media  
**Mensagem:** "Quer ter um estrategista dedicado cuidando do seu marketing digital?"

### 4. Chatbot Criadores
**URL:** http://localhost:3007/chatcriadores-criadores  
**Mensagem:** "Quer conectar seu negócio a criadores locais que vendem de verdade?"

### 5. Chatbot Médicos
**URL:** http://localhost:3007/chatcriadores-medicos  
**Mensagem:** "Olá, Doutor(a)! Quer atrair mais pacientes com marketing digital ético?"

### 6. Chatbot Advogados
**URL:** http://localhost:3007/chatcriadores-advogados  
**Mensagem:** "Olá, Dr(a). Advogado(a)! Quer construir autoridade e atrair clientes qualificados?"

---

## ✅ CHECKLIST GERAL DE VALIDAÇÃO

### Design
- [ ] Todas as cores vermelhas foram removidas
- [ ] Apenas azul (primary) e verde (secondary) aparecem
- [ ] Gradientes estão corretos
- [ ] Cards e botões estão bem estilizados

### Copy
- [ ] "Terceirize Seu Marketing" NÃO aparece em lugar nenhum
- [ ] Copy de Érico Rocha + Ladeira implementada
- [ ] Gatilhos de urgência funcionando
- [ ] Comparações de preço claras

### Gabriel D'Ávila
- [ ] Aparece APENAS na LP de Mentoria
- [ ] NÃO aparece em: Empresas, Social Media, Criadores, Médicos, Advogados

### CTAs
- [ ] Todos os botões dizem "Falar Com Especialista Agora"
- [ ] Todos redirecionam para o chatbot correto
- [ ] Nenhum abre modal de formulário

### Estrutura da LP Principal
- [ ] Hero
- [ ] Por Que Nascemos
- [ ] O Poder dos Criadores
- [ ] **Solução #1: Mentoria** (individual)
- [ ] **Solução #2: Social Media** (individual)
- [ ] **Solução #3: Criadores** (individual)
- [ ] **Combo Completo** (oferta irresistível)
- [ ] Tabela Comparativa
- [ ] Processo
- [ ] Depoimentos
- [ ] Urgência
- [ ] FAQ
- [ ] CTA Final

### Responsividade
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

### Performance
- [ ] Todas as páginas carregam rápido
- [ ] Sem erros no console
- [ ] Imagens otimizadas (placeholders OK)

---

## 🐛 BUGS CONHECIDOS (Para Corrigir Depois)

### Assets Faltando
- [ ] Vídeo hero (90s) - placeholder OK
- [ ] Foto Gabriel D'Ávila - placeholder OK
- [ ] Fotos depoimentos - placeholder OK
- [ ] OG images - placeholder OK
- [ ] Infográficos - placeholder OK

### Integrações Pendentes
- [ ] Supabase API (/api/lead)
- [ ] Google Analytics 4
- [ ] Meta Pixel
- [ ] Hotjar

---

## 📊 MÉTRICAS PARA MONITORAR

Após o deploy, monitorar:

1. **Taxa de Conversão por LP:**
   - Empresas (Combo): meta 5-8%
   - Mentoria: meta 3-5%
   - Social Media: meta 4-6%
   - Criadores: meta 4-6%
   - Médicos: meta 6-9%
   - Advogados: meta 6-9%

2. **Tempo na Página:**
   - Meta: > 2 minutos

3. **Taxa de Rejeição:**
   - Meta: < 40%

4. **Cliques no CTA:**
   - Meta: > 15% dos visitantes

5. **Conversão Chatbot → Lead:**
   - Meta: > 60%

---

## 🚀 PRÓXIMOS PASSOS

### Imediato (Hoje)
1. ✅ Testar todas as 6 LPs
2. ✅ Validar todos os 6 chatbots
3. ✅ Verificar responsividade
4. ✅ Revisar copy

### Semana 1
1. [ ] Produzir vídeo hero (90s)
2. [ ] Fotografar Gabriel D'Ávila
3. [ ] Coletar fotos de depoimentos
4. [ ] Criar OG images
5. [ ] Configurar Supabase API

### Semana 2
1. [ ] Configurar GA4 + Meta Pixel
2. [ ] Deploy em produção
3. [ ] Configurar redirecionamentos 301:
   - /pmes → /empresas
   - /pmes/mentoria → /empresas/mentoria
   - /pmes/social-media → /empresas/social-media
   - /pmes/criadores → /empresas/criadores
4. [ ] Testar em produção

### Semana 3
1. [ ] Criar campanhas de tráfego
2. [ ] Configurar Hotjar
3. [ ] Monitorar conversões
4. [ ] Otimizar baseado em dados

---

## 📞 SUPORTE

**Dúvidas?** Consulte:
- `ENTREGA_AJUSTES_FINAL.md` - Resumo completo
- `README.md` - Documentação técnica
- `ANALISE_ESTRATEGICA.md` - Análise e projeções

---

**Status:** ✅ Pronto para testar  
**Data:** 2025-10-12  
**Servidor:** http://localhost:3007

🚀 **Bons testes!**

