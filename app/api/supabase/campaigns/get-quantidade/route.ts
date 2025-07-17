import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { standardizeMonth } from '@/lib/month-utils';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Função auxiliar para converter nome do mês para número
function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'jan': 1, 'fev': 2, 'mar': 3, 'abr': 4, 'mai': 5, 'jun': 6,
    'jul': 7, 'ago': 8, 'set': 9, 'out': 10, 'nov': 11, 'dez': 12
  };
  return months[monthName.toLowerCase()] || 7;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes } = body;

    console.log('🔍 Buscando quantidade_criadores:', { businessName, mes });

    if (!businessName || !mes) {
      return NextResponse.json({
        success: false,
        error: 'businessName e mes são obrigatórios'
      }, { status: 400 });
    }

    // Converter mês para month_year_id
    let monthYearId: number;

    if (typeof mes === 'number' || /^\d{6}$/.test(mes)) {
      monthYearId = parseInt(mes.toString());
    } else {
      const standardMonth = standardizeMonth(mes);
      const [monthName, yearShort] = standardMonth.split(' ');
      const year = 2000 + parseInt(yearShort);
      const monthNum = getMonthNumber(monthName);
      monthYearId = year * 100 + monthNum;
    }

    // 1. Buscar business_id
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .ilike('name', `%${businessName}%`)
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    if (businessError || !business || business.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Business "${businessName}" não encontrado`
      }, { status: 404 });
    }

    const businessData = Array.isArray(business) ? business[0] : business;

    // 2. Buscar campanha e quantidade_criadores
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, quantidade_criadores')
      .eq('business_id', businessData.id)
      .eq('month_year_id', monthYearId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({
        success: false,
        error: `Campanha não encontrada para ${businessName} - mês ${monthYearId}`
      }, { status: 404 });
    }

    console.log('✅ Quantidade encontrada:', {
      campaignId: campaign.id,
      title: campaign.title,
      quantidade_criadores: campaign.quantidade_criadores
    });

    return NextResponse.json({
      success: true,
      quantidade_criadores: campaign.quantidade_criadores,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        quantidade_criadores: campaign.quantidade_criadores
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar quantidade_criadores:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
