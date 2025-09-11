import { usePathname } from 'next/navigation';

/**
 * Hook para gerar breadcrumbs automaticamente baseado na URL
 */
export function useBreadcrumbs() {
  const pathname = usePathname();
  
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { name: 'Home', url: 'https://www.criadores.app/' }
    ];

    let currentPath = '';
    
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Mapear nomes amigáveis para as rotas
      const routeNames: Record<string, string> = {
        'blog': 'Blog',
        'criavoz-homepage': 'CriaVoz',
        'politica-privacidade': 'Política de Privacidade',
        'privacy-policy': 'Privacy Policy',
        'terms-of-service': 'Termos de Serviço',
        'perguntas-frequentes': 'Perguntas Frequentes',
      };

      let name = routeNames[path] || path;
      
      // Para posts do blog, usar o slug como nome temporário
      // (será substituído pelo título real no componente)
      if (paths[0] === 'blog' && index === 1) {
        name = 'Post'; // Será substituído pelo título real
      }

      breadcrumbs.push({
        name,
        url: `https://www.criadores.app${currentPath}`,
      });
    });

    return breadcrumbs;
  };

  return generateBreadcrumbs();
}

/**
 * Hook para gerar dados estruturados baseado no tipo de página
 */
export function usePageStructuredData() {
  const pathname = usePathname();
  
  const getPageType = () => {
    if (pathname === '/') return 'homepage';
    if (pathname === '/blog') return 'blog-index';
    if (pathname.startsWith('/blog/')) return 'blog-post';
    if (pathname === '/criavoz-homepage') return 'landing';
    if (pathname === '/perguntas-frequentes') return 'faq';
    if (pathname.includes('politica') || pathname.includes('privacy') || pathname.includes('terms')) {
      return 'legal';
    }
    return 'page';
  };

  const shouldIncludeWebSite = () => {
    // Incluir WebSite schema apenas na homepage
    return pathname === '/';
  };

  const shouldIncludeOrganization = () => {
    // Incluir Organization schema em páginas principais
    return ['/', '/blog', '/criavoz-homepage'].includes(pathname);
  };

  return {
    pageType: getPageType(),
    shouldIncludeWebSite: shouldIncludeWebSite(),
    shouldIncludeOrganization: shouldIncludeOrganization(),
  };
}
