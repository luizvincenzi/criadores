import { NextRequest, NextResponse } from 'next/server';
import { updateCampaignStatusViaAuditLog } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, oldStatus, newStatus, user } = body;

    console.log('🔄 API: Atualizando status da campanha via audit_log:', { 
      businessName, 
      mes, 
      oldStatus, 
      newStatus, 
      user 
    });

    if (!businessName || !mes || !newStatus) {
      return NextResponse.json({ 
        success: false, 
        error: 'Parâmetros obrigatórios: businessName, mes, newStatus' 
      });
    }

    const result = await updateCampaignStatusViaAuditLog(
      businessName, 
      mes, 
      oldStatus || 'Reunião Briefing', 
      newStatus, 
      user || 'Sistema'
    );

    if (result.success) {
      console.log('✅ API: Status da campanha atualizado via audit_log');
      return NextResponse.json({ 
        success: true, 
        message: `Status atualizado para: ${newStatus}`,
        auditLog: true
      });
    } else {
      console.error('❌ API: Erro ao atualizar status via audit_log:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      });
    }

  } catch (error) {
    console.error('❌ API: Erro interno ao atualizar via audit_log:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
}
