import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'Ativo';
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '100');
    const format = searchParams.get('format') || 'legacy'; // 'legacy' ou 'enhanced'

    // 🔒 VALIDAÇÃO DE SEGURANÇA: Verificar role do usuário
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');
    const userBusinessId = request.headers.get('x-user-business-id');

    console.log('👥 [CREATORS] Buscando criadores do Supabase...', {
      status, category, city, limit, format,
      userEmail, userRole, userBusinessId
    });

    // 🔒 PARA BUSINESS_OWNER: Buscar apenas criadores das campanhas da empresa
    if (userRole === 'business_owner' && userBusinessId) {
      console.log('🔒 [CREATORS] Aplicando filtro business_owner - buscando via campanhas');

      // Primeiro, buscar campanhas da empresa
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('business_id', userBusinessId);

      if (!campaigns || campaigns.length === 0) {
        console.log('📭 [CREATORS] Nenhuma campanha encontrada para business:', userBusinessId);
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'Nenhuma campanha encontrada para esta empresa'
        });
      }

      const campaignIds = campaigns.map(c => c.id);

      // Buscar criadores das campanhas
      const { data: campaignCreators } = await supabase
        .from('campaign_creators')
        .select('creator_id')
        .in('campaign_id', campaignIds);

      if (!campaignCreators || campaignCreators.length === 0) {
        console.log('📭 [CREATORS] Nenhum criador encontrado nas campanhas');
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'Nenhum criador encontrado nas campanhas desta empresa'
        });
      }

      const creatorIds = [...new Set(campaignCreators.map(cc => cc.creator_id))];

      // Buscar dados dos criadores
      let query = supabase
        .from('creators')
        .select('*')
        .eq('organization_id', DEFAULT_ORG_ID)
        .in('id', creatorIds)
        .neq('name', '[SLOT VAZIO]')
        .limit(limit);

      // Aplicar filtros
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [CREATORS] Erro ao buscar criadores filtrados:', error);
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }

      console.log(`✅ [CREATORS] ${data?.length || 0} criadores encontrados para business_owner`);

      return NextResponse.json({
        success: true,
        data: data || [],
        count: data?.length || 0,
        businessId: userBusinessId,
        security: {
          filtered_by: 'business_campaigns',
          access_level: 'business_isolated'
        }
      });
    }

    // 🔒 PARA OUTROS ROLES: Query normal com filtros de segurança
    let query = supabase
      .from('creators')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .neq('name', '[SLOT VAZIO]')  // Excluir criador placeholder
      .limit(limit);

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('profile_info->category', category);
    }

    if (city) {
      query = query.eq('profile_info->location->city', city);
    }

    // Ordenar por nome
    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar criadores:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${data.length} criadores encontrados no Supabase`);

    if (format === 'enhanced') {
      // Formato aprimorado para o modal de seleção
      const enhancedCreators = data.map(creator => {
        // Gerar dados mock para demonstração
        const social_media = creator.social_media || {};
        const contact_info = creator.contact_info || {};
        const profile_info = creator.profile_info || {};

        return {
          id: creator.id,
          name: creator.name,
          status: creator.status,
          social_media: {
            instagram: {
              username: creator.name.toLowerCase().replace(/\s+/g, ''),
              followers: Math.floor(Math.random() * 100000) + 10000,
              engagement_rate: Math.random() * 5 + 2,
              verified: Math.random() > 0.7,
              ...social_media.instagram
            },
            tiktok: {
              username: creator.name.toLowerCase().replace(/\s+/g, ''),
              followers: Math.floor(Math.random() * 50000) + 5000,
              ...social_media.tiktok
            },
            ...social_media
          },
          contact_info: {
            whatsapp: contact_info.whatsapp || '554391936400',
            email: contact_info.email || `${creator.name.toLowerCase().replace(/\s+/g, '')}@email.com`,
            ...contact_info
          },
          profile_info: {
            category: profile_info.category || ['Lifestyle', 'Food', 'Fashion', 'Tech', 'Travel'][Math.floor(Math.random() * 5)],
            location: {
              city: profile_info.location?.city || ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília'][Math.floor(Math.random() * 4)],
              state: profile_info.location?.state || 'SP',
              ...profile_info.location
            },
            rates: {
              post: Math.floor(Math.random() * 1000) + 200,
              story: Math.floor(Math.random() * 500) + 100,
              reel: Math.floor(Math.random() * 1500) + 300,
              ...profile_info.rates
            },
            ...profile_info
          },
          performance_metrics: {
            total_campaigns: Math.floor(Math.random() * 20) + 5,
            avg_engagement: Math.random() * 5 + 2,
            completion_rate: Math.floor(Math.random() * 20) + 80,
            rating: Math.random() * 1 + 4
          }
        };
      });

      return NextResponse.json({
        success: true,
        creators: enhancedCreators,
        total: enhancedCreators.length,
        filters: { status, category, city, limit }
      });
    }

    // Formato legado para compatibilidade
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
