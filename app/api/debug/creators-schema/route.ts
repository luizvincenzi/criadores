import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando estrutura da tabela creators...');

    // Buscar alguns criadores para ver a estrutura
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(3);

    if (creatorsError) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return NextResponse.json({
        success: false,
        error: creatorsError.message,
        details: creatorsError
      }, { status: 500 });
    }

    // Analisar estrutura
    const sampleCreator = creators?.[0];
    const columns = sampleCreator ? Object.keys(sampleCreator) : [];

    console.log('📊 Estrutura da tabela creators:', columns);

    return NextResponse.json({
      success: true,
      totalCreators: creators?.length || 0,
      columns: columns,
      sampleData: creators?.slice(0, 2) || [],
      message: `Tabela creators tem ${columns.length} colunas`
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
