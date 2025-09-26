import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Construir query
    let query = supabase
      .from('business_quarterly_snapshots')
      .select('*')
      .eq('business_id', businessId)
      .order('year', { ascending: true })
      .order('quarter_number', { ascending: true });

    // Filtros opcionais
    if (year) {
      query = query.eq('year', parseInt(year));
    }
    if (quarter) {
      query = query.eq('quarter', quarter);
    }

    const { data: snapshots, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar snapshots:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar dados trimestrais' },
        { status: 500 }
      );
    }

    // Se não há snapshots, criar um snapshot padrão para o trimestre atual
    if (!snapshots || snapshots.length === 0) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
      const quarterString = `${currentYear}-Q${currentQuarter}`;

      const defaultSnapshot = {
        business_id: businessId,
        quarter: quarterString,
        year: currentYear,
        quarter_number: currentQuarter,
        digital_presence: {
          google: { rating: 0, reviews: 0 },
          instagram: 0,
          facebook: 0,
          tiktok: 0,
          tripadvisor: { rating: 0, rank: 0 }
        },
        kpis: {
          ocupacao: 0,
          ticket: 0,
          margemPorcoes: 0,
          nps: 0,
          ruido: 0
        },
        four_ps_status: {
          produto: 'gray',
          preco: 'gray',
          praca: 'gray',
          promocao: 'gray'
        },
        porter_forces: {
          rivalidade: { score: 5, status: 'yellow' },
          entrantes: { score: 5, status: 'yellow' },
          fornecedores: { score: 5, status: 'yellow' },
          clientes: { score: 5, status: 'yellow' },
          substitutos: { score: 5, status: 'yellow' }
        },
        executive_summary: {
          green: ['Aguardando análise'],
          yellow: ['Dados sendo coletados'],
          red: ['Configuração inicial necessária']
        },
        notes: 'Snapshot criado automaticamente'
      };

      const { data: newSnapshot, error: createError } = await supabase
        .from('business_quarterly_snapshots')
        .insert([defaultSnapshot])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar snapshot padrão:', createError);
        return NextResponse.json(
          { error: 'Erro ao criar dados iniciais' },
          { status: 500 }
        );
      }

      return NextResponse.json([newSnapshot]);
    }

    return NextResponse.json(snapshots);

  } catch (error) {
    console.error('❌ Erro na API de snapshots:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_id,
      quarter,
      year,
      quarter_number,
      digital_presence,
      kpis,
      four_ps_status,
      porter_forces,
      market_diagnosis,
      strategic_positioning,
      action_matrix,
      promo_calendar,
      risk_management,
      executive_summary,
      notes
    } = body;

    // Validações básicas
    if (!business_id || !quarter || !year || !quarter_number) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: business_id, quarter, year, quarter_number' },
        { status: 400 }
      );
    }

    if (quarter_number < 1 || quarter_number > 4) {
      return NextResponse.json(
        { error: 'quarter_number deve estar entre 1 e 4' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Verificar se já existe snapshot para este período
    const { data: existing } = await supabase
      .from('business_quarterly_snapshots')
      .select('id')
      .eq('business_id', business_id)
      .eq('quarter', quarter)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um snapshot para este período' },
        { status: 409 }
      );
    }

    // Criar novo snapshot
    const { data: snapshot, error } = await supabase
      .from('business_quarterly_snapshots')
      .insert([{
        business_id,
        quarter,
        year,
        quarter_number,
        digital_presence: digital_presence || {},
        kpis: kpis || {},
        four_ps_status: four_ps_status || {},
        porter_forces: porter_forces || {},
        market_diagnosis: market_diagnosis || {},
        strategic_positioning: strategic_positioning || {},
        action_matrix: action_matrix || {},
        promo_calendar: promo_calendar || {},
        risk_management: risk_management || {},
        executive_summary: executive_summary || {},
        notes: notes || ''
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar snapshot:', error);
      return NextResponse.json(
        { error: 'Erro ao criar snapshot trimestral' },
        { status: 500 }
      );
    }

    return NextResponse.json(snapshot, { status: 201 });

  } catch (error) {
    console.error('❌ Erro na criação de snapshot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      digital_presence,
      kpis,
      four_ps_status,
      porter_forces,
      market_diagnosis,
      strategic_positioning,
      action_matrix,
      promo_calendar,
      risk_management,
      executive_summary,
      notes
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do snapshot é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Atualizar snapshot
    const { data: snapshot, error } = await supabase
      .from('business_quarterly_snapshots')
      .update({
        digital_presence: digital_presence || {},
        kpis: kpis || {},
        four_ps_status: four_ps_status || {},
        porter_forces: porter_forces || {},
        market_diagnosis: market_diagnosis || {},
        strategic_positioning: strategic_positioning || {},
        action_matrix: action_matrix || {},
        promo_calendar: promo_calendar || {},
        risk_management: risk_management || {},
        executive_summary: executive_summary || {},
        notes: notes || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar snapshot:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar snapshot' },
        { status: 500 }
      );
    }

    if (!snapshot) {
      return NextResponse.json(
        { error: 'Snapshot não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(snapshot);

  } catch (error) {
    console.error('❌ Erro na atualização de snapshot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const snapshotId = searchParams.get('id');
    
    if (!snapshotId) {
      return NextResponse.json(
        { error: 'ID do snapshot é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('business_quarterly_snapshots')
      .delete()
      .eq('id', snapshotId);

    if (error) {
      console.error('❌ Erro ao deletar snapshot:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar snapshot' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Erro na deleção de snapshot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
