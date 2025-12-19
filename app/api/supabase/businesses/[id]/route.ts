import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;

    console.log('🔍 [Supabase API] Buscando business por ID:', businessId);

    // Buscar business
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (error || !business) {
      console.log('❌ [Supabase API] Business não encontrado:', businessId);
      return NextResponse.json(
        { success: false, error: 'Business não encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ [Supabase API] Business encontrado:', business.name);

    return NextResponse.json({
      success: true,
      business
    });

  } catch (error) {
    console.error('❌ [Supabase API] Erro ao buscar business:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}