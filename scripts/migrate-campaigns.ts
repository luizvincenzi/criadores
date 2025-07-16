import { supabase } from '../lib/supabase';
import { GoogleSheetsService } from '../lib/google-sheets';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Função para gerar UUID válido a partir de string
function generateUUIDFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
  const timestamp = Date.now().toString(16).slice(-8);
  const random = Math.random().toString(16).slice(2, 10);
  
  return `${hashStr.slice(0, 8)}-${timestamp.slice(0, 4)}-4${timestamp.slice(4, 7)}-8${random.slice(0, 3)}-${random.slice(3, 15).padEnd(12, '0')}`;
}

async function migrateCampaigns() {
  console.log('🚀 Iniciando migração de campanhas...');

  try {
    // 1. Buscar campanhas do Google Sheets
    const sheetsService = new GoogleSheetsService();
    const campanhasData = await sheetsService.getCampanhas();
    
    console.log(`📋 ${campanhasData.length} campanhas encontradas no Google Sheets`);

    if (campanhasData.length === 0) {
      console.log('❌ Nenhuma campanha encontrada no Google Sheets');
      return;
    }

    // 2. Buscar businesses e creators do Supabase para mapear IDs
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID);

    const { data: creators } = await supabase
      .from('creators')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log(`🏢 ${businesses?.length || 0} businesses encontrados no Supabase`);
    console.log(`👥 ${creators?.length || 0} creators encontrados no Supabase`);

    // 3. Criar mapas para busca rápida
    const businessMap = new Map(businesses?.map(b => [b.name, b.id]) || []);
    const creatorMap = new Map(creators?.map(c => [c.name, c.id]) || []);

    let migratedCount = 0;
    let skippedCount = 0;

    // 4. Processar cada campanha
    for (const campanha of campanhasData) {
      try {
        // Extrair dados da campanha
        const businessName = campanha['Nome Campanha'] || '';
        const creatorName = campanha['Criador'] || '';
        const mes = campanha['Mês'] || '';
        const status = campanha['Status_campaign'] || 'Reunião de briefing';
        const titulo = campanha['Titulo da campanha'] || '';

        console.log(`\n📝 Processando: ${businessName} - ${creatorName} - ${mes}`);

        // Verificar se business existe
        const businessId = businessMap.get(businessName);
        if (!businessId) {
          console.log(`❌ Business "${businessName}" não encontrado no Supabase`);
          skippedCount++;
          continue;
        }

        // Verificar se creator existe
        const creatorId = creatorMap.get(creatorName);
        if (!creatorId) {
          console.log(`❌ Creator "${creatorName}" não encontrado no Supabase`);
          skippedCount++;
          continue;
        }

        // Gerar ID único para a campanha
        const campaignId = generateUUIDFromString(`${businessName}-${mes}-${Date.now()}`);

        // Preparar dados da campanha
        const campaignData = {
          id: campaignId,
          organization_id: DEFAULT_ORG_ID,
          business_id: businessId,
          name: titulo || `Campanha ${businessName} - ${mes}`,
          month: mes,
          status: status,
          quantidade_contratada: 1, // Será ajustado depois
          formato: campanha['Formato'] || '',
          perfil_criador: campanha['Perfil do criador'] || '',
          objetivo: campanha['Objetivo'] || '',
          comunicacao_secundaria: campanha['Comunicação secundária'] || '',
          datas_gravacao: campanha['Datas e horários para gravação'] || '',
          conteudo_video: campanha['O que precisa ser falado no vídeo'] || '',
          historia: campanha['História'] || '',
          promocao_cta: campanha['Promoção CTA'] || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Inserir campanha
        const { error: campaignError } = await supabase
          .from('campaigns')
          .insert(campaignData);

        if (campaignError) {
          console.log(`❌ Erro ao inserir campanha: ${campaignError.message}`);
          skippedCount++;
          continue;
        }

        // Criar relacionamento campaign-creator
        const relationshipData = {
          id: generateUUIDFromString(`${campaignId}-${creatorId}`),
          organization_id: DEFAULT_ORG_ID,
          campaign_id: campaignId,
          creator_id: creatorId,
          status: 'active',
          created_at: new Date().toISOString()
        };

        const { error: relationshipError } = await supabase
          .from('campaign_creators')
          .insert(relationshipData);

        if (relationshipError) {
          console.log(`❌ Erro ao criar relacionamento: ${relationshipError.message}`);
        } else {
          console.log(`✅ Campanha migrada com sucesso`);
          migratedCount++;
        }

      } catch (error) {
        console.error(`❌ Erro ao processar campanha:`, error);
        skippedCount++;
      }
    }

    console.log(`\n🎉 Migração concluída!`);
    console.log(`✅ ${migratedCount} campanhas migradas`);
    console.log(`⚠️ ${skippedCount} campanhas ignoradas`);

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Executar migração
migrateCampaigns();
