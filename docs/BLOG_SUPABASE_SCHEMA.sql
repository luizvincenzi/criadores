-- Schema SQL para Blog crIAdores no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de categorias do blog
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(50) NOT NULL DEFAULT 'bg-gray-100 text-gray-800',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de posts do blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content JSONB NOT NULL, -- Estrutura: {context, data, application, conclusion}
  category VARCHAR(100) NOT NULL,
  category_color VARCHAR(50) NOT NULL DEFAULT 'bg-gray-100 text-gray-800',
  date VARCHAR(20) NOT NULL, -- Formato: "15 Jan 2025"
  read_time VARCHAR(10) NOT NULL, -- Formato: "3 min"
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  author_id UUID,
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags TEXT[], -- Array de tags
  cta_text TEXT,
  cta_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- 4. Inserir categorias padrão
INSERT INTO blog_categories (name, slug, color, description) VALUES
('Para Empresas', 'empresas', 'bg-blue-100 text-blue-800', 'Estratégias e dicas para empresas locais'),
('Para Criadores', 'criadores', 'bg-purple-100 text-purple-800', 'Conteúdo para criadores e influenciadores'),
('Tendências', 'tendencias', 'bg-green-100 text-green-800', 'Novidades e tendências do mercado'),
('Ferramentas', 'ferramentas', 'bg-gray-100 text-gray-800', 'Reviews e tutoriais de ferramentas'),
('Cases de Sucesso', 'cases', 'bg-yellow-100 text-yellow-800', 'Histórias reais de sucesso')
ON CONFLICT (slug) DO NOTHING;

-- 5. Inserir posts de exemplo
INSERT INTO blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  category, 
  category_color, 
  date, 
  read_time, 
  featured, 
  published,
  meta_title,
  meta_description,
  tags,
  cta_text,
  cta_link
) VALUES 
(
  'Padaria de BH dobra vendas com WhatsApp Business em 90 dias',
  'padaria-bh-whatsapp-business',
  'Automatização simples de pedidos e delivery transformou negócio familiar em referência do bairro. Estratégia pode ser replicada por qualquer PME com investimento zero.',
  '{
    "context": "<p>A Padaria São José, no bairro Savassi em Belo Horizonte, enfrentava o mesmo problema de milhares de PMEs brasileiras: dificuldade para organizar pedidos por telefone, perda de clientes por demora no atendimento e falta de controle sobre delivery.</p><p>Com 25 anos de tradição familiar, o negócio precisava se modernizar sem perder a proximidade com os clientes. A solução veio através do WhatsApp Business, ferramenta gratuita que revolucionou a operação em apenas três meses.</p>",
    "data": "<p>Os resultados da Padaria São José impressionam:</p><ul><li><strong>Vendas:</strong> Aumento de 120% no faturamento</li><li><strong>Pedidos:</strong> De 50 para 180 pedidos diários</li><li><strong>Tempo de atendimento:</strong> Redução de 8 para 2 minutos</li><li><strong>Satisfação:</strong> 95% de avaliações positivas no delivery</li></ul><p>Segundo pesquisa da Sebrae 2024, 78% das PMEs que implementaram WhatsApp Business relataram crescimento nas vendas. No setor alimentício, o impacto é ainda maior: empresas registram aumento médio de 85% no faturamento.</p>",
    "application": "<h3>Passo 1: Configure o perfil comercial</h3><ul><li>Baixe WhatsApp Business (gratuito)</li><li>Complete informações: endereço, horário, descrição</li><li>Adicione foto profissional da empresa</li></ul><h3>Passo 2: Crie catálogo digital</h3><ul><li>Fotografe produtos com boa iluminação</li><li>Organize por categorias (pães, doces, salgados)</li><li>Inclua preços e descrições claras</li></ul>",
    "conclusion": "<p>A transformação digital não precisa ser complexa ou cara. O caso da Padaria São José mostra que ferramentas simples, quando bem implementadas, podem revolucionar um negócio local.</p>"
  }',
  'Para Empresas',
  'bg-blue-100 text-blue-800',
  '15 Jan 2025',
  '3 min',
  true,
  true,
  'Padaria dobra vendas com WhatsApp Business - Case de Sucesso',
  'Como uma padaria de BH aumentou vendas em 120% usando WhatsApp Business. Estratégia replicável para qualquer PME.',
  ARRAY['whatsapp business', 'pme', 'vendas', 'delivery', 'automação'],
  'Quer implementar WhatsApp Business na sua empresa? Nossa equipe oferece consultoria gratuita de 30 minutos para PMEs.',
  '/criavoz-homepage'
),
(
  'IA aumenta vendas de PMEs em 40% no interior paulista',
  'ia-aumenta-vendas-pmes-interior',
  'Chatbots simples e automação de redes sociais transformam pequenos negócios em Ribeirão Preto. Tecnologia acessível democratiza marketing digital.',
  '{
    "context": "<p>No interior de São Paulo, pequenas empresas estão descobrindo que inteligência artificial não é privilégio de grandes corporações. Em Ribeirão Preto, PMEs implementaram soluções simples de IA e registraram crescimento médio de 40% nas vendas.</p>",
    "data": "<p>Resultados das PMEs de Ribeirão Preto com IA:</p><ul><li><strong>Vendas online:</strong> Crescimento de 40% em 6 meses</li><li><strong>Atendimento:</strong> 24h automatizado com 85% de satisfação</li><li><strong>Custos:</strong> Redução de 30% em marketing digital</li></ul>",
    "application": "<h3>Ferramentas de IA para PMEs (gratuitas/baratas):</h3><ul><li><strong>ChatGPT:</strong> Criação de conteúdo e atendimento</li><li><strong>Canva Magic:</strong> Design automatizado</li><li><strong>Google Analytics Intelligence:</strong> Insights automáticos</li></ul>",
    "conclusion": "<p>A revolução da IA chegou ao interior brasileiro. PMEs que se adaptarem agora terão vantagem competitiva decisiva nos próximos anos.</p>"
  }',
  'Para Empresas',
  'bg-blue-100 text-blue-800',
  '12 Jan 2025',
  '4 min',
  false,
  true,
  'IA para PMEs: Como aumentar vendas em 40% no interior',
  'Descubra como pequenas empresas do interior paulista usam IA para crescer 40% nas vendas com ferramentas acessíveis.',
  ARRAY['inteligencia artificial', 'pme', 'interior', 'automação', 'vendas'],
  'Quer implementar IA na sua PME? Consultoria gratuita para empresas do interior.',
  '/criavoz-homepage'
),
(
  'Criadora de TikTok fatura R$ 15k/mês com UGC para empresas locais',
  'criador-tiktok-monetiza-ugc',
  'Estudante de Curitiba transforma hobby em profissão criando conteúdo autêntico para PMEs. Estratégia simples pode ser replicada por qualquer criador.',
  '{
    "context": "<p>Júlia Santos, 22 anos, estudante de Marketing em Curitiba, transformou sua paixão por criar conteúdo em uma fonte de renda consistente. Especializada em UGC (User Generated Content) para empresas locais, ela fatura R$ 15 mil mensais trabalhando apenas 20 horas por semana.</p>",
    "data": "<p>Números da Júlia em 8 meses:</p><ul><li><strong>Faturamento:</strong> R$ 15.000/mês</li><li><strong>Clientes ativos:</strong> 12 empresas locais</li><li><strong>Conteúdos/mês:</strong> 60 vídeos</li><li><strong>Taxa de retenção:</strong> 95% dos clientes</li></ul>",
    "application": "<h3>Como começar no UGC local:</h3><ol><li><strong>Defina seu nicho:</strong> Restaurantes, moda, beleza, fitness</li><li><strong>Crie portfólio:</strong> 5-10 vídeos demonstrando seu estilo</li><li><strong>Precifique serviços:</strong> R$ 200-500 por vídeo inicial</li></ol>",
    "conclusion": "<p>UGC é a ponte perfeita entre criadores e empresas locais. Com autenticidade e consistência, qualquer criador pode construir uma carreira sustentável neste mercado em expansão.</p>"
  }',
  'Para Criadores',
  'bg-purple-100 text-purple-800',
  '10 Jan 2025',
  '5 min',
  false,
  true,
  'Como faturar R$ 15k/mês com UGC para empresas locais',
  'Case real: estudante de Curitiba fatura R$ 15k mensais criando UGC para PMEs. Estratégia replicável para qualquer criador.',
  ARRAY['ugc', 'tiktok', 'monetização', 'criadores', 'empresas locais'],
  'Quer conectar-se com empresas locais? Nossa plataforma facilita essas parcerias.',
  '/criavoz-homepage'
)
ON CONFLICT (slug) DO NOTHING;

-- 6. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Criar trigger para atualizar updated_at
CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Configurar RLS (Row Level Security) se necessário
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas de acesso público para leitura
-- CREATE POLICY "Posts públicos são visíveis para todos" ON blog_posts
--   FOR SELECT USING (published = true);

-- CREATE POLICY "Categorias são visíveis para todos" ON blog_categories
--   FOR SELECT USING (true);

-- Comentários sobre o schema:
-- 1. O campo 'content' é JSONB para flexibilidade na estrutura do conteúdo
-- 2. Tags são armazenadas como array para facilitar buscas
-- 3. Índices otimizam consultas frequentes
-- 4. Trigger atualiza automaticamente o campo updated_at
-- 5. RLS pode ser habilitado para controle de acesso mais granular
