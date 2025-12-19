import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sectionId } = await params;
    const body = await request.json();
    const { content, change_description } = body;

    if (!sectionId) {
      return NextResponse.json(
        { error: 'Section ID is required' },
        { status: 400 }
      );
    }

    // Update section content
    const { data: section, error } = await supabase
      .from('strategic_map_sections')
      .update({
        content: content || {},
        updated_at: new Date().toISOString(),
        // Optionally track changes
        ...(change_description && {
          change_description,
          last_modified_by: 'user' // You might want to get this from auth
        })
      })
      .eq('id', sectionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating section:', error);
      return NextResponse.json(
        { error: 'Error updating section', details: error.message },
        { status: 500 }
      );
    }

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sectionId } = await params;

    if (!sectionId) {
      return NextResponse.json(
        { error: 'Section ID is required' },
        { status: 400 }
      );
    }

    // Get section
    const { data: section, error } = await supabase
      .from('strategic_map_sections')
      .select('*')
      .eq('id', sectionId)
      .single();

    if (error) {
      console.error('Error fetching section:', error);
      return NextResponse.json(
        { error: 'Error fetching section', details: error.message },
        { status: 500 }
      );
    }

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
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