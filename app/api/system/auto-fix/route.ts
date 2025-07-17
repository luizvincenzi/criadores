import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { campaignId, userEmail = 'sistema@auto-correcao.com' } = await request.json();

    console.log('🛠️ Auto-correção iniciada:', { campaignId, userEmail });

    if (campaignId) {
      // Corrigir campanha específica
      const { data, error } = await supabase.rpc('fix_campaign_integrity', {
        p_campaign_id: campaignId
      });

      if (error) {
        console.error('❌ Erro na auto-correção específica:', error);
        return NextResponse.json({
          success: false,
          error: `Erro na auto-correção: ${error.message}`
        }, { status: 500 });
      }

      console.log('✅ Auto-correção específica concluída:', data);

      return NextResponse.json({
        success: true,
        message: 'Campanha corrigida automaticamente',
        data: data,
        timestamp: new Date().toISOString()
      });

    } else {
      // Corrigir todo o sistema
      const { data, error } = await supabase.rpc('auto_fix_system');

      if (error) {
        console.error('❌ Erro na auto-correção geral:', error);
        return NextResponse.json({
          success: false,
          error: `Erro na auto-correção: ${error.message}`
        }, { status: 500 });
      }

      console.log('✅ Auto-correção geral concluída:', data);

      return NextResponse.json({
        success: true,
        message: 'Sistema corrigido automaticamente',
        data: data,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Erro na auto-correção:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno na auto-correção',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Endpoint GET para verificar se auto-correção é necessária
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    console.log('🔍 Verificando necessidade de auto-correção:', { campaignId });

    if (campaignId) {
      // Verificar campanha específica
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('quantidade_criadores')
        .eq('id', campaignId)
        .single();

      const { count } = await supabase
        .from('campaign_creators')
        .select('*', { count: 'exact' })
        .eq('campaign_id', campaignId)
        .neq('status', 'Removido');

      const needsFix = campaign?.quantidade_criadores !== (count || 0);

      return NextResponse.json({
        success: true,
        needsFix,
        details: {
          expectedCount: campaign?.quantidade_criadores || 0,
          actualCount: count || 0,
          difference: (campaign?.quantidade_criadores || 0) - (count || 0)
        }
      });

    } else {
      // Verificar sistema geral
      const { data, error } = await supabase.rpc('validate_system_integrity');

      if (error) {
        return NextResponse.json({
          success: false,
          error: `Erro na validação: ${error.message}`
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        validation: data,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno na verificação'
    }, { status: 500 });
  }
}
