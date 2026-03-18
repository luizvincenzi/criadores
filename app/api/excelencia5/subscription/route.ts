import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/excelencia5/subscription?business_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'business_id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('excelencia5_subscriptions')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, data: null });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[excelencia5/subscription] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
