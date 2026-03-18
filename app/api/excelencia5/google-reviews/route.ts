import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/excelencia5/google-reviews?business_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'business_id required' }, { status: 400 });
    }

    // 1. Check business_google_maps_profiles for this business
    const { data: profile } = await supabase
      .from('business_google_maps_profiles')
      .select('*')
      .eq('business_id', businessId)
      .single();

    if (!profile) {
      return NextResponse.json({
        success: true,
        data: { has_profile: false, rating: null, reviews_count: null, reviews: [] }
      });
    }

    // 2. Try to get reviews from google_data JSON stored in profile
    const googleData = profile.google_data || {};
    const reviews = googleData.reviews || [];

    // 3. Also check google_maps_reviews table for stored reviews
    const { data: storedReviews } = await supabase
      .from('google_maps_reviews')
      .select('*')
      .eq('profile_id', profile.id)
      .order('publish_time', { ascending: false })
      .limit(20);

    // 4. Also get latest metrics
    const { data: latestMetrics } = await supabase
      .from('google_maps_metrics_history')
      .select('rating, reviews_count, response_rate, positive_sentiment_pct')
      .eq('profile_id', profile.id)
      .order('captured_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        has_profile: true,
        business_name_on_google: profile.business_name_on_google,
        google_maps_url: profile.google_maps_url,
        place_id: profile.place_id,
        rating: latestMetrics?.rating || profile.google_data?.rating || null,
        reviews_count: latestMetrics?.reviews_count || profile.google_data?.userRatingCount || null,
        response_rate: latestMetrics?.response_rate || null,
        positive_sentiment_pct: latestMetrics?.positive_sentiment_pct || null,
        reviews: (storedReviews && storedReviews.length > 0) ? storedReviews : reviews.map((r: any) => ({
          author_name: r.authorAttribution?.displayName || r.author_name || 'Anônimo',
          author_photo_url: r.authorAttribution?.photoUri || r.author_photo_url || null,
          rating: r.rating,
          text: r.text?.text || r.text || '',
          publish_time: r.publishTime || r.publish_time || null,
          relative_time: r.relativePublishTimeDescription || r.relative_time || null,
        })),
      },
    });
  } catch (err) {
    console.error('[excelencia5/google-reviews] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
