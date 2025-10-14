import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLP() {
  console.log('🔍 Verificando LP no Supabase...');
  console.log('📍 URL:', supabaseUrl);
  console.log('');

  // Buscar LP por slug
  const { data: lp, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', 'empresas/social-media-advogados')
    .single();

  if (error) {
    console.error('❌ Erro ao buscar LP:', error);
    console.log('');
    console.log('🔍 Buscando TODAS as LPs com slug parecido...');
    
    const { data: allLPs } = await supabase
      .from('landing_pages')
      .select('id, slug, name, status, is_active')
      .ilike('slug', '%advogados%');
    
    console.log('📋 LPs encontradas:', allLPs);
    return;
  }

  console.log('✅ LP encontrada!');
  console.log('📄 Dados:', {
    id: lp.id,
    slug: lp.slug,
    name: lp.name,
    status: lp.status,
    is_active: lp.is_active,
  });
  console.log('');

  // Buscar versões
  const { data: versions, error: versionsError } = await supabase
    .from('lp_versions')
    .select('version_number, created_at')
    .eq('lp_id', lp.id)
    .order('version_number', { ascending: false });

  if (versionsError) {
    console.error('❌ Erro ao buscar versões:', versionsError);
    return;
  }

  console.log('📚 Versões encontradas:', versions?.length || 0);
  if (versions && versions.length > 0) {
    console.log('📝 Última versão:', versions[0]);
  }
}

checkLP();

