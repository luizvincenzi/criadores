'use client';

import { useEffect } from 'react'
import Linktree from '../../components/Linktree'
import SEOHead from '../../components/SEOHead'

const CrialinkPage = () => {
  useEffect(() => {
    // Configurar meta tags para mobile
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    }

    // Configurar título da página
    document.title = 'crIAdores - Links'
    
    // Configurar meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Conecte seu negócio aos melhores criadores de conteúdo da sua região. Campanhas de marketing que geram resultados reais!')
    }

    // Adicionar meta tags para redes sociais se não existirem
    const addMetaTag = (property: string, content: string) => {
      if (!document.querySelector(`meta[property="${property}"]`)) {
        const meta = document.createElement('meta')
        meta.setAttribute('property', property)
        meta.setAttribute('content', content)
        document.head.appendChild(meta)
      }
    }

    addMetaTag('og:title', 'crIAdores - Conectando Negócios Locais a Criadores de Conteúdo')
    addMetaTag('og:description', 'Conecte seu negócio aos melhores criadores de conteúdo da sua região. Campanhas de marketing que geram resultados reais!')
    addMetaTag('og:type', 'website')
    addMetaTag('og:image', '/faviconcriadoresA3.png')

    // Cleanup function
    return () => {
      document.title = 'crIAdores'
    }
  }, [])

  return (
    <>
      <SEOHead page="links" />
      <Linktree />
    </>
  )
}

export default CrialinkPage
