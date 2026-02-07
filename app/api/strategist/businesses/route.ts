import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/strategist/businesses
 * Buscar todos os businesses gerenciados por um estrategista
 *
 * Usa 3 fontes com deduplicação:
 *   1. managed_businesses[] enviado via query param (array direto do client)
 *   2. platform_users.managed_businesses[] buscado pelo platform_user_id
 *   3. businesses.strategist_id = strategist_id (fallback legacy via creator_id)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strategistId = searchParams.get('strategist_id'); // creator_id (legacy)
    const platformUserId = searchParams.get('platform_user_id'); // platform_users.id
    const managedBusinessesParam = searchParams.get('managed_businesses'); // JSON array de UUIDs

    // Precisa de pelo menos um identificador
    if (!strategistId && !platformUserId && !managedBusinessesParam) {
      return NextResponse.json(
        { success: false, error: 'Pelo menos um identificador é obrigatório (strategist_id, platform_user_id ou managed_businesses)' },
        { status: 400 }
      );
    }

    console.log('🔍 [API] Buscando businesses do estrategista:', {
      strategistId,
      platformUserId,
      hasManagedBusinesses: !!managedBusinessesParam
    });

    // Coletar IDs de businesses de todas as fontes
    const businessIds = new Set<string>();

    // === FONTE 1: managed_businesses[] enviado diretamente pelo client ===
    if (managedBusinessesParam) {
      try {
        const parsed = JSON.parse(managedBusinessesParam);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => {
            if (id && typeof id === 'string') businessIds.add(id);
          });
          console.log(`📦 [Fonte 1] managed_businesses do client: ${parsed.length} IDs`);
        }
      } catch {
        console.warn('⚠️ [Fonte 1] Falha ao parsear managed_businesses:', managedBusinessesParam);
      }
    }

    // === FONTE 2: Buscar managed_businesses do platform_users pelo ID ===
    if (platformUserId) {
      const { data: platformUser, error: puError } = await supabase
        .from('platform_users')
        .select('managed_businesses')
        .eq('id', platformUserId)
        .single();

      if (puError) {
        console.warn('⚠️ [Fonte 2] Erro ao buscar platform_user:', puError.message);
      } else if (platformUser?.managed_businesses && Array.isArray(platformUser.managed_businesses)) {
        platformUser.managed_businesses.forEach((id: string) => {
          if (id) businessIds.add(id);
        });
        console.log(`📦 [Fonte 2] managed_businesses do platform_user: ${platformUser.managed_businesses.length} IDs`);
      }
    }

    // === FONTE 3 (Legacy): businesses.strategist_id = creator_id ===
    let legacyBusinesses: any[] = [];
    if (strategistId) {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, logo_url, is_active, has_strategist, strategist_id')
        .eq('strategist_id', strategistId)
        .eq('has_strategist', true);

      if (error) {
        console.warn('⚠️ [Fonte 3] Erro ao buscar businesses legacy:', error.message);
      } else if (data) {
        legacyBusinesses = data;
        data.forEach(b => businessIds.add(b.id));
        console.log(`📦 [Fonte 3] businesses legacy (strategist_id): ${data.length}`);
      }
    }

    console.log(`🔢 Total de business IDs únicos: ${businessIds.size}`);

    // Se não encontrou nenhum business, retornar vazio
    if (businessIds.size === 0) {
      return NextResponse.json({
        success: true,
        businesses: []
      });
    }

    // Buscar dados completos dos businesses por ID (para Fontes 1 e 2)
    // Excluir os que já vieram do legacy para evitar consulta duplicada
    const legacyIds = new Set(legacyBusinesses.map(b => b.id));
    const idsToFetch = [...businessIds].filter(id => !legacyIds.has(id));

    let fetchedBusinesses: any[] = [];
    if (idsToFetch.length > 0) {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, logo_url, is_active, has_strategist, strategist_id')
        .in('id', idsToFetch);

      if (error) {
        console.error('❌ Erro ao buscar businesses por ID:', error.message);
      } else if (data) {
        fetchedBusinesses = data;
      }
    }

    // Combinar todos os businesses (deduplicados)
    const allBusinessesMap = new Map<string, any>();
    [...legacyBusinesses, ...fetchedBusinesses].forEach(b => {
      if (!allBusinessesMap.has(b.id)) {
        allBusinessesMap.set(b.id, b);
      }
    });

    const allBusinesses = [...allBusinessesMap.values()].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );

    console.log(`✅ Total de businesses encontrados: ${allBusinesses.length}`);

    // Para cada business, buscar estatísticas de conteúdo
    const businessesWithStats = await Promise.all(
      allBusinesses.map(async (business) => {
        const { data: contents, error: contentsError } = await supabase
          .from('business_content_social')
          .select('id, is_executed')
          .eq('business_id', business.id)
          .is('deleted_at', null);

        if (contentsError) {
          console.error(`❌ Erro ao buscar conteúdos do business ${business.id}:`, contentsError);
          return {
            ...business,
            content_stats: { total: 0, executed: 0, pending: 0 }
          };
        }

        const total = contents?.length || 0;
        const executed = contents?.filter(c => c.is_executed).length || 0;
        const pending = total - executed;

        return {
          ...business,
          content_stats: { total, executed, pending }
        };
      })
    );

    return NextResponse.json({
      success: true,
      businesses: businessesWithStats
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar businesses:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
