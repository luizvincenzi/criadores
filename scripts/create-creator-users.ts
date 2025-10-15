import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Usar service role key para ter permissões de admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function createCreatorUsers() {
  console.log('👥 CRIANDO USUÁRIOS CREATOR E MARKETING_STRATEGIST\n');
  
  try {
    // 1. Verificar se a organização existe
    console.log('🏢 1. Verificando organização...');
    
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', DEFAULT_ORG_ID)
      .single();
    
    if (orgError || !org) {
      console.error('❌ Organização não encontrada');
      return;
    }
    
    console.log('✅ Organização encontrada:', org.name);
    
    // 2. Criar ou buscar criador para Pietra Mantovani
    console.log('\n🎬 2. Buscando/criando criador para Pietra Mantovani...');

    // Verificar se criador já existe
    const { data: existingCreator } = await supabase
      .from('creators')
      .select('id')
      .eq('slug', 'pietra-mantovani')
      .single();

    let pietrasCreator;

    if (existingCreator) {
      pietrasCreator = existingCreator;
      console.log('   ℹ️ Criador já existe:', pietrasCreator.id);
    } else {
      const { data, error: creatorError } = await supabase
        .from('creators')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          name: 'Pietra Mantovani',
          slug: 'pietra-mantovani',
          status: 'Ativo',
          is_active: true,
          contact_info: {
            email: 'pietramantovani98@gmail.com',
            whatsapp: '',
            phone: '',
            preferred_contact: 'email'
          }
        })
        .select()
        .single();

      if (creatorError) {
        console.error('❌ Erro ao criar criador:', creatorError);
        return;
      }

      pietrasCreator = data;
      console.log('   ✅ Criador criado:', pietrasCreator.id);
    }
    
    // 3. Criar ou atualizar usuário Pietra Mantovani (creator)
    console.log('\n👤 3. Criando/atualizando usuário Pietra Mantovani (creator)...');

    // Verificar se usuário já existe
    const { data: existingPietra } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'pietramantovani98@gmail.com')
      .single();

    let pietrasUser;
    let pietrasError;

    if (existingPietra) {
      // Atualizar usuário existente
      const { data, error } = await supabase
        .from('users')
        .update({
          role: 'creator',
          roles: ['creator', 'marketing_strategist'],
          creator_id: pietrasCreator.id,
          permissions: {
            campaigns: { read: true, write: false, delete: false },
            conteudo: { read: true, write: true, delete: true },
            reports: { read: true, write: false, delete: false },
            tasks: { read: true, write: true, delete: false }
          },
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPietra.id)
        .select()
        .single();

      pietrasUser = data;
      pietrasError = error;
      console.log('   ℹ️ Usuário já existia, atualizando com múltiplos roles...');
    } else {
      // Criar novo usuário
      const { data, error } = await supabase
        .from('users')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          email: 'pietramantovani98@gmail.com',
          full_name: 'Pietra Mantovani',
          role: 'creator',
          roles: ['creator', 'marketing_strategist'],
          creator_id: pietrasCreator.id,
          permissions: {
            campaigns: { read: true, write: false, delete: false },
            conteudo: { read: true, write: true, delete: true },
            reports: { read: true, write: false, delete: false },
            tasks: { read: true, write: true, delete: false }
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      pietrasUser = data;
      pietrasError = error;
    }

    if (pietrasError) {
      console.error('❌ Erro ao criar/atualizar usuário Pietra:', pietrasError);
      return;
    }

    console.log('✅ Usuário Pietra criado/atualizado:', pietrasUser.id);
    console.log('   Email:', pietrasUser.email);
    console.log('   Role:', pietrasUser.role);
    
    // 4. Criar usuário Marilia (marketing_strategist)
    console.log('\n👤 4. Criando usuário Marilia (marketing_strategist)...');
    
    // Buscar empresas para Marilia gerenciar
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(5);
    
    if (businessError) {
      console.warn('⚠️ Erro ao buscar empresas:', businessError);
    }
    
    const managedBusinessIds = businesses?.map(b => b.id) || [];
    
    // Verificar se Marilia já existe
    const { data: existingMarilia } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'marilia12cavalheiro@gmail.com')
      .single();

    let mariliaUser;
    let mariliaError;

    if (existingMarilia) {
      // Atualizar usuário existente
      const { data, error } = await supabase
        .from('users')
        .update({
          role: 'marketing_strategist',
          roles: ['marketing_strategist', 'creator'],
          managed_businesses: managedBusinessIds,
          permissions: {
            campaigns: { read: true, write: true, delete: false },
            conteudo: { read: true, write: true, delete: false },
            briefings: { read: true, write: true, delete: false },
            reports: { read: true, write: false, delete: false },
            tasks: { read: true, write: true, delete: false }
          },
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMarilia.id)
        .select()
        .single();

      mariliaUser = data;
      mariliaError = error;
      console.log('   ℹ️ Usuário já existia, atualizando com múltiplos roles...');
    } else {
      // Criar novo usuário
      const { data, error } = await supabase
        .from('users')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          email: 'marilia12cavalheiro@gmail.com',
          full_name: 'Marilia',
          role: 'marketing_strategist',
          roles: ['marketing_strategist', 'creator'],
          managed_businesses: managedBusinessIds,
          permissions: {
            campaigns: { read: true, write: true, delete: false },
            conteudo: { read: true, write: true, delete: false },
            briefings: { read: true, write: true, delete: false },
            reports: { read: true, write: false, delete: false },
            tasks: { read: true, write: true, delete: false }
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      mariliaUser = data;
      mariliaError = error;
    }
    
    if (mariliaError) {
      console.error('❌ Erro ao criar usuário Marilia:', mariliaError);
      return;
    }
    
    console.log('✅ Usuário Marilia criado:', mariliaUser.id);
    console.log('   Email:', mariliaUser.email);
    console.log('   Role:', mariliaUser.role);
    console.log('   Empresas gerenciadas:', managedBusinessIds.length);
    
    // 5. Resumo
    console.log('\n✅ USUÁRIOS CRIADOS COM SUCESSO!\n');
    console.log('📋 Resumo:');
    console.log('─'.repeat(60));
    console.log('1. Pietra Mantovani');
    console.log('   Email: pietramantovani98@gmail.com');
    console.log('   Senha: 2#Todoscria');
    console.log('   Roles: creator + marketing_strategist');
    console.log('   Dashboard: /dashboard/criador');
    console.log('   Permissões: Ver campanhas + Criar conteúdo + Planejar calendário');
    console.log('');
    console.log('2. Marilia');
    console.log('   Email: marilia12cavalheiro@gmail.com');
    console.log('   Senha: 2#Todoscria');
    console.log('   Roles: marketing_strategist + creator');
    console.log('   Dashboard: /dashboard/criador');
    console.log('   Permissões: Planejar calendário + Criar conteúdo + Criar briefings');
    console.log('─'.repeat(60));
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createCreatorUsers();

