import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Em produção, obter user_id do contexto de autenticação
    const userId = '00000000-0000-0000-0000-000000000001'; // Substituir pela lógica real

    // Buscar assinaturas do usuário (simulado por enquanto)
    // Em produção, isso viria de uma tabela de subscriptions/payments
    const mockSubscriptions = [
      {
        id: 'sub_1',
        plan_name: 'Profissional',
        status: 'active',
        amount: 299,
        currency: 'BRL',
        billing_cycle: 'monthly',
        next_billing: '2025-11-15',
        created_at: '2025-10-15T12:00:00Z',
        payment_method: 'Cartão de Crédito',
        payment_history: [
          {
            id: 'pay_1',
            amount: 299,
            currency: 'BRL',
            status: 'paid',
            date: '2025-10-15T12:00:00Z',
            description: 'Assinatura Mensal - Profissional'
          },
          {
            id: 'pay_2',
            amount: 299,
            currency: 'BRL',
            status: 'paid',
            date: '2025-09-15T12:00:00Z',
            description: 'Assinatura Mensal - Profissional'
          }
        ]
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        current_subscription: mockSubscriptions[0],
        payment_history: mockSubscriptions[0].payment_history,
        next_billing: mockSubscriptions[0].next_billing
      }
    });

  } catch (error) {
    console.error('Erro na API de assinaturas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}