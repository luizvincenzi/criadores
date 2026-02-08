# Agente de SEO / AEO / GEO - crIAdores

Agente especializado em Search Engine Optimization (SEO), Answer Engine Optimization (AEO) e Generative Engine Optimization (GEO) para o site criadores.app.

## Visao Geral do Site

```
criadores.app
├── / (Home) - Landing page principal para empresas
├── /sou-criador - Landing para criadores de conteudo
├── /empresas/* - Landing pages dinamicas por segmento
│   ├── /social-media
│   ├── /social-media-advogados
│   ├── /social-media-medicos
│   ├── /mentoria
│   └── /criadores
├── /blog - Indice de posts (CSR - PROBLEMA)
├── /blog/[slug] - Posts individuais (SSR + ISR - BOM)
├── /perguntas-frequentes - FAQ com schema
├── /chatcriadores-home - Chatbot pre-qualificacao leads
├── /chatcriadores-novo - Chatbot com steps customizados
├── /chatcriadores-{segmento} - Variantes por nicho
├── /linkcriadores - Linktree social bio
├── /raioxdaminhaempresa - Lead magnet diagnostico
└── /relatorio360 - Em desenvolvimento
```

---

## Estado Atual do SEO (Auditoria)

### O que esta BOM

| Componente | Status | Detalhes |
|-----------|--------|---------|
| Metadata global (layout.tsx) | OK | Title template, description, keywords, robots |
| Sitemap.xml | OK | Dinamico com 9 rotas estaticas + blog posts |
| Robots.txt | OK | Regras granulares por search engine |
| RSS Feed | OK | RSS 2.0 completo com Atom, Dublin Core |
| JSON-LD schemas | OK | Organization, WebSite, BlogPosting, FAQ, Breadcrumb |
| Canonical URLs | OK | Global + per-page, domain normalizado com www |
| Blog posts (detail) | OK | SSR + ISR, metadata dinamica, schema Article |
| FAQ page | OK | FAQPage schema + BreadcrumbSchema |
| Empresas pages | OK | Metadata dinamica do banco, OG configurado |
| Redirects | OK | www enforcement, HTTPS, trailing slash removal |

### O que PRECISA MELHORAR

| Problema | Severidade | Impacto |
|----------|-----------|---------|
| OG Image (`/og-image.jpg`) nao existe | CRITICO | Social sharing sem preview em todas as paginas |
| Blog index e CSR-only | CRITICO | Google pode nao indexar lista de posts |
| Home page sem metadata (use client) | ALTO | Herda metadata generica do layout |
| 6/8 chatbot pages sem metadata propria | ALTO | Sem title/description unicos |
| Nenhum schema na Home page | ALTO | Sem rich snippets para busca principal |
| Nenhum schema Review/Testimonial | ALTO | Depoimentos nao aparecem no Google |
| Sou Criador sem schema | MEDIO | Perde oportunidade de rich results |
| Blog sem AEO optimization | MEDIO | Conteudo nao otimizado para AI answers |
| Nenhuma pagina com LocalBusiness schema | MEDIO | Perde visibilidade em buscas locais |
| Links internos fracos entre paginas | MEDIO | Autoridade nao distribui bem |
| Alt text generico nas imagens | BAIXO | Perde relevancia de imagem search |

---

## Palavras-Chave Estrategicas

### Cluster Principal: Marketing Local
```
Head terms:
- marketing para negocios locais
- social media para empresas
- marketing digital para pequenas empresas
- micro influenciadores

Long tail:
- como divulgar empresa local no instagram
- quanto custa micro influenciador
- social media para restaurantes
- marketing digital para clinicas medicas
- marketing juridico para advogados
- criador de conteudo para empresas locais
- agencia de marketing presencial
```

### Cluster Criadores
```
Head terms:
- criador de conteudo local
- influenciador digital
- monetizar instagram

Long tail:
- como comecar como criador de conteudo
- como ganhar dinheiro como influenciador local
- parcerias com empresas locais para criadores
- comunidade de criadores de conteudo
```

### Cluster Servicos
```
- social media presencial
- estrategista de marketing digital
- gestao de redes sociais para empresas
- conteudo profissional para instagram
- producao de reels para empresas
```

---

## Plano de Implementacao (Priorizado)

### FASE 1 - Criticos (Semana 1)

#### 1.1 Criar OG Image
```
Arquivo: /public/og-image.jpg
Dimensoes: 1200x630px
Conteudo: Logo crIAdores + tagline + cores da marca
```

#### 1.2 Converter Blog Index para SSR
```
Arquivo: /app/blog/page.tsx
Problema: 'use client' + useEffect para carregar posts
Solucao: Converter para Server Component com metadata
```

#### 1.3 Adicionar Metadata na Home Page
```
Arquivo: /app/page.tsx ou /app/(site)/page.tsx
Problema: 'use client' impede export const metadata
Solucao: Criar layout.tsx com metadata ou separar client/server
```

#### 1.4 Metadata para Chatbot Pages
```
Arquivos: /app/chatcriadores-*/layout.tsx
6 paginas sem metadata propria:
- chatcriadores-home: ja tem (basico)
- chatcriadores-novo: ja tem (completo)
- chatcriadores-empresas: FALTA
- chatcriadores-criadores: FALTA
- chatcriadores-medicos: FALTA
- chatcriadores-advogados: FALTA
- chatcriadores-social-media: FALTA
- chatcriadores-mentoria: FALTA
```

### FASE 2 - Schemas e Dados Estruturados (Semana 2)

#### 2.1 Schema na Home Page
```typescript
// Adicionar ao Home:
<OrganizationSchema />
<WebSiteSchema />
<FAQPageSchema faqs={homeFaqs} />

// Novo: Review/AggregateRating schema para depoimentos
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "crIAdores",
  "description": "...",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "150"
  }
}
</script>
```

#### 2.2 Schema Service para cada servico
```
/empresas/social-media -> Service schema
/empresas/mentoria -> Service schema
/raioxdaminhaempresa -> Product schema (lead magnet)
```

#### 2.3 Breadcrumbs em todas as paginas
```
Home > Sou Criador
Home > Empresas > Social Media
Home > Blog > [Post Title]
Home > Perguntas Frequentes
```

### FASE 3 - AEO (Answer Engine Optimization) (Semana 3)

#### 3.1 Otimizar Blog para Featured Snippets
```
Cada post deve ter:
- Pergunta como H2
- Resposta direta nos primeiros 2 paragrafos
- Lista ou tabela com dados concretos
- FAQ section no final do post
```

#### 3.2 Criar Paginas de Perguntas Especificas
```
/blog/quanto-custa-social-media-para-empresas
/blog/como-funciona-marketing-com-influenciadores
/blog/como-escolher-criador-de-conteudo-para-minha-empresa
```

#### 3.3 Expandir FAQ por Segmento
```
/perguntas-frequentes (geral - ja existe)
/perguntas-frequentes/empresas (novo)
/perguntas-frequentes/criadores (novo)
/perguntas-frequentes/advogados (novo)
/perguntas-frequentes/medicos (novo)
```

### FASE 4 - GEO (Generative Engine Optimization) (Semana 4)

#### 4.1 Entity Consistency
```
Garantir que em TODAS as paginas:
- Nome da marca: "crIAdores" (consistente)
- Descricao: "Plataforma que conecta empresas locais a criadores de conteudo"
- Fundacao: 2024
- Localidade: Londrina, Parana, Brasil
- Servicos: Marketing presencial, Social Media, Micro-influenciadores
```

#### 4.2 Citations e Authority Signals
```
- Adicionar dados quantitativos: "40% de aumento em vendas"
- Mencionar numero de clientes atendidos
- Case studies com resultados metrificados
- Depoimentos com nome completo e empresa
```

#### 4.3 Multi-Format Content
```
- Transcrever videos de depoimentos
- Criar infograficos dos processos
- Publicar estudos de caso escritos
- FAQ em formato de conversa natural
```

---

## Mapa de Arquivos SEO

```
/app/layout.tsx                          # Metadata global (title template, OG, robots)
/app/sitemap.ts                          # Sitemap XML dinamico
/app/robots.ts                           # Robots.txt com regras por engine
/app/feed.xml/route.ts                   # RSS Feed
/components/seo/JsonLd.tsx               # Schemas: Organization, WebSite, BlogPost, FAQ, Breadcrumb
/public/og-image.jpg                     # OG Image (FALTA CRIAR)
/public/manifest.json                    # PWA manifest
/public/faviconcriadoresA3.png           # Favicon principal
/next.config.ts                          # Redirects, headers, CSP
/middleware.ts                           # Rate limiting, HTTPS, security headers
```

---

## Checklist de Auditoria (Rodar Periodicamente)

### Per-Page Checklist
- [ ] Title tag unico (50-60 chars)
- [ ] Meta description unica (150-160 chars)
- [ ] H1 unico e com keyword principal
- [ ] Hierarquia H2/H3 logica
- [ ] Canonical URL definida
- [ ] OG tags (title, description, image)
- [ ] Twitter card configurado
- [ ] Schema JSON-LD apropriado
- [ ] Alt text em todas as imagens
- [ ] Links internos relevantes
- [ ] CTA claro e contextualizado

### Technical Checklist
- [ ] OG image existe e carrega (1200x630)
- [ ] Sitemap inclui todas as paginas publicas
- [ ] Robots.txt nao bloqueia paginas importantes
- [ ] HTTPS enforced
- [ ] Canonical www. enforced
- [ ] Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- [ ] Paginas publicas sao SSR (nao CSR-only)
- [ ] RSS feed valido e atualizado

### Content Checklist (AEO/GEO)
- [ ] Cada post responde uma pergunta especifica
- [ ] Dados quantitativos incluidos
- [ ] FAQ section com schema
- [ ] Entidade "crIAdores" consistente
- [ ] Case studies com resultados
- [ ] Links para fontes autoritativas

---

## Analytics e Metricas

### Google Search Console
```
Acompanhar:
- Impressoes e cliques por pagina
- CTR medio
- Posicao media por keyword
- Paginas indexadas vs nao indexadas
- Core Web Vitals report
- Rich results report (FAQ, Article)
```

### GA4 Events para SEO
```javascript
// Eventos a implementar:
gtag('event', 'cta_click', { cta_location: 'hero', cta_text: 'Fale Conosco' });
gtag('event', 'chat_start', { chat_variant: 'home' });
gtag('event', 'chat_complete', { user_type: 'empresa', segment: 'alimentacao' });
gtag('event', 'blog_read', { post_slug: slug, read_time: seconds });
gtag('event', 'faq_open', { question: questionText });
```

---

## Chatbot Pages - Analise de Conversao

### Fluxo Atual (chatcriadores-home)
```
1. Nome (input) -> 2. Tipo usuario (empresa/criador)
   ├── Empresa: 3. Nome empresa -> 4. Segmento -> 5. Objetivo -> 6. Experiencia
   └── Criador: 3. Nicho -> 4. Seguidores -> 5. Experiencia
-> 6/7. Email -> 7/8. WhatsApp -> 8/9. Instagram -> Resumo + Protocolo
```

### Pontos de Melhoria
```
1. FALTA analytics de progresso (qual step abandona mais?)
2. FALTA pixel de conversao no step final
3. CTA buttons usam gray neutro (sem destaque visual)
4. Progress bar de 1px (quase invisivel)
5. WhatsApp como unico canal de conversao (limita)
6. Sem email automatico de follow-up
7. Sem urgencia ou prova social durante o chat
```

### SEO para Chatbot Pages
```
Cada variante (/chatcriadores-medicos, etc) deveria ter:
- Title otimizado: "Marketing Digital para Medicos | crIAdores"
- Description: "Atraia mais pacientes com marketing etico..."
- Schema: Service + FAQ
- Canonical propria
- H1 visivel acima do chat
```

---

## Comandos Uteis

### Verificar SEO rapidamente
```bash
# Checar metadata de uma pagina
curl -s https://www.criadores.app/ | grep -E '<title>|<meta name="description"|og:|twitter:'

# Validar sitemap
curl -s https://www.criadores.app/sitemap.xml | head -50

# Validar robots.txt
curl -s https://www.criadores.app/robots.txt

# Testar OG image
curl -sI https://www.criadores.app/og-image.jpg | head -5
```

### Ferramentas externas
```
- Google Search Console: search.google.com/search-console
- Google Rich Results Test: search.google.com/test/rich-results
- Schema Validator: validator.schema.org
- PageSpeed Insights: pagespeed.web.dev
- Lighthouse: DevTools > Lighthouse tab
```

---

## Regras para este Agente

1. NUNCA usar emojis em meta descriptions ou titles
2. SEMPRE usar slate-* ao inves de gray-* (design system)
3. NUNCA usar purple/pink (regra do frontend)
4. Metadata DEVE estar em Server Components (nao 'use client')
5. Canonical SEMPRE com www: https://www.criadores.app/...
6. OG images SEMPRE 1200x630px
7. Schemas SEMPRE validados com JSON-LD
8. Blog posts DEVEM usar SSR com ISR (revalidate)
9. FAQ SEMPRE com FAQPageSchema
10. Cada pagina publica DEVE ter H1 unico
