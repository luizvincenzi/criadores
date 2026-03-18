import { NextRequest, NextResponse } from 'next/server';

// GET /api/excelencia5/qrcode?business_slug=xxx&waiter_slug=yyy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessSlug = searchParams.get('business_slug');
    const waiterSlug = searchParams.get('waiter_slug');

    if (!businessSlug) {
      return NextResponse.json({ success: false, error: 'business_slug required' }, { status: 400 });
    }

    let url = `https://criadores.app/avaliar/${businessSlug}`;
    if (waiterSlug) url += `?garcom=${waiterSlug}`;

    const QRCode = (await import('qrcode')).default;
    const qrcodeDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    return NextResponse.json({
      success: true,
      data: { qrcode_data_url: qrcodeDataUrl, url },
    });
  } catch (err) {
    console.error('[excelencia5/qrcode] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
