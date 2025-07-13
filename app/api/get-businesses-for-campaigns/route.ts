import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Buscando businesses disponíveis para campanhas...');

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

    // Buscar dados da aba business
    const businessResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'business!A:Q' // Buscar todas as colunas necessárias
    });

    const businessValues = businessResponse.data.values || [];
    if (businessValues.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum business encontrado na planilha'
      });
    }

    const businessHeaders = businessValues[0];
    console.log('📋 Headers da aba business:', businessHeaders);

    // Estrutura esperada da aba business:
    // A=Nome, B=Categoria, C=Plano atual, D=Comercial, E=Nome Responsável, F=Cidade, 
    // G=WhatsApp Responsável, H=Prospecção, I=Responsável, J=Instagram, K=Grupo WhatsApp criado,
    // L=Contrato assinado e enviado, M=Data assinatura do contrato, N=Contrato válido até, 
    // O=Related files, P=Notes, Q=Quantidade de criadores (se existir)

    const businesses = [];
    for (let i = 1; i < businessValues.length; i++) {
      const row = businessValues[i];
      
      const business = {
        id: i,
        nome: row[0] || '', // A = Nome
        categoria: row[1] || '', // B = Categoria
        planoAtual: row[2] || '', // C = Plano atual
        comercial: row[3] || '', // D = Comercial
        nomeResponsavel: row[4] || '', // E = Nome Responsável
        cidade: row[5] || '', // F = Cidade
        whatsappResponsavel: row[6] || '', // G = WhatsApp Responsável
        prospeccao: row[7] || '', // H = Prospecção
        responsavel: row[8] || '', // I = Responsável
        instagram: row[9] || '', // J = Instagram
        grupoWhatsapp: row[10] || '', // K = Grupo WhatsApp criado
        contratoAssinado: row[11] || '', // L = Contrato assinado e enviado
        dataAssinatura: row[12] || '', // M = Data assinatura do contrato
        contratoValidoAte: row[13] || '', // N = Contrato válido até
        relatedFiles: row[14] || '', // O = Related files
        notes: row[15] || '', // P = Notes
        quantidadeCriadores: row[16] || '1' // Q = Quantidade de criadores (padrão 1)
      };

      // Só incluir businesses com nome preenchido
      if (business.nome.trim()) {
        businesses.push(business);
      }
    }

    console.log(`✅ ${businesses.length} businesses encontrados`);

    // Buscar quantidades de criadores da aba campanhas (para validação)
    const campaignsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A:F'
    });

    const campaignsValues = campaignsResponse.data.values || [];
    const creatorCounts: { [key: string]: number } = {};

    // Contar criadores por business nas campanhas existentes
    for (let i = 1; i < campaignsValues.length; i++) {
      const row = campaignsValues[i];
      const nomeCampanha = row[1] || ''; // B = Nome Campanha
      
      if (nomeCampanha.trim()) {
        creatorCounts[nomeCampanha] = (creatorCounts[nomeCampanha] || 0) + 1;
      }
    }

    // Atualizar quantidades baseado nas campanhas existentes
    businesses.forEach(business => {
      const existingCount = creatorCounts[business.nome];
      if (existingCount) {
        business.quantidadeCriadores = existingCount.toString();
      }
    });

    return NextResponse.json({
      success: true,
      businesses,
      totalBusinesses: businesses.length,
      creatorCounts
    });

  } catch (error) {
    console.error('❌ Erro ao buscar businesses:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
