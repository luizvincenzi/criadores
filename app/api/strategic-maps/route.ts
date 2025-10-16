import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const quarter = searchParams.get('quarter');

    if (!businessId || !quarter) {
      return NextResponse.json(
        { error: 'Missing required parameters: business_id and quarter' },
        { status: 400 }
      );
    }

    // Get the strategic map
    const { data: strategicMap, error: mapError } = await supabase
      .from('strategic_maps')
      .select('*')
      .eq('business_id', businessId)
      .eq('quarter', quarter)
      .single();

    if (mapError && mapError.code !== 'PGRST116') {
      console.error('Error fetching strategic map:', mapError);
      return NextResponse.json(
        { error: 'Error fetching strategic map' },
        { status: 500 }
      );
    }

    // If no map found, return empty response
    if (!strategicMap) {
      return NextResponse.json({
        strategic_map: null,
        sections: []
      });
    }

    // Get all sections for this map
    const { data: sections, error: sectionsError } = await supabase
      .from('strategic_map_sections')
      .select('*')
      .eq('strategic_map_id', strategicMap.id)
      .order('section_order', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return NextResponse.json(
        { error: 'Error fetching sections' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      strategic_map: strategicMap,
      sections: sections || []
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
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
      organization_id,
      input_data
    } = body;

    if (!business_id || !quarter || !year || !quarter_number || !organization_id) {
      return NextResponse.json(
        {
          error: 'Missing required fields: business_id, quarter, year, quarter_number, organization_id'
        },
        { status: 400 }
      );
    }

    // Create new strategic map
    const { data: newMap, error: createError } = await supabase
      .from('strategic_maps')
      .insert([
        {
          business_id,
          quarter,
          year,
          quarter_number,
          organization_id,
          input_data: input_data || {},
          status: 'draft',
          generation_progress: 0
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating strategic map:', createError);
      return NextResponse.json(
        { error: 'Error creating strategic map', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      strategic_map: newMap,
      sections: []
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, generation_progress, input_data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Update strategic map
    const { data: updatedMap, error: updateError } = await supabase
      .from('strategic_maps')
      .update({
        ...(status && { status }),
        ...(generation_progress !== undefined && { generation_progress }),
        ...(input_data && { input_data })
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating strategic map:', updateError);
      return NextResponse.json(
        { error: 'Error updating strategic map', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ strategic_map: updatedMap });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
