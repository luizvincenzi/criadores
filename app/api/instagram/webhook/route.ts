import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.INSTAGRAM_WEBHOOK_SECRET || 'criadores_webhook_token_2024';

// Verificar assinatura do webhook
function verifySignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// GET - Verificação do webhook pelo Meta
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('🔍 Instagram Webhook: Verificação', { mode, token });

  // Verificar token de verificação
  if (mode === 'subscribe' && token === WEBHOOK_SECRET) {
    console.log('✅ Instagram Webhook: Verificação bem-sucedida');
    return new NextResponse(challenge);
  } else {
    console.error('❌ Instagram Webhook: Token de verificação inválido');
    return NextResponse.json(
      { error: 'Token de verificação inválido' },
      { status: 403 }
    );
  }
}

// POST - Receber atualizações do Instagram
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    console.log('📱 Instagram Webhook: Recebendo atualização');

    // Verificar assinatura (em produção)
    if (process.env.NODE_ENV === 'production' && signature) {
      const isValid = verifySignature(body, signature.replace('sha256=', ''));
      if (!isValid) {
        console.error('❌ Instagram Webhook: Assinatura inválida');
        return NextResponse.json(
          { error: 'Assinatura inválida' },
          { status: 403 }
        );
      }
    }

    const data = JSON.parse(body);
    console.log('📊 Instagram Webhook: Dados recebidos', data);

    // Processar diferentes tipos de eventos
    if (data.object === 'instagram') {
      for (const entry of data.entry || []) {
        await processInstagramEntry(entry);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Instagram Webhook Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Processar entrada do Instagram
async function processInstagramEntry(entry: any) {
  const supabase = createClient();
  
  try {
    console.log('🔄 Processando entrada Instagram:', entry.id);

    // Processar mudanças em posts
    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field === 'media') {
          await processMediaChange(change, entry.id);
        }
      }
    }

    // Processar mensagens (se aplicável)
    if (entry.messaging) {
      for (const message of entry.messaging) {
        await processMessage(message);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao processar entrada:', error);
  }
}

// Processar mudanças em mídia
async function processMediaChange(change: any, userId: string) {
  const supabase = createClient();
  
  try {
    console.log('📸 Processando mudança em mídia:', change);

    // Buscar conexão do usuário
    const { data: connection } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('instagram_user_id', userId)
      .eq('is_active', true)
      .single();

    if (!connection) {
      console.log('⚠️ Conexão não encontrada para usuário:', userId);
      return;
    }

    // Aqui você pode implementar lógica específica baseada no tipo de mudança
    // Por exemplo: novo post, post editado, post deletado, etc.
    
    if (change.value) {
      // Trigger sincronização automática
      await triggerSync(connection.business_id);
    }

  } catch (error) {
    console.error('❌ Erro ao processar mudança em mídia:', error);
  }
}

// Processar mensagens
async function processMessage(message: any) {
  try {
    console.log('💬 Processando mensagem:', message);
    // Implementar lógica de mensagens se necessário
  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error);
  }
}

// Trigger sincronização automática
async function triggerSync(businessId: string) {
  try {
    console.log('🔄 Triggering sync para business:', businessId);
    
    // Aqui você pode implementar uma fila de jobs ou chamar diretamente a sincronização
    // Por exemplo, fazer uma chamada para /api/instagram/sync
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ businessId }),
    });

    if (response.ok) {
      console.log('✅ Sincronização automática iniciada');
    } else {
      console.error('❌ Erro ao iniciar sincronização automática');
    }

  } catch (error) {
    console.error('❌ Erro ao trigger sync:', error);
  }
}
