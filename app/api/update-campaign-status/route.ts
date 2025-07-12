import { NextRequest, NextResponse } from 'next/server';
import { updateCampaignStatus } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, newStatus, user } = body;

    console.log('🔄 API: Atualizando status da campanha:', { businessName, mes, newStatus, user });

    if (!businessName || !mes || !newStatus) {
      return NextResponse.json({ 
        success: false, 
        error: 'Parâmetros obrigatórios: businessName, mes, newStatus' 
      });
    }

    const result = await updateCampaignStatus(businessName, mes, newStatus, user);

    if (result.success) {
      console.log('✅ API: Status da campanha atualizado com sucesso');
      return NextResponse.json({ 
        success: true, 
        message: `Status atualizado para: ${newStatus}` 
      });
    } else {
      console.error('❌ API: Erro ao atualizar status:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      });
    }

  } catch (error) {
    console.error('❌ API: Erro interno:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
}
