import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/excelencia5/waiters?business_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'business_id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('excelencia5_waiters')
      .select('id, name, slug, is_active, created_at')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', businessId)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('[excelencia5/waiters] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// POST /api/excelencia5/waiters - Create waiter
export async function POST(request: NextRequest) {
  try {
    const { business_id, name } = await request.json();

    if (!business_id || !name?.trim()) {
      return NextResponse.json({ success: false, error: 'business_id and name required' }, { status: 400 });
    }

    // Get subscription_id
    const { data: sub } = await supabase
      .from('excelencia5_subscriptions')
      .select('id')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', business_id)
      .eq('is_active', true)
      .single();

    if (!sub) {
      return NextResponse.json({ success: false, error: 'No active subscription' }, { status: 404 });
    }

    let slug = slugify(name.trim());

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('excelencia5_waiters')
      .select('id')
      .eq('business_id', business_id)
      .eq('slug', slug)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    const { data, error } = await supabase
      .from('excelencia5_waiters')
      .insert({
        organization_id: DEFAULT_ORG_ID,
        subscription_id: sub.id,
        business_id,
        name: name.trim(),
        slug,
        is_active: true,
      })
      .select('id, name, slug, is_active, created_at')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[excelencia5/waiters POST] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

// DELETE /api/excelencia5/waiters?id=xxx - Deactivate waiter
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('excelencia5_waiters')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[excelencia5/waiters DELETE] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
