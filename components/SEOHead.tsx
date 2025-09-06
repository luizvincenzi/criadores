import Head from 'next/head'

interface SEOHeadProps {
  page?: string
  title?: string
  description?: string
  image?: string
  url?: string
}

const SEOHead = ({ 
  page = 'home',
  title,
  description,
  image = '/faviconcriadoresA3.png',
  url
}: SEOHeadProps) => {
  const defaultTitle = 'crIAdores - Conectando Negócios Locais a Criadores de Conteúdo'
  const defaultDescription = 'Plataforma que conecta negócios locais a criadores de conteúdo autênticos. Campanhas de marketing com micro influenciadores que geram resultados reais.'

  const pageTitle = title || (page === 'links' ? 'crIAdores - Links' : defaultTitle)
  const pageDescription = description || (page === 'links' ? 'Conecte seu negócio aos melhores criadores de conteúdo da sua região. Campanhas de marketing que geram resultados reais!' : defaultDescription)
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://criadores.app')

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      
      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="crIAdores" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Favicon */}
      <link rel="icon" href="/faviconcriadoresA3.png" />
      <link rel="apple-touch-icon" href="/faviconcriadoresA3.png" />
      
      {/* Theme */}
      <meta name="theme-color" content="#0b3553" />
    </Head>
  )
}

export default SEOHead
