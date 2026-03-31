import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to test UAZAPI connection
// DELETE THIS FILE after debugging is complete
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sendTest = searchParams.get('send') === 'true';
  const testPhone = searchParams.get('phone');

  const UAZAPI_URL = process.env.UAZAPI_URL;
  const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN;
  const UAZAPI_INSTANCE = process.env.UAZAPI_INSTANCE || 'luiz';

  const config = {
    UAZAPI_URL: UAZAPI_URL ? `${UAZAPI_URL.substring(0, 30)}...` : 'NOT SET',
    UAZAPI_TOKEN: UAZAPI_TOKEN ? `${UAZAPI_TOKEN.substring(0, 10)}...` : 'NOT SET',
    UAZAPI_INSTANCE,
    full_endpoint: UAZAPI_URL ? `${UAZAPI_URL}/send/text` : 'N/A',
  };

  // If send=true and phone provided, try to send a test message
  if (sendTest && testPhone && UAZAPI_URL && UAZAPI_TOKEN) {
    try {
      const endpoint = `${UAZAPI_URL}/send/text`;
      const message = `✅ Teste excelencIA5 - WhatsApp funcionando!\n\n⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

      // Normalize phone: add 55 (Brazil) prefix if missing
      const digits = testPhone.replace(/\D/g, '');
      const normalizedPhone = (digits.startsWith('55') && digits.length >= 12) ? digits : `55${digits}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: UAZAPI_TOKEN,
        },
        body: JSON.stringify({ number: normalizedPhone, text: message }),
      });

      const responseText = await res.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = responseText;
      }

      return NextResponse.json({
        config,
        test: {
          endpoint,
          phone: testPhone,
          status: res.status,
          statusText: res.statusText,
          response: responseJson,
        },
      });
    } catch (err) {
      return NextResponse.json({
        config,
        test: {
          error: String(err),
        },
      });
    }
  }

  return NextResponse.json({ config, hint: 'Add ?send=true&phone=5543999999999 to send a test message' });
}
