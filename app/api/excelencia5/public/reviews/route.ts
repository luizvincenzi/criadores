import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// UAZAPI config for WhatsApp alerts
const UAZAPI_URL = process.env.UAZAPI_URL;
const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN;
const UAZAPI_INSTANCE = process.env.UAZAPI_INSTANCE || 'luiz';

// POST /api/excelencia5/public/reviews
// Public endpoint - no auth required
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_slug,
      overall_rating,
      waiter_slug,
      category_ratings,
      comment,
      customer_phone,
      customer_name,
      redirected_to_google,
    } = body;

    // Validate required fields
    if (!business_slug || !overall_rating || overall_rating < 1 || overall_rating > 5) {
      return NextResponse.json(
        { success: false, error: 'business_slug and overall_rating (1-5) are required' },
        { status: 400 }
      );
    }

    // Get IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Basic rate limit: check if same IP submitted in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentReviews } = await supabase
      .from('excelencia5_reviews')
      .select('id')
      .eq('ip_address', ip)
      .gte('created_at', fiveMinutesAgo)
      .limit(1);

    if (recentReviews && recentReviews.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Please wait a few minutes before submitting another review' },
        { status: 429 }
      );
    }

    // Look up subscription
    const { data: subscription, error: subError } = await supabase
      .from('excelencia5_subscriptions')
      .select(`
        id,
        business_id,
        alert_whatsapp,
        alert_contacts,
        alert_threshold,
        custom_categories,
        google_reviews_url,
        businesses (
          name
        )
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_slug', business_slug)
      .eq('is_active', true)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // Look up waiter if slug provided
    let waiterId: string | null = null;
    let waiterName: string | null = null;
    if (waiter_slug) {
      const { data: waiter } = await supabase
        .from('excelencia5_waiters')
        .select('id, name')
        .eq('business_id', subscription.business_id)
        .eq('slug', waiter_slug)
        .eq('is_active', true)
        .single();

      if (waiter) {
        waiterId = waiter.id;
        waiterName = waiter.name;
      }
    }

    // Insert review
    const { data: review, error: reviewError } = await supabase
      .from('excelencia5_reviews')
      .insert({
        organization_id: DEFAULT_ORG_ID,
        subscription_id: subscription.id,
        business_id: subscription.business_id,
        waiter_id: waiterId,
        overall_rating,
        redirected_to_google: redirected_to_google || overall_rating === 5,
        category_ratings: category_ratings || null,
        comment: comment || null,
        customer_phone: customer_phone || null,
        customer_name: customer_name || null,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select('id')
      .single();

    if (reviewError) {
      console.error('[excelencia5/public/reviews] Insert error:', reviewError);
      return NextResponse.json(
        { success: false, error: 'Failed to save review' },
        { status: 500 }
      );
    }

    // Send WhatsApp alert based on threshold (fire and forget)
    const threshold = subscription.alert_threshold ?? 4;
    const alertContacts: Array<{ name: string; phone: string; active: boolean }> = Array.isArray(subscription.alert_contacts) ? subscription.alert_contacts : [];
    const activeContacts = alertContacts.filter(c => c.active && c.phone);
    // Fallback to legacy alert_whatsapp if no contacts configured
    const phonesToAlert = activeContacts.length > 0
      ? activeContacts.map(c => c.phone)
      : (subscription.alert_whatsapp ? [subscription.alert_whatsapp] : []);

    // Build dynamic category labels from custom_categories
    const customCats: Array<{ key: string; label: string }> | null = Array.isArray(subscription.custom_categories) ? subscription.custom_categories : null;

    if (overall_rating <= threshold && phonesToAlert.length > 0 && UAZAPI_URL && UAZAPI_TOKEN) {
      const businessName = (subscription.businesses as unknown as { name: string })?.name || 'Desconhecido';
      const alertPromises = phonesToAlert.map(phone =>
        sendWhatsAppAlert(
          phone,
          businessName,
          waiterName,
          overall_rating,
          category_ratings,
          comment,
          customer_phone,
          customCats
        )
      );
      Promise.all(alertPromises).then(() => {
        supabase
          .from('excelencia5_reviews')
          .update({ alert_sent: true })
          .eq('id', review.id)
          .then(() => {});
      }).catch((err) => {
        console.error('[excelencia5/public/reviews] Alert error:', err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[excelencia5/public/reviews] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// Normalize phone to Brazil format (55XXXXXXXXXXX)
// ============================================
function normalizePhoneBR(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // If already starts with 55 and has 12-13 digits, it's complete
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  // Otherwise prepend 55 (Brazil country code)
  return `55${digits}`;
}

// ============================================
// WhatsApp Alert via UAZAPI
// ============================================
async function sendWhatsAppAlert(
  phone: string,
  businessName: string,
  waiterName: string | null,
  overallRating: number,
  categoryRatings: Record<string, number> | null,
  comment: string | null,
  customerPhone: string | null,
  customCategories: Array<{ key: string; label: string }> | null
): Promise<void> {
  const starEmoji = (n: number) => '⭐'.repeat(n) + '☆'.repeat(5 - n);

  let message = `⚠️ *Nova avaliação crítica - excelencIA5*\n\n`;
  message += `🏢 *${businessName}*\n`;
  if (waiterName) message += `👤 Garçom: ${waiterName}\n`;
  message += `⭐ Nota geral: ${overallRating}/5\n`;

  if (categoryRatings) {
    message += `\n📊 *Detalhes:*\n`;
    // Use custom labels if available, fallback to defaults
    const defaultLabels: Record<string, string> = {
      atendimento: 'Atendimento',
      comida: 'Comida',
      tempo_espera: 'Tempo de espera',
      ambiente: 'Ambiente',
      custo_beneficio: 'Custo-benefício',
    };
    const labelMap: Record<string, string> = customCategories
      ? Object.fromEntries(customCategories.map(c => [c.key, c.label]))
      : defaultLabels;

    for (const [key, rating] of Object.entries(categoryRatings)) {
      if (rating) {
        const label = labelMap[key] || key;
        message += `• ${label}: ${starEmoji(rating as number)}\n`;
      }
    }
  }

  if (comment) {
    message += `\n💬 "${comment}"\n`;
  }

  if (customerPhone) {
    message += `\n📱 Contato: ${customerPhone}\n`;
  }

  message += `\n⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

  const normalizedPhone = normalizePhoneBR(phone);
  await fetch(`${UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token: UAZAPI_TOKEN!,
    },
    body: JSON.stringify({
      number: normalizedPhone,
      text: message,
    }),
  });
}
