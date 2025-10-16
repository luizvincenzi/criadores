import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      strategic_map_id,
      section_type,
      section_order,
      content,
      ai_generated_content,
      is_ai_generated
    } = body;

    if (!strategic_map_id || !section_type) {
      return NextResponse.json(
        { error: 'Missing required fields: strategic_map_id, section_type' },
        { status: 400 }
      );
    }

    // Create or update section
    const { data: section, error } = await supabase
      .from('strategic_map_sections')
      .upsert([
        {
          strategic_map_id,
          section_type,
          section_order: section_order || 0,
          content: content || {},
          ai_generated_content: ai_generated_content || {},
          is_ai_generated: is_ai_generated || false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating section:', error);
      return NextResponse.json(
        { error: 'Error creating/updating section', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ section });
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
    const { id, content, ai_generated_content, is_ai_generated } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Update section
    const { data: section, error } = await supabase
      .from('strategic_map_sections')
      .update({
        ...(content && { content }),
        ...(ai_generated_content && { ai_generated_content }),
        ...(is_ai_generated !== undefined && { is_ai_generated })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating section:', error);
      return NextResponse.json(
        { error: 'Error updating section', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ section });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('id');

    if (!sectionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Delete section
    const { error } = await supabase
      .from('strategic_map_sections')
      .delete()
      .eq('id', sectionId);

    if (error) {
      console.error('Error deleting section:', error);
      return NextResponse.json(
        { error: 'Error deleting section', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
