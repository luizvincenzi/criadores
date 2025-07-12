import { NextRequest, NextResponse } from 'next/server';
import { getCampaignsData, getCreatorsData } from '@/app/actions/sheetsActions';

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

    // Buscar campanhas existentes para este business/mês
    const campaignsData = await getCampaignsData();
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
    
    for (let i = 0; i < quantidadeContratada; i++) {
      const existingCampaign = existingCampaigns[i];
      
      if (existingCampaign) {
        // Usar dados da campanha existente
        slots.push({
          index: i,
          influenciador: existingCampaign.influenciador,
          briefingCompleto: existingCampaign.briefingCompleto,
          dataHoraVisita: existingCampaign.dataHoraVisita,
          quantidadeConvidados: existingCampaign.quantidadeConvidados,
          visitaConfirmado: existingCampaign.visitaConfirmado,
          dataHoraPostagem: existingCampaign.dataHoraPostagem,
          videoAprovado: existingCampaign.videoAprovado,
          videoPostado: existingCampaign.videoPostado,
          isExisting: true
        });
      } else {
        // Criar slot vazio para novo criador
        slots.push({
          index: i,
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
