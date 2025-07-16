import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupCampaignCreators() {
  console.log('🔧 Configurando relacionamentos Campaign-Creators...\n');
  
  try {
    // 1. Verificar se a tabela campaign_creators existe
    console.log('📋 Verificando estrutura das tabelas...');

    // Tentar acessar diretamente a tabela campaign_creators
    let hasCampaignCreators = false;

    try {
      const { data: testCC, error: testCCError } = await supabase
        .from('campaign_creators')
        .select('id')
        .limit(1);

      if (!testCCError) {
        hasCampaignCreators = true;
        console.log('✅ Tabela campaign_creators existe');
      } else {
        console.log('❌ Tabela campaign_creators não existe:', testCCError.message);
      }
    } catch (error) {
      console.log('❌ Tabela campaign_creators não existe');
    }
    
    // 2. Verificar dados atuais
    console.log('\n📊 Verificando dados atuais...');
    
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*');
    
    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }
    
    console.log(`📈 Campanhas encontradas: ${campaigns?.length || 0}`);
    
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*');
    
    if (creatorsError) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return;
    }
    
    console.log(`👥 Criadores encontrados: ${creators?.length || 0}`);
    
    if (hasCampaignCreators) {
      const { data: campaignCreators, error: ccError } = await supabase
        .from('campaign_creators')
        .select('*');
      
      if (ccError) {
        console.error('❌ Erro ao buscar campaign_creators:', ccError);
      } else {
        console.log(`🔗 Relacionamentos existentes: ${campaignCreators?.length || 0}`);
      }
    }
    
    // 3. Analisar dados do Google Sheets para migração
    console.log('\n📋 Analisando dados do Google Sheets...');
    
    // Buscar dados das campanhas do Google Sheets
    const sheetsResponse = await fetch('http://localhost:3000/api/sheets/campaigns');
    const sheetsData = await sheetsResponse.json();
    
    if (sheetsData.success) {
      console.log(`📊 Campanhas no Google Sheets: ${sheetsData.data.length}`);
      
      // Analisar estrutura dos relacionamentos
      const relationshipAnalysis = new Map<string, Set<string>>();
      
      sheetsData.data.forEach((campaign: any) => {
        const businessName = campaign.businessName || 'Sem Business';
        const creatorName = campaign.criadorName || campaign.influenciador || 'Sem Criador';
        const month = campaign.mes || 'Sem Mês';
        
        const key = `${businessName}-${month}`;
        
        if (!relationshipAnalysis.has(key)) {
          relationshipAnalysis.set(key, new Set());
        }
        
        if (creatorName !== 'Sem Criador') {
          relationshipAnalysis.get(key)!.add(creatorName);
        }
      });
      
      console.log('\n🔍 Análise de relacionamentos:');
      let totalRelationships = 0;
      
      relationshipAnalysis.forEach((creators, campaignKey) => {
        console.log(`  📋 ${campaignKey}: ${creators.size} criadores`);
        totalRelationships += creators.size;
      });
      
      console.log(`📊 Total de relacionamentos a migrar: ${totalRelationships}`);
      
      // 4. Verificar correspondência entre dados
      console.log('\n🔍 Verificando correspondência de dados...');
      
      const supabaseCampaignTitles = new Set(campaigns?.map(c => c.title) || []);
      const supabaseCreatorNames = new Set(creators?.map(c => c.nome) || []);
      
      let matchedCampaigns = 0;
      let matchedCreators = 0;
      
      relationshipAnalysis.forEach((sheetCreators, campaignKey) => {
        // Verificar se existe campanha correspondente no Supabase
        const campaignExists = campaigns?.some(c => 
          c.title.includes(campaignKey.split('-')[0]) || 
          campaignKey.includes(c.title)
        );
        
        if (campaignExists) {
          matchedCampaigns++;
        }
        
        // Verificar criadores
        sheetCreators.forEach(creatorName => {
          if (supabaseCreatorNames.has(creatorName)) {
            matchedCreators++;
          }
        });
      });
      
      console.log(`✅ Campanhas com correspondência: ${matchedCampaigns}/${relationshipAnalysis.size}`);
      console.log(`✅ Criadores com correspondência: ${matchedCreators}/${totalRelationships}`);
      
      // 5. Propor estratégia de migração
      console.log('\n📋 Estratégia de migração recomendada:');
      
      if (hasCampaignCreators) {
        console.log('1. ✅ Tabela campaign_creators já existe');
      } else {
        console.log('1. ❌ Criar tabela campaign_creators (executar migration)');
      }
      
      console.log('2. 🔄 Mapear campanhas do Google Sheets para Supabase por:');
      console.log('   - Business name + mês');
      console.log('   - Título da campanha');
      
      console.log('3. 🔄 Mapear criadores por nome exato');
      
      console.log('4. 🔄 Criar relacionamentos campaign_creators com:');
      console.log('   - Dados de deliverables do Google Sheets');
      console.log('   - Status baseado no status da campanha');
      console.log('   - Performance data inicial zerada');
      
      // 6. Mostrar exemplo de dados para migração
      if (sheetsData.data.length > 0) {
        console.log('\n📋 Exemplo de dados para migração:');
        const firstCampaign = sheetsData.data[0];
        
        console.log('Google Sheets:');
        console.log(`  - Campaign ID: ${firstCampaign.campaignId}`);
        console.log(`  - Business: ${firstCampaign.businessName}`);
        console.log(`  - Criador: ${firstCampaign.criadorName || firstCampaign.influenciador}`);
        console.log(`  - Mês: ${firstCampaign.mes}`);
        console.log(`  - Status: ${firstCampaign.status}`);
        console.log(`  - Briefing: ${firstCampaign.briefingCompleto}`);
        console.log(`  - Visita: ${firstCampaign.dataHoraVisita}`);
        console.log(`  - Vídeo aprovado: ${firstCampaign.videoAprovado}`);
        
        // Buscar campanha correspondente no Supabase
        const matchingCampaign = campaigns?.find(c => 
          c.title.includes(firstCampaign.businessName) && 
          c.month === firstCampaign.mes
        );
        
        if (matchingCampaign) {
          console.log('\nSupabase (campanha correspondente):');
          console.log(`  - ID: ${matchingCampaign.id}`);
          console.log(`  - Título: ${matchingCampaign.title}`);
          console.log(`  - Business ID: ${matchingCampaign.business_id}`);
          console.log(`  - Mês: ${matchingCampaign.month}`);
          console.log(`  - Status: ${matchingCampaign.status}`);
        } else {
          console.log('\n❌ Nenhuma campanha correspondente encontrada no Supabase');
        }
        
        // Buscar criador correspondente
        const matchingCreator = creators?.find(c => 
          c.nome === (firstCampaign.criadorName || firstCampaign.influenciador)
        );
        
        if (matchingCreator) {
          console.log('\nSupabase (criador correspondente):');
          console.log(`  - ID: ${matchingCreator.id}`);
          console.log(`  - Nome: ${matchingCreator.nome}`);
          console.log(`  - Instagram: ${matchingCreator.instagram}`);
          console.log(`  - Cidade: ${matchingCreator.cidade}`);
        } else {
          console.log('\n❌ Nenhum criador correspondente encontrado no Supabase');
        }
      }
      
    } else {
      console.error('❌ Erro ao buscar dados do Google Sheets:', sheetsData.error);
    }
    
    console.log('\n✅ Análise de relacionamentos Campaign-Creators concluída!');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

if (require.main === module) {
  setupCampaignCreators()
    .then(() => {
      console.log('\n🎉 Configuração finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Configuração falhou:', error);
      process.exit(1);
    });
}

export { setupCampaignCreators };
