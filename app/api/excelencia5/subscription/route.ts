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

// PUT /api/excelencia5/subscription
// Update subscription settings (alert contacts, threshold, categories, google URL)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription_id, alert_contacts, alert_threshold, custom_categories, google_reviews_url } = body;

    if (!subscription_id) {
      return NextResponse.json({ success: false, error: 'subscription_id required' }, { status: 400 });
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (alert_contacts !== undefined) {
      updates.alert_contacts = alert_contacts;
      // Also keep alert_whatsapp in sync with first active contact (backward compat)
      const firstActive = Array.isArray(alert_contacts)
        ? alert_contacts.find((c: { active: boolean }) => c.active)
        : null;
      updates.alert_whatsapp = firstActive?.phone || null;
    }

    if (alert_threshold !== undefined) {
      const threshold = Math.max(1, Math.min(4, Number(alert_threshold)));
      updates.alert_threshold = threshold;
    }

    if (custom_categories !== undefined) {
      // Validate: array of 1-8 items with key, label, emoji
      if (custom_categories !== null) {
        if (!Array.isArray(custom_categories) || custom_categories.length < 1 || custom_categories.length > 8) {
          return NextResponse.json({ success: false, error: 'custom_categories must be array of 1-8 items or null' }, { status: 400 });
        }
        for (const cat of custom_categories) {
          if (!cat.key || !cat.label || !cat.emoji) {
            return NextResponse.json({ success: false, error: 'Each category must have key, label, and emoji' }, { status: 400 });
          }
        }
      }

      // Save history of previous categories before updating
      const { data: current } = await supabase
        .from('excelencia5_subscriptions')
        .select('custom_categories, categories_history')
        .eq('id', subscription_id)
        .single();

      if (current?.custom_categories) {
        const history = Array.isArray(current.categories_history) ? current.categories_history : [];
        history.push({
          categories: current.custom_categories,
          changed_at: new Date().toISOString(),
        });
        updates.categories_history = history;
      }

      updates.custom_categories = custom_categories;
    }

    if (google_reviews_url !== undefined) {
      updates.google_reviews_url = google_reviews_url;
    }

    const { data, error } = await supabase
      .from('excelencia5_subscriptions')
      .update(updates)
      .eq('id', subscription_id)
      .select('*')
      .single();

    if (error) {
      console.error('[excelencia5/subscription] Update error:', error);
      return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[excelencia5/subscription] PUT error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
