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

    // 4. Also get latest metrics (with star distribution)
    const { data: latestMetrics } = await supabase
      .from('google_maps_metrics_history')
      .select('rating, reviews_count, response_rate, positive_sentiment_pct, negative_sentiment_pct, reviews_5_star, reviews_4_star, reviews_3_star, reviews_2_star, reviews_1_star, captured_at')
      .eq('profile_id', profile.id)
      .order('captured_at', { ascending: false })
      .limit(1)
      .single();

    // 5. Get first metric for growth calculation
    const { data: firstMetric } = await supabase
      .from('google_maps_metrics_history')
      .select('rating, reviews_count, captured_at')
      .eq('profile_id', profile.id)
      .order('captured_at', { ascending: true })
      .limit(1)
      .single();

    let growth = null;
    if (firstMetric && latestMetrics) {
      const reviewsGained = (latestMetrics.reviews_count || 0) - (firstMetric.reviews_count || 0);
      const ratingChange = (latestMetrics.rating || 0) - (firstMetric.rating || 0);
      const daysSinceStart = Math.floor(
        (new Date(latestMetrics.captured_at).getTime() - new Date(firstMetric.captured_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      growth = {
        reviews_gained: reviewsGained,
        rating_change: ratingChange,
        days_monitored: daysSinceStart,
        avg_reviews_per_month: daysSinceStart > 0 ? (reviewsGained / daysSinceStart) * 30 : 0,
      };
    }

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
        negative_sentiment_pct: latestMetrics?.negative_sentiment_pct || null,
        star_distribution: latestMetrics ? {
          reviews_5_star: latestMetrics.reviews_5_star || 0,
          reviews_4_star: latestMetrics.reviews_4_star || 0,
          reviews_3_star: latestMetrics.reviews_3_star || 0,
          reviews_2_star: latestMetrics.reviews_2_star || 0,
          reviews_1_star: latestMetrics.reviews_1_star || 0,
        } : null,
        growth,
        last_sync_at: latestMetrics?.captured_at || null,
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
