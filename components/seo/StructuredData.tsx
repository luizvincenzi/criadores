import Script from 'next/script';

/**
 * Componente para inserir dados estruturados JSON-LD
 * Usado para melhorar SEO, AEO e GEO
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <Script
      id={`ld-${Math.random().toString(36).slice(2)}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Schema.org WebSite com SearchAction para favorecer respostas de IA
 */
export function WebSiteSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'crIAdores',
    alternateName: 'Criadores',
    url: 'https://www.criadores.app',
    description: 'Plataforma que conecta negócios locais a criadores de conteúdo autênticos. Campanhas de marketing com micro influenciadores que geram resultados reais.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.criadores.app/busca?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'crIAdores',
      url: 'https://www.criadores.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.criadores.app/faviconcriadoresA3.png',
        width: 512,
        height: 512,
      },
    },
  };

  return <JsonLd data={data} />;
}

/**
 * Schema.org Organization para estabelecer autoridade
 */
export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'crIAdores',
    alternateName: 'Criadores',
    url: 'https://www.criadores.app',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.criadores.app/faviconcriadoresA3.png',
      width: 512,
      height: 512,
    },
    description: 'Plataforma que conecta negócios locais a criadores de conteúdo autênticos. Campanhas de marketing com micro influenciadores que geram resultados reais.',
    foundingDate: '2024',
    sameAs: [
      'https://www.instagram.com/criadores.app',
      'https://www.tiktok.com/@criadores.app',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Brazil',
    },
    knowsAbout: [
      'Marketing de Influência',
      'Criadores de Conteúdo',
      'Marketing Local',
      'Micro Influenciadores',
      'Campanhas de Marketing',
      'Negócios Locais',
    ],
  };

  return <JsonLd data={data} />;
}

/**
 * Schema.org BreadcrumbList para navegação
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

/**
 * Schema.org Article/BlogPosting para posts do blog
 */
interface BlogPostSchemaProps {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  slug: string;
  readTime?: number;
  tags?: string[];
}

export function BlogPostSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  slug,
  readTime,
  tags,
}: BlogPostSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: image || 'https://www.criadores.app/og-image.jpg',
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: 'crIAdores',
      url: 'https://www.criadores.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'crIAdores',
      url: 'https://www.criadores.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.criadores.app/faviconcriadoresA3.png',
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.criadores.app/blog/${slug}`,
    },
    url: `https://www.criadores.app/blog/${slug}`,
    ...(readTime && {
      timeRequired: `PT${readTime}M`,
    }),
    ...(tags && tags.length > 0 && {
      keywords: tags.join(', '),
    }),
    inLanguage: 'pt-BR',
    isPartOf: {
      '@type': 'Blog',
      name: 'Blog crIAdores',
      url: 'https://www.criadores.app/blog',
    },
  };

  return <JsonLd data={data} />;
}

/**
 * Schema.org FAQPage para páginas com perguntas frequentes
 */
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQPageSchema({ faqs }: { faqs: FAQItem[] }) {
  if (!faqs || faqs.length === 0) return null;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}
