import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function POST(request: NextRequest) {
  try {
    const { businessData, campaignName, selectedMonth, quantidadeCriadores, user } = await request.json();
    
    console.log('➕ Adicionando nova campanha:', {
      businessName: businessData.nome,
      campaignName,
      selectedMonth,
      quantidadeCriadores
    });

    console.log('🔍 DEBUG: businessData completo:', businessData);

    if (!businessData || !campaignName || !selectedMonth || !quantidadeCriadores) {
      return NextResponse.json({
        success: false,
        error: 'Dados obrigatórios: business, nome da campanha, mês e quantidade de criadores'
      });
    }

    // 🆔 OBTER BUSINESS_ID
    console.log('🔄 Obtendo business_id...');
    let businessId = businessData.business_id;

    if (!businessId) {
      // Buscar business_id usando o nome
      const businessResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/get-business-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: businessData.nome })
      });
      const businessResult = await businessResponse.json();

      if (!businessResult.success) {
        return NextResponse.json({
          success: false,
          error: `Business "${businessData.nome}" não encontrado: ${businessResult.error}`
        });
      }
      businessId = businessResult.businessId;
    }

    console.log('✅ Business ID obtido:', businessId);

    // Configurar autenticação
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: 'crmcriadores',
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: 'crm-criadores@crmcriadores.iam.gserviceaccount.com',
        client_id: '113660609859941708871',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/service_accounts/v1/metadata/x509/crm-criadores%40crmcriadores.iam.gserviceaccount.com'
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Gerar data completa (dia 1 + mês + ano)
    const currentYear = new Date().getFullYear();
    const monthNumber = getMonthNumber(selectedMonth);
    const fullDate = `${currentYear}-${monthNumber.toString().padStart(2, '0')}-01`;
    const displayDate = `${selectedMonth} ${currentYear}`;

    console.log('📅 Data gerada:', { fullDate, displayDate });

    // Preparar linhas para inserção
    const rows = [];
    const timestamp = Date.now();
    
    for (let i = 0; i < parseInt(quantidadeCriadores); i++) {
      // Gerar Campaign_ID único para cada linha
      const businessSlug = businessData.nome.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
      const monthSlug = selectedMonth.toLowerCase().replace(/[^a-z0-9]/g, '');
      const campaignId = `camp_${timestamp}_${i + 1}_${businessSlug}_${monthSlug}_slot${i + 1}`;

      const row = [
        campaignId, // A = Campaign_ID
        campaignName || businessData.nome, // B = Nome Campanha
        '', // C = Influenciador (será preenchido posteriormente)
        businessData.responsavel || businessData.nomeResponsavel || 'Sistema', // D = Responsável
        'Reunião Briefing', // E = Status (padrão inicial)
        displayDate, // F = Mês (formato: "Janeiro 2025")
        fullDate, // G = FIM (data completa: "2025-01-01")
        'Pendente', // H = Briefing completo enviado para o influenciador?
        '', // I = Data e hora Visita
        '', // J = Quantidade de convidados
        'Pendente', // K = Visita Confirmado
        '', // L = Data e hora da Postagem
        'Pendente', // M = Vídeo aprovado?
        'Não', // N = Video/Reels postado?
        '', // O = Link Video Instagram
        '', // P = Notas
        '', // Q = Arquivo
        '', // R = Avaliação Restaurante
        '', // S = Avaliação Influenciador
        'Ativo', // T = Status do Calendário
        '', // U = Column 22
        '', // V = ID do Evento
        '', // W = Formato
        '', // X = Perfil do criador
        '', // Y = Objetivo
        '', // Z = Comunicação secundária
        '', // AA = Datas e horários para gravação
        '', // AB = O que precisa ser falado no vídeo
        '', // AC = Promoção CTA
        '', // AD = Column 31
        '', // AE = Objetivo 1
        '' // AF = Column 32
      ];

      rows.push(row);
    }

    console.log(`📊 Preparando ${rows.length} linhas para inserção`);

    // Inserir todas as linhas na planilha
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A:AF',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows
      }
    });

    // Registrar no audit log
    const auditLogData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'detailed_logs!A:Z'
    });

    const auditRows = auditLogData.data.values || [];
    const nextAuditRow = auditRows.length + 1;

    const auditEntry = [
      `detailed_${timestamp}_campaign_created`, // ID
      new Date().toISOString(), // Timestamp
      'campaign_created', // Action
      'campaign', // Entity_Type
      rows[0][0], // Entity_ID (primeiro Campaign_ID)
      `${campaignName}-${displayDate}`, // Entity_Name
      user || 'sistema', // User_ID
      user || 'sistema', // User_Name
      businessId, // Business_Context
      displayDate, // Campaign_Context
      `${quantidadeCriadores} slots criados`, // Creator_Context
      'campanha', // Field_Changed
      '', // Old_Value
      campaignName, // New_Value
      `Nova campanha criada com ${quantidadeCriadores} slots`, // Change_Reason
      'success', // Validation_Status
      '', // Session_ID
      '', // IP_Address
      '', // User_Agent
      JSON.stringify({
        businessData: {
          nome: businessData.nome,
          categoria: businessData.categoria,
          responsavel: businessData.responsavel
        },
        campaignDetails: {
          name: campaignName,
          month: selectedMonth,
          fullDate,
          displayDate,
          quantidadeCriadores
        },
        campaignIds: rows.map(row => row[0])
      }) // Details
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'detailed_logs!A:Z',
      valueInputOption: 'RAW',
      requestBody: {
        values: [auditEntry]
      }
    });

    console.log('✅ Campanha criada com sucesso!');

    return NextResponse.json({
      success: true,
      message: `Campanha "${campaignName}" criada com sucesso!`,
      data: {
        campaignName,
        businessName: businessData.nome,
        month: displayDate,
        fullDate,
        quantidadeCriadores: parseInt(quantidadeCriadores),
        campaignIds: rows.map(row => row[0]),
        rowsCreated: rows.length,
        auditLogEntry: auditEntry[0]
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar campanha:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao criar campanha'
    });
  }
}

// Função auxiliar para converter nome do mês para número
function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'janeiro': 1, 'jan': 1,
    'fevereiro': 2, 'fev': 2,
    'março': 3, 'mar': 3,
    'abril': 4, 'abr': 4,
    'maio': 5, 'mai': 5,
    'junho': 6, 'jun': 6,
    'julho': 7, 'jul': 7,
    'agosto': 8, 'ago': 8,
    'setembro': 9, 'set': 9,
    'outubro': 10, 'out': 10,
    'novembro': 11, 'nov': 11,
    'dezembro': 12, 'dez': 12
  };

  return months[monthName.toLowerCase()] || 1;
}
