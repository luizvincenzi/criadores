import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorName = searchParams.get('name');

    if (!creatorName) {
      return NextResponse.json(
        { success: false, error: 'Nome do criador é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando campanhas para o criador: ${creatorName}`);

    // Buscar campanhas do criador no Supabase
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        business:businesses(name),
        creators:campaign_creators(
          creator:creators(name)
        )
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true);

    if (error) {
      console.error('❌ Erro ao buscar campanhas:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Filtrar campanhas que incluem o criador
    const creatorCampaigns = data.filter(campaign => {
      // Verificar se o criador está associado à campanha
      return campaign.creators?.some((cc: any) => 
        cc.creator?.name?.toLowerCase().includes(creatorName.toLowerCase())
      );
    });

    // Mapear para formato compatível
    const mappedCampaigns = creatorCampaigns.map(campaign => ({
      id: campaign.id,
      campanha: campaign.title || campaign.name || 'Campanha sem título',
      business: campaign.business?.name || 'Negócio não informado',
      mes: campaign.month || new Date(campaign.created_at).toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      }),
      status: campaign.status || 'Em andamento',
      linkTrabalho: campaign.work_link || '',
      dataInicio: campaign.start_date,
      dataFim: campaign.end_date,
      observacoes: campaign.notes || ''
    }));

    console.log(`✅ ${mappedCampaigns.length} campanhas encontradas para ${creatorName}`);

    return NextResponse.json({
      success: true,
      data: mappedCampaigns,
      count: mappedCampaigns.length,
      creator: creatorName
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}
