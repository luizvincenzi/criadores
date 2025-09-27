import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * 🔍 API PARA VERIFICAR ACESSO DE ESTRATEGISTAS
 * Endpoint usado pelo middleware e componentes para validar permissões
 */

// GET - Verificar se estrategista tem acesso a uma empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strategistUserId = searchParams.get('strategistUserId');
    const businessId = searchParams.get('businessId');
    const permissionType = searchParams.get('permissionType') || 'read';
    const strategistEmail = searchParams.get('strategistEmail');

    console.log('🔍 [CHECK ACCESS] Verificando acesso:', {
      strategistUserId,
      strategistEmail,
      businessId,
      permissionType
    });

    // Validação básica
    if ((!strategistUserId && !strategistEmail) || !businessId) {
      return NextResponse.json(
        { error: 'ID/email do estrategista e ID da empresa são obrigatórios' },
        { status: 400 }
      );
    }

    let finalStrategistId = strategistUserId;

    // Se foi fornecido email, buscar o ID
    if (!strategistUserId && strategistEmail) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', strategistEmail)
        .eq('is_active', true)
        .single();

      if (!user) {
        return NextResponse.json({
          hasAccess: false,
          error: 'Estrategista não encontrado'
        });
      }

      finalStrategistId = user.id;
    }

    // Verificar acesso usando a função do banco
    const { data: hasAccess, error } = await supabase
      .rpc('check_strategist_access', {
        p_strategist_user_id: finalStrategistId,
        p_business_id: businessId,
        p_permission_type: permissionType
      });

    if (error) {
      console.error('❌ Erro ao verificar acesso:', error);
      return NextResponse.json(
        { error: 'Erro ao verificar acesso' },
        { status: 500 }
      );
    }

    // Buscar detalhes do acesso se existir
    let accessDetails = null;
    if (hasAccess) {
      const { data: details } = await supabase
        .from('strategist_business_access')
        .select(`
          id,
          access_level,
          permissions,
          granted_at,
          expires_at,
          notes
        `)
        .eq('strategist_user_id', finalStrategistId)
        .eq('business_id', businessId)
        .eq('is_active', true)
        .single();

      accessDetails = details;
    }

    console.log(`${hasAccess ? '✅' : '❌'} Acesso verificado:`, {
      hasAccess,
      accessLevel: accessDetails?.access_level
    });

    return NextResponse.json({
      hasAccess: !!hasAccess,
      accessDetails,
      strategistUserId: finalStrategistId,
      businessId,
      permissionType
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Verificar múltiplos acessos de uma vez
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategistUserId, strategistEmail, businessIds, permissionType = 'read' } = body;

    console.log('🔍 [CHECK MULTIPLE ACCESS] Verificando múltiplos acessos:', {
      strategistUserId,
      strategistEmail,
      businessIds: businessIds?.length,
      permissionType
    });

    if ((!strategistUserId && !strategistEmail) || !businessIds || !Array.isArray(businessIds)) {
      return NextResponse.json(
        { error: 'ID/email do estrategista e array de IDs de empresas são obrigatórios' },
        { status: 400 }
      );
    }

    let finalStrategistId = strategistUserId;

    // Se foi fornecido email, buscar o ID
    if (!strategistUserId && strategistEmail) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', strategistEmail)
        .eq('is_active', true)
        .single();

      if (!user) {
        return NextResponse.json({
          hasAccess: {},
          error: 'Estrategista não encontrado'
        });
      }

      finalStrategistId = user.id;
    }

    // Buscar todos os acessos do estrategista
    const { data: accesses, error } = await supabase
      .from('strategist_business_access')
      .select(`
        business_id,
        access_level,
        permissions,
        granted_at,
        expires_at,
        is_active
      `)
      .eq('strategist_user_id', finalStrategistId)
      .eq('is_active', true)
      .in('business_id', businessIds);

    if (error) {
      console.error('❌ Erro ao buscar acessos:', error);
      return NextResponse.json(
        { error: 'Erro ao verificar acessos' },
        { status: 500 }
      );
    }

    // Processar resultados
    const accessMap: Record<string, any> = {};
    const now = new Date();

    businessIds.forEach(businessId => {
      const access = accesses?.find(a => a.business_id === businessId);
      
      if (access) {
        // Verificar se não expirou
        const isExpired = access.expires_at && new Date(access.expires_at) < now;
        
        accessMap[businessId] = {
          hasAccess: !isExpired,
          accessLevel: access.access_level,
          permissions: access.permissions,
          grantedAt: access.granted_at,
          expiresAt: access.expires_at,
          isExpired
        };
      } else {
        accessMap[businessId] = {
          hasAccess: false,
          accessLevel: null,
          permissions: null
        };
      }
    });

    console.log('✅ Múltiplos acessos verificados:', {
      total: businessIds.length,
      withAccess: Object.values(accessMap).filter((a: any) => a.hasAccess).length
    });

    return NextResponse.json({
      success: true,
      strategistUserId: finalStrategistId,
      accessMap,
      summary: {
        total: businessIds.length,
        withAccess: Object.values(accessMap).filter((a: any) => a.hasAccess).length,
        expired: Object.values(accessMap).filter((a: any) => a.isExpired).length
      }
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
