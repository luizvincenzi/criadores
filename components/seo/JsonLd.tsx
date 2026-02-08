

/**
 * Componente para inserir dados estruturados JSON-LD
 * Usado para melhorar SEO, AEO e GEO
 */
interface JsonLdProps {
  data: object;
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  const scriptId = id || `ld-${Math.random().toString(36).slice(2)}`;

  return (
    <script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
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
      'https://www.linkedin.com/company/criadores-app',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
      email: 'contato@criadores.app',
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
      'Marketing Digital',
      'Redes Sociais',
    ],
  };

  return <JsonLd data={data} id="organization-schema" />;
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

  return <JsonLd data={data} id="website-schema" />;
}

/**
 * Schema.org BreadcrumbList para navegação
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (!items || items.length === 0) return null;

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

  return <JsonLd data={data} id="breadcrumb-schema" />;
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
  author?: string;
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
  author = 'crIAdores',
}: BlogPostSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: image || 'https://www.criadores.app/opengraph-image',
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author,
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

  return <JsonLd data={data} id="blogpost-schema" />;
}

/**
 * Schema.org FAQPage para páginas com perguntas frequentes
 */
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageSchemaProps {
  faqs: FAQItem[];
}

export function FAQPageSchema({ faqs }: FAQPageSchemaProps) {
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

  return <JsonLd data={data} id="faq-schema" />;
}

/**
 * Schema.org Service para páginas de serviço
 * Usado nas landing pages de cada vertical (social media, mentoria, criadores, etc.)
 */
interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  category?: string;
  areaServed?: string;
  priceRange?: string;
}

export function ServiceSchema({
  name,
  description,
  url,
  category = 'Marketing Digital',
  areaServed = 'Brazil',
  priceRange,
}: ServiceSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    serviceType: category,
    provider: {
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
    areaServed: {
      '@type': 'Country',
      name: areaServed,
    },
    ...(priceRange && { priceRange }),
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: url,
      serviceType: 'Online',
    },
  };

  return <JsonLd data={data} id={`service-schema-${name.toLowerCase().replace(/\s+/g, '-')}`} />;
}

/**
 * Schema.org ProfessionalService para verticais específicas
 * (médicos, advogados, etc.)
 */
interface ProfessionalServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  audience: string;
}

export function ProfessionalServiceSchema({
  name,
  description,
  url,
  serviceType,
  audience,
}: ProfessionalServiceSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name,
    description,
    url,
    serviceType,
    provider: {
      '@type': 'Organization',
      name: 'crIAdores',
      url: 'https://www.criadores.app',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Brazil',
    },
    audience: {
      '@type': 'Audience',
      audienceType: audience,
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: url,
      serviceType: 'Online',
    },
  };

  return <JsonLd data={data} id={`professional-service-schema-${serviceType.toLowerCase().replace(/\s+/g, '-')}`} />;
}

/**
 * Schema.org CollectionPage para páginas de listagem (blog index, etc.)
 */
interface CollectionPageSchemaProps {
  name: string;
  description: string;
  url: string;
  itemCount?: number;
}

export function CollectionPageSchema({
  name,
  description,
  url,
  itemCount,
}: CollectionPageSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'crIAdores',
      url: 'https://www.criadores.app',
    },
    ...(itemCount !== undefined && {
      numberOfItems: itemCount,
    }),
    inLanguage: 'pt-BR',
  };

  return <JsonLd data={data} id="collection-page-schema" />;
}
