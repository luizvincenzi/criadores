import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/excelencia5/public/business?slug=boussole&waiter=joao
// Public endpoint - no auth required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const waiterSlug = searchParams.get('waiter');

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'slug is required' },
        { status: 400 }
      );
    }

    // Look up subscription by business_slug
    const { data: subscription, error: subError } = await supabase
      .from('excelencia5_subscriptions')
      .select(`
        id,
        business_slug,
        google_reviews_url,
        settings,
        custom_categories,
        businesses (
          id,
          name
        )
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_slug', slug)
      .eq('is_active', true)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { success: false, error: 'Business not found or inactive' },
        { status: 404 }
      );
    }

    const business = subscription.businesses as unknown as { id: string; name: string };

    // Look up waiter if slug provided
    let waiterName: string | null = null;
    if (waiterSlug) {
      const { data: waiter } = await supabase
        .from('excelencia5_waiters')
        .select('name')
        .eq('business_id', business.id)
        .eq('slug', waiterSlug)
        .eq('is_active', true)
        .single();

      if (waiter) {
        waiterName = waiter.name;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        business_name: business.name,
        business_slug: subscription.business_slug,
        google_reviews_url: subscription.google_reviews_url,
        waiter_name: waiterName,
        custom_categories: subscription.custom_categories || null,
      },
    });
  } catch (error) {
    console.error('[excelencia5/public/business] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
