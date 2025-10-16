import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/landing-pages/[id]
 * Buscar uma LP específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📋 [LP] Buscando LP:', id);

    const supabase = await createClient();

    const { data: lp, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [LP] Erro ao buscar LP:', error);
      return NextResponse.json(
        { success: false, error: 'Landing page não encontrada' },
        { status: 404 }
      );
    }

    console.log('✅ [LP] LP encontrada:', lp.name);
    return NextResponse.json({
      success: true,
      data: lp
    });

  } catch (error) {
    console.error('❌ [LP] Erro geral:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/landing-pages/[id]
 * Criar uma nova LP (usando slug como ID)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slug } = await params;
    const body = await request.json();

    console.log('📝 [LP] Criando nova LP com slug:', slug);

    const supabase = await createClient();

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Landing page já existe' },
        { status: 400 }
      );
    }

    // Criar nova LP
    const { data: lp, error } = await supabase
      .from('landing_pages')
      .insert({
        slug: slug,
        name: body.name || `LP ${slug}`,
        category: body.category || 'marketing',
        template_id: body.template_id || null,
        status: body.status || 'active',
        is_active: body.is_active !== false,
        variables: body.variables || {},
        config: body.config || {},
        seo: body.seo || {}
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [LP] Erro ao criar LP:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao criar landing page' },
        { status: 500 }
      );
    }

    console.log('✅ [LP] LP criada:', lp.id);

    // Criar primeira versão diretamente
    try {
      const { data: version, error: versionError } = await supabase
        .from('lp_versions')
        .insert({
          lp_id: lp.id,
          version_number: 1,
          snapshot: {
            variables: lp.variables,
            config: lp.config,
            seo: lp.seo,
            products: []
          },
          change_description: 'Versão inicial',
          created_by: body.created_by || null
        });

      if (versionError) {
        console.error('❌ [LP] Erro ao criar versão:', versionError);
      } else {
        console.log('✅ [LP] Versão inicial criada');
      }
    } catch (versionError) {
      console.error('❌ [LP] Erro ao criar versão:', versionError);
      // Não falhar se a versão não for criada, pois a LP já foi criada
    }

    return NextResponse.json({
      success: true,
      message: 'Landing page criada com sucesso',
      data: {
        lp: lp
      }
    });

  } catch (error) {
    console.error('❌ [LP] Erro geral:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/landing-pages/[id]
 * Atualizar uma LP
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('📝 [LP] Atualizando LP:', id);

    const supabase = await createClient();

    const { data: lp, error } = await supabase
      .from('landing_pages')
      .update({
        name: body.name,
        category: body.category,
        template_id: body.template_id,
        status: body.status,
        is_active: body.is_active,
        variables: body.variables,
        config: body.config,
        seo: body.seo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [LP] Erro ao atualizar LP:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar landing page' },
        { status: 500 }
      );
    }

    console.log('✅ [LP] LP atualizada:', lp.name);
    return NextResponse.json({
      success: true,
      data: lp
    });

  } catch (error) {
    console.error('❌ [LP] Erro geral:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/landing-pages/[id]
 * Deletar uma LP
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('🗑️ [LP] Deletando LP:', id);

    const supabase = await createClient();

    const { error } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [LP] Erro ao deletar LP:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar landing page' },
        { status: 500 }
      );
    }

    console.log('✅ [LP] LP deletada');
    return NextResponse.json({
      success: true,
      message: 'Landing page deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ [LP] Erro geral:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}