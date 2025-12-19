import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/landing-pages/[id]/versions
 * Buscar histórico de versões de uma LP
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lpId } = await params;
    console.log('📋 [LP VERSIONS] Buscando versões da LP:', lpId);

    const supabase = await createClient();

    // Buscar todas as versões
    const { data: versions, error } = await supabase
      .from('lp_versions')
      .select('id, version_number, snapshot, created_at, created_by, change_description')
      .eq('lp_id', lpId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('❌ [LP VERSIONS] Erro ao buscar versões:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar versões' },
        { status: 500 }
      );
    }

    console.log(`✅ [LP VERSIONS] ${versions?.length || 0} versões encontradas`);

    return NextResponse.json({
      success: true,
      data: {
        total: versions?.length || 0,
        versions: versions || []
      }
    });

  } catch (error) {
    console.error('❌ [LP VERSIONS] Erro geral:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/landing-pages/[id]/versions
 * Criar nova versão de uma LP
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lpId } = await params;
    const body = await request.json();
    
    console.log('📝 [LP VERSIONS] Criando nova versão da LP:', lpId);

    const supabase = await createClient();

    // PASSO 1: Verificar se LP existe
    const { data: lp, error: lpError } = await supabase
      .from('landing_pages')
      .select('id, slug, name')
      .eq('id', lpId)
      .single();

    if (lpError || !lp) {
      console.error('❌ [LP VERSIONS] LP não encontrada:', lpError);
      return NextResponse.json(
        { success: false, error: 'Landing page não encontrada' },
        { status: 404 }
      );
    }

    // PASSO 2: Buscar última versão para incrementar version_number
    const { data: lastVersion, error: lastVersionError } = await supabase
      .from('lp_versions')
      .select('version_number')
      .eq('lp_id', lpId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const newVersionNumber = lastVersion ? lastVersion.version_number + 1 : 1;

    console.log(`📊 [LP VERSIONS] Nova versão será: ${newVersionNumber}`);

    // PASSO 3: Criar snapshot
    const snapshot = {
      variables: body.variables || {},
      config: body.config || {},
      seo: body.seo || {},
      products: body.products || []
    };

    // PASSO 4: Inserir nova versão
    const { data: newVersion, error: insertError } = await supabase
      .from('lp_versions')
      .insert({
        lp_id: lpId,
        version_number: newVersionNumber,
        snapshot: snapshot,
        change_description: body.change_description || `Versão ${newVersionNumber}`,
        created_by: body.created_by || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ [LP VERSIONS] Erro ao criar versão:', insertError);
      return NextResponse.json(
        { success: false, error: 'Erro ao criar nova versão' },
        { status: 500 }
      );
    }

    console.log(`✅ [LP VERSIONS] Versão ${newVersionNumber} criada com sucesso!`);

    // PASSO 5: Atualizar tabela principal (opcional, para fallback)
    if (body.updateMainTable !== false) {
      await supabase
        .from('landing_pages')
        .update({
          variables: body.variables,
          config: body.config,
          seo: body.seo,
          updated_at: new Date().toISOString()
        })
        .eq('id', lpId);
    }

    return NextResponse.json({
      success: true,
      message: `Versão ${newVersionNumber} criada com sucesso`,
      data: {
        version: newVersion,
        lp: lp
      }
    });

  } catch (error) {
    console.error('❌ [LP VERSIONS] Erro geral:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/landing-pages/[id]/versions/[versionNumber]
 * Buscar versão específica
 */
export async function getSpecificVersion(
  lpId: string,
  versionNumber: number
) {
  const supabase = await createClient();

  const { data: version, error } = await supabase
    .from('lp_versions')
    .select('*')
    .eq('lp_id', lpId)
    .eq('version_number', versionNumber)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar versão ${versionNumber}: ${error.message}`);
  }

  return version;
}

