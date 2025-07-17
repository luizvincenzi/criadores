import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    console.log('👥 Buscando criadores do Supabase...');

    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .neq('name', '[SLOT VAZIO]')  // Excluir criador placeholder
      .order('name');

    if (error) {
      console.error('❌ Erro ao buscar criadores:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${data.length} criadores encontrados no Supabase`);

    // Mapear para formato compatível com o frontend atual
    const creators = data.map(creator => ({
      id: creator.id,
      nome: creator.name,
      cidade: creator.profile_info?.location?.city || '',
      seguidores: creator.social_media?.instagram?.followers || 0,
      instagram: creator.social_media?.instagram?.username || '',
      whatsapp: creator.contact_info?.whatsapp || '',
      biografia: creator.profile_info?.biography || '',
      categoria: creator.profile_info?.category || '',
      status: creator.status
    }));

    return NextResponse.json({
      success: true,
      data: creators,
      count: creators.length,
      source: 'supabase'
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

export async function POST(request: NextRequest) {
  try {
    console.log('➕ Adicionando novo criador no Supabase...');

    const body = await request.json();
    console.log('📋 Dados recebidos:', body);

    // Preparar dados para inserção
    const creatorData = {
      organization_id: DEFAULT_ORG_ID,
      name: body.name,
      contact_info: body.contact_info || {},
      profile_info: body.profile_info || {},
      social_media: body.social_media || {},
      status: body.status || 'Ativo',
      notes: body.notes || '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📤 Inserindo criador:', creatorData);

    const { data, error } = await supabase
      .from('creators')
      .insert([creatorData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir criador:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Criador adicionado com sucesso:', data);

    // Mapear para formato compatível
    const mappedCreator = {
      id: data.id,
      nome: data.name,
      cidade: data.profile_info?.location?.city || '',
      seguidores: data.social_media?.instagram?.followers || 0,
      instagram: data.social_media?.instagram?.username || '',
      whatsapp: data.contact_info?.whatsapp || '',
      biografia: data.profile_info?.biography || '',
      categoria: data.profile_info?.category || '',
      status: data.status
    };

    return NextResponse.json({
      success: true,
      data: mappedCreator,
      message: 'Criador adicionado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno ao adicionar criador:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Atualizando criador no Supabase...');

    const body = await request.json();
    console.log('📋 Dados recebidos para atualização:', body);

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID do criador é obrigatório' },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    const updateData = {
      name: body.name,
      contact_info: body.contact_info || {},
      profile_info: body.profile_info || {},
      social_media: body.social_media || {},
      status: body.status,
      notes: body.notes || '',
      updated_at: new Date().toISOString()
    };

    console.log('📤 Atualizando criador ID:', body.id);

    const { data, error } = await supabase
      .from('creators')
      .update(updateData)
      .eq('id', body.id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar criador:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Criador atualizado com sucesso:', data);

    // Mapear para formato compatível
    const mappedCreator = {
      id: data.id,
      nome: data.name,
      cidade: data.profile_info?.location?.city || '',
      seguidores: data.social_media?.instagram?.followers || 0,
      instagram: data.social_media?.instagram?.username || '',
      whatsapp: data.contact_info?.whatsapp || '',
      biografia: data.profile_info?.biography || '',
      categoria: data.profile_info?.category || '',
      status: data.status
    };

    return NextResponse.json({
      success: true,
      data: mappedCreator,
      message: 'Criador atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno ao atualizar criador:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
