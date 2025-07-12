import { NextRequest, NextResponse } from 'next/server';
import { addToAuditLog } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API /api/update-business-status chamada');
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);

    // Validação básica
    if (!body.businessName || !body.oldStatus || !body.newStatus) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: businessName, oldStatus, newStatus' },
        { status: 400 }
      );
    }

    // Validar se os status são válidos
    const validStages = ['Reunião Briefing', 'Agendamentos', 'Entrega Final'];
    if (!validStages.includes(body.oldStatus) || !validStages.includes(body.newStatus)) {
      return NextResponse.json(
        { success: false, error: `Status inválido. Permitidos: ${validStages.join(', ')}` },
        { status: 400 }
      );
    }

    // Se o status não mudou, não faz nada
    if (body.oldStatus === body.newStatus) {
      return NextResponse.json({
        success: true,
        message: 'Status não alterado',
        data: {
          businessName: body.businessName,
          status: body.newStatus
        }
      });
    }

    console.log(`📊 Atualizando status: "${body.businessName}" de "${body.oldStatus}" para "${body.newStatus}"`);

    // Preparar dados para o audit log
    // Estrutura: Timestamp | Action | Entity_Type | Entity_Name | Old_Value_Status | New_Value_Status | User | Details
    const auditData = [
      new Date().toISOString(),                    // A = Timestamp
      'business_stage_changed',                    // B = Action
      'business',                                  // C = Entity_Type
      body.businessName,                           // D = Entity_Name
      body.oldStatus,                              // E = Old_Value_Status
      body.newStatus,                              // F = New_Value_Status
      body.user || 'Sistema',                     // G = User
      `Status alterado via modal de detalhes: ${body.oldStatus} → ${body.newStatus}` // H = Details
    ];

    console.log('📋 Dados do audit log:', auditData);

    // Adicionar ao audit log
    await addToAuditLog(auditData);

    console.log('✅ Status atualizado com sucesso no audit log!');

    return NextResponse.json({
      success: true,
      message: 'Status atualizado com sucesso!',
      data: {
        businessName: body.businessName,
        oldStatus: body.oldStatus,
        newStatus: body.newStatus,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Erro na API update-business-status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
