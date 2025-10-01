import { supabase } from './supabase';

// Interface dos criadores (Supabase já retorna JSONB como objetos)
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
  is_vip?: boolean;
  created_at: string;
}

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Buscar todos os criadores VIP de Londrina
export async function getLondrinaCreators(): Promise<Creator[]> {
  console.log('👥 [SERVICE] Buscando criadores VIP de Londrina...');

  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('organization_id', DEFAULT_ORG_ID)
    .eq('is_active', true)
    .eq('is_vip', true)
    .order('name');

  if (error) {
    console.error('❌ [SERVICE] Erro ao buscar criadores:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('⚠️ [SERVICE] Nenhum criador VIP encontrado no banco de dados');
    return [];
  }

  console.log(`✅ [SERVICE] ${data.length} criadores VIP encontrados no total`);

  // Filtrar criadores de Londrina
  const londrinaCreators = (data as Creator[]).filter(creator => {
    const city = creator.profile_info?.location?.city || '';
    const isLondrina = city.toLowerCase().includes('londrina');
    return isLondrina;
  });

  console.log(`✅ [SERVICE] ${londrinaCreators.length} criadores VIP de Londrina filtrados`);
  return londrinaCreators;
}

// Buscar criador por slug
export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  console.log(`👤 [SERVICE] Buscando criador com slug: ${slug}`);

  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('❌ [SERVICE] Erro ao buscar criador:', error);
    return null;
  }

  if (!data) {
    console.log('⚠️ [SERVICE] Criador não encontrado');
    return null;
  }

  console.log(`✅ [SERVICE] Criador encontrado: ${data.name}`);
  return data as Creator;
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