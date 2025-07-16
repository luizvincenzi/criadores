const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function diagnoseDatabaseIssues() {
  console.log('🔍 Diagnóstico completo do banco de dados...');

  try {
    // 1. Verificar estrutura das tabelas principais
    console.log('\n📋 1. ESTRUTURA DAS TABELAS');
    
    // Campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);
    
    if (campaigns && campaigns.length > 0) {
      console.log('✅ Campaigns - Colunas:', Object.keys(campaigns[0]));
    }

    // Campaign_creators
    const { data: campaignCreators } = await supabase
      .from('campaign_creators')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);
    
    if (campaignCreators && campaignCreators.length > 0) {
      console.log('✅ Campaign_creators - Colunas:', Object.keys(campaignCreators[0]));
    } else {
      console.log('⚠️ Campaign_creators - Nenhum registro encontrado');
    }

    // Creators
    const { data: creators } = await supabase
      .from('creators')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);
    
    if (creators && creators.length > 0) {
      console.log('✅ Creators - Colunas:', Object.keys(creators[0]));
    }

    // 2. Verificar dados atuais
    console.log('\n📊 2. DADOS ATUAIS');
    
    const { data: allCampaigns } = await supabase
      .from('campaigns')
      .select('id, title, month, business:businesses(name)')
      .eq('organization_id', DEFAULT_ORG_ID);
    
    console.log(`📋 Campanhas: ${allCampaigns?.length || 0}`);
    allCampaigns?.forEach((camp, i) => {
      console.log(`  ${i + 1}. ${camp.business?.name} - ${camp.title} (${camp.month})`);
    });

    const { data: allCreators } = await supabase
      .from('creators')
      .select('id, name, status')
      .eq('organization_id', DEFAULT_ORG_ID);
    
    console.log(`\n👥 Criadores: ${allCreators?.length || 0}`);
    console.log(`  Ativos: ${allCreators?.filter(c => c.status === 'Ativo').length || 0}`);
    console.log(`  Precisa engajar: ${allCreators?.filter(c => c.status === 'Precisa engajar').length || 0}`);

    const { data: allRelations } = await supabase
      .from('campaign_creators')
      .select('id, status, campaign_id, creator_id')
      .eq('organization_id', DEFAULT_ORG_ID);
    
    console.log(`\n🔗 Relacionamentos: ${allRelations?.length || 0}`);
    const statusCounts = {};
    allRelations?.forEach(rel => {
      statusCounts[rel.status] = (statusCounts[rel.status] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // 3. Verificar constraints e índices
    console.log('\n🔒 3. CONSTRAINTS E ÍNDICES');
    
    // Tentar inserir um registro de teste para ver que erro dá
    console.log('\n🧪 4. TESTE DE INSERÇÃO');
    
    if (allCampaigns && allCampaigns.length > 0 && allCreators && allCreators.length > 0) {
      const testCampaign = allCampaigns[0];
      const testCreator = allCreators[0];
      
      console.log(`Testando inserção: ${testCreator.name} → ${testCampaign.title}`);
      
      const testData = {
        organization_id: DEFAULT_ORG_ID,
        campaign_id: testCampaign.id,
        creator_id: testCreator.id,
        role: 'primary',
        status: 'Pendente',
        deliverables: {
          briefing_complete: 'Pendente',
          visit_datetime: null,
          guest_quantity: 0,
          visit_confirmed: 'Pendente',
          post_datetime: null,
          video_approved: 'Pendente',
          video_posted: 'Não',
          content_links: []
        }
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('campaign_creators')
        .insert(testData)
        .select();

      if (insertError) {
        console.log('❌ Erro na inserção de teste:', insertError);
        console.log('   Código:', insertError.code);
        console.log('   Detalhes:', insertError.details);
        console.log('   Hint:', insertError.hint);
      } else {
        console.log('✅ Inserção de teste bem-sucedida:', insertResult?.[0]?.id);
        
        // Remover o registro de teste
        await supabase
          .from('campaign_creators')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('🗑️ Registro de teste removido');
      }
    }

    // 5. Verificar campos obrigatórios
    console.log('\n📝 5. CAMPOS OBRIGATÓRIOS');
    
    const requiredFields = [
      'organization_id',
      'campaign_id', 
      'creator_id',
      'role',
      'status'
    ];

    console.log('Campos obrigatórios esperados:', requiredFields);

    // 6. Verificar tipos de dados
    console.log('\n🔢 6. TIPOS DE DADOS');
    
    if (campaignCreators && campaignCreators.length > 0) {
      const sample = campaignCreators[0];
      Object.entries(sample).forEach(([key, value]) => {
        console.log(`  ${key}: ${typeof value} ${Array.isArray(value) ? '(array)' : ''}`);
      });
    }

    // 7. Verificar se há registros órfãos
    console.log('\n👻 7. REGISTROS ÓRFÃOS');
    
    const { data: orphanRelations } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        campaign_id,
        creator_id,
        campaign:campaigns(id),
        creator:creators(id)
      `)
      .eq('organization_id', DEFAULT_ORG_ID);

    const orphans = orphanRelations?.filter(rel => !rel.campaign || !rel.creator) || [];
    
    if (orphans.length > 0) {
      console.log(`⚠️ ${orphans.length} relacionamentos órfãos encontrados:`);
      orphans.forEach(orphan => {
        console.log(`  ID: ${orphan.id}, Campaign: ${!!orphan.campaign}, Creator: ${!!orphan.creator}`);
      });
    } else {
      console.log('✅ Nenhum relacionamento órfão encontrado');
    }

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
  }
}

// Executar
diagnoseDatabaseIssues();
