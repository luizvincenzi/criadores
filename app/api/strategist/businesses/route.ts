import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/strategist/businesses
 * Buscar todos os businesses gerenciados por um estrategista
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strategistId = searchParams.get('strategist_id');

    if (!strategistId) {
      return NextResponse.json(
        { success: false, error: 'strategist_id é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 [API] Buscando businesses do estrategista:', strategistId);

    // Buscar businesses onde o strategist_id corresponde
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('id, name, is_active, has_strategist, strategist_id')
      .eq('strategist_id', strategistId)
      .eq('has_strategist', true)
      .order('name', { ascending: true });

    if (businessesError) {
      console.error('❌ Erro ao buscar businesses:', businessesError);
      return NextResponse.json(
        { success: false, error: businessesError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Encontrados ${businesses?.length || 0} businesses`);

    // Para cada business, buscar estatísticas de conteúdo
    const businessesWithStats = await Promise.all(
      (businesses || []).map(async (business) => {
        const { data: contents, error: contentsError } = await supabase
          .from('business_content_social')
          .select('id, is_executed')
          .eq('business_id', business.id)
          .is('deleted_at', null);

        if (contentsError) {
          console.error(`❌ Erro ao buscar conteúdos do business ${business.id}:`, contentsError);
          return {
            ...business,
            content_stats: {
              total: 0,
              executed: 0,
              pending: 0
            }
          };
        }

        const total = contents?.length || 0;
        const executed = contents?.filter(c => c.is_executed).length || 0;
        const pending = total - executed;

        return {
          ...business,
          content_stats: {
            total,
            executed,
            pending
          }
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

