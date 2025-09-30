import { supabase } from './supabase';

export interface Creator {
  id: string;
  name: string;
  slug: string;
  profile_info: {
    biography?: string;
    category?: string;
    location?: {
      city?: string;
      state?: string;
    };
    photo_url?: string;
  };
  social_media: {
    instagram?: {
      username?: string;
      followers?: number;
      profile_url?: string;
    };
  };
  contact_info: {
    whatsapp?: string;
  };
  status: string;
  is_active: boolean;
  created_at: string;
}

const DEFAULT_ORG_ID = 'org_default_migration';

// Buscar todos os criadores de Londrina
export async function getLondrinaCreators(): Promise<Creator[]> {
  console.log('👥 Buscando criadores de Londrina...');

  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('organization_id', DEFAULT_ORG_ID)
    .eq('is_active', true)
    .or('profile_info->>city.eq.Londrina,profile_info->>city.eq.Londrina - PR')
    .order('name');

  if (error) {
    console.error('❌ Erro ao buscar criadores:', error);
    // Retorna array vazio em caso de erro
    return [];
  }

  console.log(`✅ ${data?.length || 0} criadores de Londrina encontrados`);
  return data || [];
}

// Buscar criador por slug
export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  console.log(`👤 Buscando criador com slug: ${slug}`);

  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('slug', slug)
    .eq('organization_id', DEFAULT_ORG_ID)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('❌ Erro ao buscar criador:', error);
    return null;
  }

  console.log(`✅ Criador encontrado: ${data?.name}`);
  return data;
}

// Buscar todos os slugs de criadores (para generateStaticParams)
export async function getAllCreatorSlugs(): Promise<string[]> {
  console.log('📝 Buscando todos os slugs de criadores...');

  try {
    // Remover o filtro de organization_id durante o build para evitar erro de UUID
    const { data, error } = await supabase
      .from('creators')
      .select('slug')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Erro ao buscar slugs:', error);
      return [];
    }

    // Filtrar apenas criadores com slug válido
    const slugs = data?.map(c => c.slug).filter((slug): slug is string => Boolean(slug) && slug.length > 0) || [];
    console.log(`✅ ${slugs.length} slugs encontrados`);
    return slugs;
  } catch (err) {
    console.error('❌ Erro inesperado ao buscar slugs:', err);
    return [];
  }
}

// Gerar slug a partir do nome
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-'); // Substitui espaços por hífens
}