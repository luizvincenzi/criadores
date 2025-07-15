import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🚀 API test-env INICIADA');
  
  try {
    // Verificar se as variáveis de ambiente estão definidas
    const envVars = {
      GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID ? 'DEFINIDA' : 'UNDEFINED',
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL ? 'DEFINIDA' : 'UNDEFINED',
      GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID ? 'DEFINIDA' : 'UNDEFINED',
      GOOGLE_PRIVATE_KEY_ID: process.env.GOOGLE_PRIVATE_KEY_ID ? 'DEFINIDA' : 'UNDEFINED',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'DEFINIDA' : 'UNDEFINED',
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? 'DEFINIDA' : 'UNDEFINED',
    };

    console.log('📊 Status das variáveis de ambiente:', envVars);

    // Verificar se a chave privada está bem formatada
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const privateKeyStatus = {
      exists: !!privateKey,
      startsWithBegin: privateKey?.startsWith('-----BEGIN PRIVATE KEY-----'),
      endsWithEnd: privateKey?.endsWith('-----END PRIVATE KEY-----\n'),
      hasNewlines: privateKey?.includes('\\n'),
      length: privateKey?.length || 0
    };

    console.log('🔑 Status da chave privada:', privateKeyStatus);

    return NextResponse.json({
      success: true,
      message: 'Teste de variáveis de ambiente',
      envVars,
      privateKeyStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na API test-env:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
}
