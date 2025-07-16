import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function createTestCreators() {
  console.log('🔄 Criando criadores de teste...');

  const testCreators = [
    {
      id: '55310ebd-0e0d-492e-8c34-cd4740000001',
      organization_id: DEFAULT_ORG_ID,
      name: 'Ana Silva',
      instagram: '@ana_silva_sp',
      whatsapp: '11999999001',
      seguidores: 15000,
      status: 'Ativo'
    },
    {
      id: '55310ebd-0e0d-492e-8c34-cd4740000002',
      organization_id: DEFAULT_ORG_ID,
      name: 'Bruno Santos',
      instagram: '@bruno_santos_rj',
      whatsapp: '21999999002',
      seguidores: 25000,
      status: 'Ativo'
    },
    {
      id: '55310ebd-0e0d-492e-8c34-cd4740000003',
      organization_id: DEFAULT_ORG_ID,
      name: 'Carla Oliveira',
      instagram: '@carla_oliveira_bh',
      whatsapp: '31999999003',
      seguidores: 18000,
      status: 'Ativo'
    },
    {
      id: '55310ebd-0e0d-492e-8c34-cd4740000004',
      organization_id: DEFAULT_ORG_ID,
      name: 'Diego Costa',
      instagram: '@diego_costa_sp',
      whatsapp: '11999999004',
      seguidores: 32000,
      status: 'Ativo'
    },
    {
      id: '55310ebd-0e0d-492e-8c34-cd4740000005',
      organization_id: DEFAULT_ORG_ID,
      name: 'Elena Rodrigues',
      instagram: '@elena_rodrigues_poa',
      whatsapp: '51999999005',
      seguidores: 22000,
      status: 'Precisa engajar'
    },
    {
      id: '55310ebd-0e0d-492e-8c34-cd4740000006',
      organization_id: DEFAULT_ORG_ID,
      name: 'Felipe Martins',
      instagram: '@felipe_martins_cwb',
      whatsapp: '41999999006',
      seguidores: 28000,
      status: 'Ativo'
    }
  ];

  try {
    // Verificar se já existem criadores
    const { data: existingCreators, error: checkError } = await supabase
      .from('creators')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (checkError) {
      console.error('❌ Erro ao verificar criadores existentes:', checkError);
      return;
    }

    console.log(`📊 ${existingCreators?.length || 0} criadores já existem no banco`);

    // Filtrar criadores que ainda não existem
    const existingIds = existingCreators?.map(c => c.id) || [];
    const newCreators = testCreators.filter(c => !existingIds.includes(c.id));

    if (newCreators.length === 0) {
      console.log('✅ Todos os criadores de teste já existem');
      return;
    }

    console.log(`➕ Criando ${newCreators.length} novos criadores...`);

    // Inserir novos criadores
    const { data: insertedCreators, error: insertError } = await supabase
      .from('creators')
      .insert(newCreators)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir criadores:', insertError);
      return;
    }

    console.log(`✅ ${insertedCreators?.length || 0} criadores criados com sucesso:`);
    insertedCreators?.forEach(creator => {
      console.log(`  - ${creator.name} (${creator.city}) - ${creator.instagram_handle}`);
    });

    // Verificar total final
    const { data: finalCreators, error: finalError } = await supabase
      .from('creators')
      .select('id, name, city, status')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (!finalError && finalCreators) {
      console.log(`🎉 Total de criadores no banco: ${finalCreators.length}`);
      console.log('📋 Criadores por status:');
      const statusCount = finalCreators.reduce((acc, creator) => {
        acc[creator.status] = (acc[creator.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro na criação de criadores:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestCreators()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export { createTestCreators };
