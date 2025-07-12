import { NextRequest, NextResponse } from 'next/server';
import { getRawCampaignsData, getCreatorsData } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, quantidadeContratada } = body;

    console.log('🔄 API: Buscando slots de criadores:', { businessName, mes, quantidadeContratada });

    if (!businessName || !mes || !quantidadeContratada) {
      return NextResponse.json({ 
        success: false, 
        error: 'Parâmetros obrigatórios: businessName, mes, quantidadeContratada' 
      });
    }

    // Buscar campanhas existentes para este business/mês (dados brutos, sem agrupamento)
    const campaignsData = await getRawCampaignsData();
    const existingCampaigns = campaignsData.filter(campaign =>
      campaign.business?.toLowerCase() === businessName.toLowerCase() &&
      campaign.mes?.toLowerCase() === mes.toLowerCase()
    );

    // Buscar criadores disponíveis
    const creatorsData = await getCreatorsData();
    const availableCreators = creatorsData.filter(creator => 
      creator.status?.toLowerCase() !== 'inativo' && 
      creator.status?.toLowerCase() !== 'bloqueado'
    );

    // Criar array de slots baseado na quantidade contratada
    const slots = [];

    console.log(`📊 Campanhas encontradas para ${businessName} - ${mes}:`, existingCampaigns.length);
    console.log(`📊 Criadores contratados: ${quantidadeContratada}`);

    // Primeiro, adicionar todas as campanhas existentes
    existingCampaigns.forEach((campaign, index) => {
      console.log(`📋 Campanha ${index + 1}: ${campaign.influenciador}`);
      slots.push({
        index: index,
        influenciador: campaign.influenciador,
        briefingCompleto: campaign.briefingCompleto,
        dataHoraVisita: campaign.dataHoraVisita,
        quantidadeConvidados: campaign.quantidadeConvidados,
        visitaConfirmado: campaign.visitaConfirmado,
        dataHoraPostagem: campaign.dataHoraPostagem,
        videoAprovado: campaign.videoAprovado,
        videoPostado: campaign.videoPostado,
        isExisting: true
      });
    });

    // Depois, adicionar slots vazios para completar a quantidade contratada
    const remainingSlots = quantidadeContratada - existingCampaigns.length;
    console.log(`📋 Slots vazios a criar: ${remainingSlots}`);

    for (let i = 0; i < remainingSlots; i++) {
      slots.push({
        index: existingCampaigns.length + i,
        influenciador: '',
        briefingCompleto: 'pendente',
        dataHoraVisita: '',
        quantidadeConvidados: '',
        visitaConfirmado: 'pendente',
        dataHoraPostagem: '',
        videoAprovado: 'pendente',
        videoPostado: 'pendente',
        isExisting: false
      });
    }

    console.log(`✅ API: ${slots.length} slots de criadores gerados`);

    return NextResponse.json({ 
      success: true, 
      slots,
      availableCreators: availableCreators.map(creator => ({
        id: creator.id,
        nome: creator.nome,
        cidade: creator.cidade,
        status: creator.status
      }))
    });

  } catch (error) {
    console.error('❌ API: Erro ao buscar slots de criadores:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
}
