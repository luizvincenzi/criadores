import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/excelencia5/reviews?business_id=xxx&limit=50
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'business_id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('excelencia5_reviews')
      .select('id, overall_rating, redirected_to_google, category_ratings, comment, customer_phone, customer_name, waiter_id, alert_sent, created_at')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('[excelencia5/reviews] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
