import { NextResponse } from 'next/server';
import { blogService } from '@/lib/supabase';

/**
 * Gera RSS/Atom feed do blog para facilitar crawling e ingestão por LLMs
 * Endpoint: /feed.xml
 */
export async function GET() {
  try {
    console.log('📡 [RSS] Gerando feed RSS do blog...');
    
    const posts = await blogService.getAllPosts();
    const baseUrl = 'https://www.criadores.app';
    const currentDate = new Date().toISOString();
    
    // Gerar XML do RSS feed
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog crIAdores</title>
    <description>Insights, tendências e estratégias para empresas locais e criadores de conteúdo. Conectamos negócios aos melhores criadores da região.</description>
    <link>${baseUrl}/blog</link>
    <language>pt-BR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>contato@criadores.app (crIAdores)</managingEditor>
    <webMaster>contato@criadores.app (crIAdores)</webMaster>
    <copyright>© ${new Date().getFullYear()} crIAdores. Todos os direitos reservados.</copyright>
    <category>Marketing</category>
    <category>Influenciadores</category>
    <category>Negócios Locais</category>
    <image>
      <url>${baseUrl}/faviconcriadoresA3.png</url>
      <title>Blog crIAdores</title>
      <link>${baseUrl}/blog</link>
      <width>512</width>
      <height>512</height>
    </image>
    
${posts.map(post => {
  const pubDate = post.published_at 
    ? new Date(post.published_at).toUTCString()
    : new Date(post.created_at).toUTCString();
  
  const lastModified = post.updated_at 
    ? new Date(post.updated_at).toUTCString()
    : pubDate;

  // Limpar conteúdo HTML para descrição
  const cleanContent = post.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim()
    .substring(0, 500) + '...';

  return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${cleanContent}]]></content:encoded>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:date>${lastModified}</dc:date>
      <dc:creator>crIAdores</dc:creator>
      <category><![CDATA[${post.audience_target === 'EMPRESAS' ? 'Para Empresas' : post.audience_target === 'CRIADORES' ? 'Para Criadores' : 'Geral'}]]></category>
      ${post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ')}
      ${post.featured_image_url ? `<enclosure url="${post.featured_image_url}" type="image/jpeg"/>` : ''}
      <source url="${baseUrl}/feed.xml">Blog crIAdores</source>
    </item>`;
}).join('\n')}
  </channel>
</rss>`;

    console.log(`✅ [RSS] Feed gerado com ${posts.length} posts`);

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache por 1 hora
      },
    });

  } catch (error) {
    console.error('❌ [RSS] Erro ao gerar feed:', error);
    
    // Feed mínimo em caso de erro
    const errorFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog crIAdores</title>
    <description>Insights, tendências e estratégias para empresas locais e criadores de conteúdo.</description>
    <link>https://www.criadores.app/blog</link>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
  </channel>
</rss>`;

    return new NextResponse(errorFeed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // Cache menor em caso de erro
      },
    });
  }
}
