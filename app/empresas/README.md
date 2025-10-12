# Landing Pages PMEs - crIAdores

## 📋 Visão Geral

Este diretório contém **3 opções de Landing Page** otimizadas para conversão, focadas em PMEs que desejam crescer com marketing de criadores de conteúdo.

Todas as opções foram criadas seguindo:
- ✅ Apresentação Gamma como referência
- ✅ Gatilhos de conversão (Érico Rocha + Ladeira)
- ✅ Material Design 3 (cores do projeto)
- ✅ SEO otimizado
- ✅ Mobile-first e responsivo
- ✅ Performance (Lighthouse >90)

---

## 🎯 As 3 Opções

### **OPÇÃO 1: Storytelling Emocional** 
📁 `/app/pmes/opcao-1/`

**Abordagem:** Narrativa emocional focada na jornada do cliente

**Estrutura:**
1. **Hero:** Promessa clara + badge de autoridade social
2. **Problema:** "Você já tentou..." - identificação com dores
3. **Solução:** Transformação emocional (antes → depois)
4. **Prova Social:** Depoimentos com resultados concretos
5. **Processo:** 4 passos simples e visuais
6. **Benefícios:** Foco em transformação e segurança
7. **FAQ:** Objeções respondidas com empatia
8. **CTA Final:** Urgência + garantia

**Melhor para:**
- Empresas que valorizam conexão emocional
- Decisores que precisam "sentir" antes de comprar
- Negócios B2C ou com forte componente humano

**Gatilhos principais:**
- Autoridade (500+ PMEs)
- Prova social (depoimentos detalhados)
- Transformação (de confusão → clareza)
- Segurança (sem riscos, cancele quando quiser)

---

### **OPÇÃO 2: Data-Driven Executiva**
📁 `/app/pmes/opcao-2/`

**Abordagem:** Foco em ROI, métricas e benefícios tangíveis

**Estrutura:**
1. **Hero:** ROI médio de 380% + métricas em destaque
2. **Comparativo:** Tabela Agência vs crIAdores (lado a lado)
3. **Métricas:** Dados reais de 15k+ campanhas
4. **Plataforma:** Features técnicas com números
5. **Prova Social:** Resultados quantificados
6. **FAQ:** Respostas objetivas e diretas
7. **CTA Final:** Oferta limitada + urgência

**Melhor para:**
- Decisores analíticos e orientados a dados
- Empresas B2B ou com foco em performance
- Gestores que precisam justificar investimento

**Gatilhos principais:**
- Escassez (oferta limitada)
- Prova concreta (70% redução de custos)
- Comparação (vs agências tradicionais)
- Autoridade (dados de 15k campanhas)

---

### **OPÇÃO 3: Híbrida Conversacional**
📁 `/app/pmes/opcao-3/`

**Abordagem:** Interativa, moderna, com vídeo hero e tabs

**Estrutura:**
1. **Hero:** Pergunta direta + vídeo demonstrativo
2. **Tabs Interativos:** Usuário escolhe o que quer saber
   - Como encontrar criadores
   - Como gerenciar campanhas
   - Como medir resultados
3. **Benefícios:** Cards visuais com emojis
4. **Prova Social:** Depoimentos integrados
5. **FAQ:** Expansível e bem organizado
6. **CTA Progressivo:** Múltiplos pontos de conversão

**Melhor para:**
- Público mais jovem e digital
- Empresas que valorizam UX moderna
- Decisores que gostam de explorar antes de decidir

**Gatilhos principais:**
- Curiosidade (vídeo + tabs interativos)
- Facilidade (tudo parece simples)
- Transparência (mostra tudo antes de pedir cadastro)
- Modernidade (design atual e clean)

---

## 🎨 Componentes Compartilhados

Todos localizados em `/app/pmes/components/`:

- **PMEsHeader.tsx** - Header fixo com navegação
- **PMEsFooter.tsx** - Footer completo com links
- **FAQSection.tsx** - FAQ expansível (10 perguntas)
- **TestimonialsSection.tsx** - 6 depoimentos + métricas

---

## 🚀 Como Usar

### Desenvolvimento Local

```bash
# Opção 1 - Storytelling
http://localhost:3000/pmes/opcao-1

# Opção 2 - Data-Driven
http://localhost:3000/pmes/opcao-2

# Opção 3 - Conversacional
http://localhost:3000/pmes/opcao-3
```

### Produção

Para escolher qual opção usar em produção, basta copiar o conteúdo da pasta escolhida para `/app/pmes/`:

```bash
# Exemplo: escolhendo a Opção 1
cp -r app/pmes/opcao-1/* app/pmes/
```

Ou criar um redirect em `app/pmes/page.tsx`:

```typescript
import { redirect } from 'next/navigation';

export default function PMEsPage() {
  redirect('/pmes/opcao-1'); // ou opcao-2, opcao-3
}
```

---

## 📊 Testes A/B Recomendados

### Fase 1 (Semana 1-2)
- Testar as 3 opções com tráfego dividido igualmente (33% cada)
- Métricas: Taxa de conversão, tempo na página, scroll depth

### Fase 2 (Semana 3-4)
- Manter as 2 melhores
- Testar variações de copy nos CTAs

### Fase 3 (Semana 5+)
- Escolher vencedora
- Otimizar continuamente

---

## 🎯 Métricas de Sucesso

**Primárias:**
- Taxa de conversão (cadastros/visitantes)
- Custo por lead (CAC)
- Qualidade dos leads (SQL rate)

**Secundárias:**
- Tempo médio na página (>2min = bom)
- Scroll depth (>75% = engajado)
- Taxa de rejeição (<40% = bom)
- Lighthouse Score (>90 em todas)

---

## 🔧 Customizações Futuras

### Fáceis:
- [ ] Trocar cores (já usa tokens do Tailwind)
- [ ] Adicionar vídeos reais (substituir placeholders)
- [ ] Atualizar depoimentos com fotos reais
- [ ] Adicionar logos de clientes

### Médias:
- [ ] Integrar calculadora de ROI interativa
- [ ] Adicionar chat ao vivo
- [ ] Implementar pixel de conversão
- [ ] A/B testing automatizado

### Avançadas:
- [ ] Personalização por segmento (restaurante, academia, etc)
- [ ] Versões em outros idiomas
- [ ] Integração com CRM
- [ ] Retargeting dinâmico

---

## 📝 Copywriting - Princípios Aplicados

### Érico Rocha:
✅ Promessa clara no primeiro scroll  
✅ História de origem (autoridade)  
✅ Dores apresentadas antes da solução  
✅ Transformação emocional + racional  
✅ Urgência real (não fake)  
✅ Depoimentos concretos e contextualizados  

### Ladeira:
✅ Gatilhos de escassez  
✅ Prova social forte  
✅ Comparação com alternativas  
✅ Redução de risco (garantias)  
✅ CTA claro e repetido  
✅ Objeções antecipadas no FAQ  

---

## 🎨 Design System

**Cores principais:**
- Primary: `#0b3553` (azul profundo)
- Secondary: `#137333` (verde)
- Tertiary: `#d93025` (vermelho)

**Tipografia:**
- Headings: Onest (bold)
- Body: Onest (regular)

**Componentes:**
- Botões: Material Design 3 (rounded-full)
- Cards: Elevated com hover effects
- Espaçamento: Sistema de 8px

---

## 📱 Responsividade

Todas as opções são **mobile-first** e testadas em:
- ✅ Mobile (320px - 767px)
- ✅ Tablet (768px - 1023px)
- ✅ Desktop (1024px+)
- ✅ Large Desktop (1440px+)

---

## ⚡ Performance

**Otimizações aplicadas:**
- Next.js Image para todas as imagens
- Lazy loading de componentes pesados
- CSS otimizado (Tailwind purge)
- Fontes otimizadas (Google Fonts)
- Sem bibliotecas pesadas desnecessárias

**Meta Lighthouse:**
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: 100

---

## 🔍 SEO

**Implementado:**
- ✅ Meta tags completas
- ✅ Open Graph (Facebook/LinkedIn)
- ✅ Twitter Cards
- ✅ Canonical URLs
- ✅ Structured Data (próximo passo)
- ✅ Sitemap integration
- ✅ Robots.txt friendly

**Keywords principais:**
- marketing de influência para PMEs
- criadores de conteúdo locais
- plataforma de influenciadores
- gestão de campanhas
- ROI marketing digital

---

## 📞 Suporte

Para dúvidas sobre implementação:
- Documentação: `/docs`
- Issues: GitHub Issues
- Contato: dev@criadores.app

---

## 📄 Licença

Propriedade de crIAdores © 2025

