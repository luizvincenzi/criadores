-- Script para inserir posts de exemplo no blog
-- Execute este script no Supabase SQL Editor para garantir que sempre haja posts para navegação

-- Inserir posts de exemplo se não existirem
INSERT INTO posts (
  organization_id,
  category_id,
  author_id,
  title,
  slug,
  excerpt,
  content,
  featured_image_url,
  tags,
  audience_target,
  status,
  is_featured,
  published_at,
  meta_title,
  meta_description,
  read_time_minutes,
  view_count
) VALUES 
-- Post 1: Para Empresas
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Como aumentar vendas com marketing local em 2025',
  'marketing-local-vendas-2025',
  'Estratégias comprovadas para empresas locais aumentarem suas vendas através de parcerias com criadores de conteúdo da região.',
  'O marketing local está revolucionando a forma como pequenas e médias empresas se conectam com seus clientes. Em 2025, a tendência é clara: proximidade gera confiança, e confiança gera vendas.

Por que o marketing local funciona?

Credibilidade imediata → Criadores locais já têm a confiança da comunidade
Custo-benefício superior → Investimento menor, retorno maior
Engajamento autêntico → Conexão real com o público-alvo
Resultados mensuráveis → Métricas claras de conversão

Como implementar na sua empresa?

Identifique criadores da sua região que se alinham com seus valores
Desenvolva parcerias de longo prazo, não apenas campanhas pontuais
Invista em conteúdo autêntico que agregue valor ao público
Monitore resultados e ajuste estratégias conforme necessário

O futuro é local, e as empresas que entenderem isso primeiro sairão na frente.',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
  ARRAY['marketing', 'vendas', 'local', 'estrategia'],
  'EMPRESAS',
  'PUBLICADO',
  true,
  NOW() - INTERVAL '2 days',
  'Marketing Local: Como Aumentar Vendas em 2025',
  'Descubra estratégias comprovadas de marketing local para aumentar as vendas da sua empresa através de parcerias com criadores de conteúdo.',
  4,
  127
),

-- Post 2: Para Criadores
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Monetize seu conteúdo: Guia completo para criadores locais',
  'monetizar-conteudo-criadores-locais',
  'Transforme sua paixão por criar conteúdo em uma fonte de renda sustentável através de parcerias com empresas locais.',
  'Ser criador de conteúdo vai muito além de postar fotos bonitas. É sobre construir uma comunidade, gerar valor e, sim, também ganhar dinheiro fazendo o que você ama.

O poder do criador local

Autenticidade → Você conhece sua cidade e seu público
Proximidade → Relacionamento real com seguidores
Credibilidade → Recomendações genuínas têm mais peso
Oportunidades → Empresas locais precisam de você

Como monetizar seu conteúdo

Parcerias com empresas locais → Campanhas remuneradas regulares
Conteúdo patrocinado autêntico → Produtos que você realmente usa
Eventos e ativações → Presença em lançamentos e inaugurações
Consultoria em redes sociais → Ensine o que você sabe

Dicas para o sucesso

Mantenha sua autenticidade sempre
Seja seletivo com as parcerias
Entregue resultados mensuráveis
Construa relacionamentos duradouros

Lembre-se: você não está apenas vendendo posts, está vendendo influência e conexão real com sua comunidade.',
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
  ARRAY['monetizacao', 'criadores', 'renda', 'parcerias'],
  'CRIADORES',
  'PUBLICADO',
  false,
  NOW() - INTERVAL '5 days',
  'Monetização para Criadores: Guia Completo 2025',
  'Aprenda como transformar sua paixão por criar conteúdo em renda através de parcerias estratégicas com empresas locais.',
  6,
  89
),

-- Post 3: Para Ambos
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'O futuro das parcerias entre empresas e criadores',
  'futuro-parcerias-empresas-criadores',
  'Como a colaboração entre empresas locais e criadores de conteúdo está moldando o futuro do marketing digital.',
  'Estamos vivendo uma revolução silenciosa no marketing. A era dos anúncios invasivos está chegando ao fim, dando lugar a algo muito mais poderoso: parcerias autênticas entre empresas e criadores.

A nova era do marketing

Autenticidade sobre quantidade → Menos é mais quando é real
Relacionamentos sobre transações → Parcerias duradouras geram mais valor
Comunidade sobre audiência → Engajamento real supera números
Valor sobre venda → Conteúdo útil constrói confiança

Por que essa mudança está acontecendo?

Consumidores mais exigentes → Público quer transparência e autenticidade
Algoritmos favorecendo engajamento → Plataformas premiam conteúdo genuíno
ROI comprovado → Parcerias autênticas geram melhores resultados
Sustentabilidade → Relacionamentos duradouros são mais rentáveis

O que esperar do futuro

Contratos de longo prazo → Menos campanhas pontuais, mais parcerias
Métricas mais sofisticadas → Além de likes e views
Integração omnichannel → Criadores em todos os pontos de contato
Especialização regional → Foco em mercados locais específicos

Para empresas: invistam em relacionamentos, não apenas em campanhas.
Para criadores: desenvolvam expertise, não apenas seguidores.

O futuro pertence a quem entender que marketing é sobre pessoas, não sobre produtos.',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  ARRAY['futuro', 'parcerias', 'marketing', 'tendencias'],
  'AMBOS',
  'PUBLICADO',
  true,
  NOW() - INTERVAL '1 day',
  'O Futuro das Parcerias no Marketing Digital',
  'Descubra como a colaboração entre empresas e criadores está revolucionando o marketing e moldando o futuro das comunicações.',
  5,
  203
)

-- Apenas inserir se não existirem posts com esses slugs
ON CONFLICT (slug) DO NOTHING;
