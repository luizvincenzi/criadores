import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/excelencia5/analytics?business_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'business_id required' }, { status: 400 });
    }

    const { data: reviews } = await supabase
      .from('excelencia5_reviews')
      .select('overall_rating, redirected_to_google, category_ratings, waiter_id')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', businessId);

    const allReviews = reviews || [];
    const total = allReviews.length;

    // Star distribution
    const starDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    let googleRedirects = 0;
    const catSums: Record<string, { sum: number; count: number }> = {};
    const waiterStats: Record<string, { total: number; sum: number; fiveStars: number }> = {};

    for (const r of allReviews) {
      starDist[r.overall_rating] = (starDist[r.overall_rating] || 0) + 1;
      ratingSum += r.overall_rating;
      if (r.redirected_to_google) googleRedirects++;

      if (r.category_ratings) {
        for (const [key, val] of Object.entries(r.category_ratings as Record<string, number>)) {
          if (!catSums[key]) catSums[key] = { sum: 0, count: 0 };
          catSums[key].sum += val;
          catSums[key].count += 1;
        }
      }

      if (r.waiter_id) {
        if (!waiterStats[r.waiter_id]) waiterStats[r.waiter_id] = { total: 0, sum: 0, fiveStars: 0 };
        waiterStats[r.waiter_id].total += 1;
        waiterStats[r.waiter_id].sum += r.overall_rating;
        if (r.overall_rating === 5) waiterStats[r.waiter_id].fiveStars += 1;
      }
    }

    // Category averages
    const categoryAverages: Record<string, number> = {};
    for (const [key, val] of Object.entries(catSums)) {
      categoryAverages[key] = val.count > 0 ? val.sum / val.count : 0;
    }

    // Waiter ranking
    const { data: waiters } = await supabase
      .from('excelencia5_waiters')
      .select('id, name')
      .eq('business_id', businessId);

    const waiterMap = new Map((waiters || []).map(w => [w.id, w.name]));
    const waiterRanking = Object.entries(waiterStats)
      .map(([id, stats]) => ({
        waiter_id: id,
        name: waiterMap.get(id) || 'Desconhecido',
        total_reviews: stats.total,
        avg_rating: stats.total > 0 ? stats.sum / stats.total : 0,
        five_star_count: stats.fiveStars,
      }))
      .sort((a, b) => b.avg_rating - a.avg_rating);

    return NextResponse.json({
      success: true,
      data: {
        total_reviews: total,
        avg_rating: total > 0 ? ratingSum / total : 0,
        star_distribution: starDist,
        google_redirects: googleRedirects,
        category_averages: categoryAverages,
        waiter_ranking: waiterRanking,
      },
    });
  } catch (err) {
    console.error('[excelencia5/analytics] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
