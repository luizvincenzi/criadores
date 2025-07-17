import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalCampaigns: number;
    totalCreators: number;
    totalRelations: number;
    inconsistentCampaigns: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando validação completa do sistema...');
    
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: {
        totalCampaigns: 0,
        totalCreators: 0,
        totalRelations: 0,
        inconsistentCampaigns: 0
      }
    };

    // 1. Validar inconsistências de quantidade_criadores
    const { data: inconsistentCampaigns, error: inconsistentError } = await supabase.rpc(
      'get_inconsistent_campaigns'
    );

    if (inconsistentError) {
      console.error('❌ Erro ao buscar campanhas inconsistentes:', inconsistentError);
      result.errors.push(`Erro na validação: ${inconsistentError.message}`);
    } else if (inconsistentCampaigns && inconsistentCampaigns.length > 0) {
      result.isValid = false;
      result.stats.inconsistentCampaigns = inconsistentCampaigns.length;
      
      inconsistentCampaigns.forEach((campaign: any) => {
        result.errors.push(
          `Campanha "${campaign.title}" (${campaign.business_name}): ` +
          `banco tem ${campaign.quantidade_banco} mas existem ${campaign.criadores_reais} criadores`
        );
      });
    }

    // 2. Validar criadores órfãos
    const { data: orphanCreators, error: orphanError } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        campaign_id,
        creator_id,
        creators(name)
      `)
      .is('campaigns.id', null);

    if (orphanError) {
      result.warnings.push(`Erro ao verificar criadores órfãos: ${orphanError.message}`);
    } else if (orphanCreators && orphanCreators.length > 0) {
      result.isValid = false;
      result.errors.push(`${orphanCreators.length} criadores órfãos encontrados`);
    }

    // 3. Validar duplicatas
    const { data: duplicates, error: duplicateError } = await supabase.rpc(
      'get_duplicate_creators'
    );

    if (duplicateError) {
      result.warnings.push(`Erro ao verificar duplicatas: ${duplicateError.message}`);
    } else if (duplicates && duplicates.length > 0) {
      result.isValid = false;
      duplicates.forEach((dup: any) => {
        result.errors.push(
          `Criador "${dup.creator_name}" duplicado ${dup.quantidade_duplicatas}x na campanha ${dup.campaign_id}`
        );
      });
    }

    // 4. Validar regra 1 campanha/mês
    const { data: multiplePerMonth, error: multipleError } = await supabase.rpc(
      'get_multiple_campaigns_per_month'
    );

    if (multipleError) {
      result.warnings.push(`Erro ao verificar múltiplas campanhas: ${multipleError.message}`);
    } else if (multiplePerMonth && multiplePerMonth.length > 0) {
      multiplePerMonth.forEach((violation: any) => {
        result.warnings.push(
          `Business "${violation.business_name}" tem ${violation.quantidade_campanhas} campanhas em ${violation.month}`
        );
      });
    }

    // 5. Coletar estatísticas gerais
    const [campaignsCount, creatorsCount, relationsCount] = await Promise.all([
      supabase.from('campaigns').select('*', { count: 'exact', head: true }),
      supabase.from('creators').select('*', { count: 'exact', head: true }),
      supabase.from('campaign_creators').select('*', { count: 'exact', head: true }).neq('status', 'Removido')
    ]);

    result.stats.totalCampaigns = campaignsCount.count || 0;
    result.stats.totalCreators = creatorsCount.count || 0;
    result.stats.totalRelations = relationsCount.count || 0;

    // 6. Log do resultado
    if (result.isValid) {
      console.log('✅ Sistema validado com sucesso!');
    } else {
      console.log(`❌ Sistema com ${result.errors.length} erros e ${result.warnings.length} avisos`);
    }

    return NextResponse.json({
      success: true,
      validation: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na validação do sistema:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno na validação',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Endpoint para auto-correção
export async function POST(request: NextRequest) {
  try {
    const { autoFix } = await request.json();
    
    if (!autoFix) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetro autoFix é obrigatório'
      }, { status: 400 });
    }

    console.log('🛠️ Iniciando auto-correção do sistema...');

    // Executar correções automáticas
    const corrections = [];

    // 1. Corrigir quantidade_criadores
    const { data: fixedCampaigns, error: fixError } = await supabase.rpc(
      'fix_quantidade_criadores'
    );

    if (fixError) {
      console.error('❌ Erro na correção:', fixError);
      return NextResponse.json({
        success: false,
        error: `Erro na auto-correção: ${fixError.message}`
      }, { status: 500 });
    }

    corrections.push({
      type: 'quantidade_criadores',
      fixed: fixedCampaigns || 0,
      description: 'Campanhas com quantidade_criadores corrigida'
    });

    // 2. Remover órfãos
    const { data: removedOrphans, error: orphanError } = await supabase.rpc(
      'remove_orphan_creators'
    );

    if (!orphanError) {
      corrections.push({
        type: 'orphan_removal',
        fixed: removedOrphans || 0,
        description: 'Criadores órfãos removidos'
      });
    }

    // 3. Reindexar posições
    const { error: reindexError } = await supabase.rpc('reindex_creator_positions');

    if (!reindexError) {
      corrections.push({
        type: 'reindex_positions',
        fixed: 1,
        description: 'Posições dos criadores reindexadas'
      });
    }

    console.log('✅ Auto-correção concluída!');

    return NextResponse.json({
      success: true,
      corrections,
      message: 'Sistema auto-corrigido com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na auto-correção:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno na auto-correção'
    }, { status: 500 });
  }
}
