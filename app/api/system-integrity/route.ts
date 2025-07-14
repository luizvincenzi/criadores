import { NextRequest, NextResponse } from 'next/server';
import { 
  getBusinessesData,
  getCreatorsData,
  getCampaignsData,
  createGoogleSheetsClient
} from '@/app/actions/sheetsActions';

/**
 * API para verificar integridade do sistema de IDs únicos
 * GET /api/system-integrity
 */
export async function GET() {
  try {
    console.log('🔍 Iniciando verificação de integridade do sistema...');

    const [businesses, creators] = await Promise.all([
      getBusinessesData(),
      getCreatorsData()
    ]);

    // Verificar campanhas manualmente para ter mais controle
    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    
    let campaigns: any[] = [];
    if (spreadsheetId) {
      const campaignResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Campanhas!A:F'
      });
      
      const campaignValues = campaignResponse.data.values || [];
      campaigns = campaignValues.slice(1).map((row, index) => ({
        rowIndex: index + 2,
        campaignId: row[0] || '',
        business: row[1] || '',
        influenciador: row[2] || '',
        responsavel: row[3] || '',
        status: row[4] || '',
        mes: row[5] || ''
      }));
    }

    // ==========================================
    // ANÁLISE DE BUSINESSES
    // ==========================================
    const businessStats = {
      total: businesses.length,
      withId: businesses.filter(b => b.businessId && b.businessId.trim() !== '').length,
      withoutId: businesses.filter(b => !b.businessId || b.businessId.trim() === '').length,
      idCoverage: 0,
      duplicateIds: [] as string[],
      examples: businesses.slice(0, 3).map(b => ({
        nome: b.nome,
        businessId: b.businessId || 'SEM ID',
        categoria: b.categoria
      }))
    };

    businessStats.idCoverage = businessStats.total > 0 ? 
      Math.round((businessStats.withId / businessStats.total) * 100) : 0;

    // Verificar IDs duplicados
    const businessIds = businesses
      .filter(b => b.businessId && b.businessId.trim() !== '')
      .map(b => b.businessId);
    const uniqueBusinessIds = new Set(businessIds);
    if (businessIds.length !== uniqueBusinessIds.size) {
      businessStats.duplicateIds = businessIds.filter((id, index) => 
        businessIds.indexOf(id) !== index
      );
    }

    // ==========================================
    // ANÁLISE DE CREATORS
    // ==========================================
    const creatorStats = {
      total: creators.length,
      withId: creators.filter(c => c.criadorId && c.criadorId.trim() !== '').length,
      withoutId: creators.filter(c => !c.criadorId || c.criadorId.trim() === '').length,
      idCoverage: 0,
      duplicateIds: [] as string[],
      examples: creators.slice(0, 3).map(c => ({
        nome: c.nome,
        criadorId: c.criadorId || 'SEM ID',
        cidade: c.cidade,
        status: c.status
      }))
    };

    creatorStats.idCoverage = creatorStats.total > 0 ? 
      Math.round((creatorStats.withId / creatorStats.total) * 100) : 0;

    // Verificar IDs duplicados
    const creatorIds = creators
      .filter(c => c.criadorId && c.criadorId.trim() !== '')
      .map(c => c.criadorId);
    const uniqueCreatorIds = new Set(creatorIds);
    if (creatorIds.length !== uniqueCreatorIds.size) {
      creatorStats.duplicateIds = creatorIds.filter((id, index) => 
        creatorIds.indexOf(id) !== index
      );
    }

    // ==========================================
    // ANÁLISE DE CAMPANHAS
    // ==========================================
    const campaignStats = {
      total: campaigns.length,
      withCampaignId: campaigns.filter(c => c.campaignId && c.campaignId.trim() !== '').length,
      withoutCampaignId: campaigns.filter(c => !c.campaignId || c.campaignId.trim() === '').length,
      campaignIdCoverage: 0,
      businessMatches: 0,
      creatorMatches: 0,
      examples: campaigns.slice(0, 3).map(c => ({
        campaignId: c.campaignId || 'SEM ID',
        business: c.business,
        influenciador: c.influenciador,
        status: c.status,
        mes: c.mes
      }))
    };

    campaignStats.campaignIdCoverage = campaignStats.total > 0 ? 
      Math.round((campaignStats.withCampaignId / campaignStats.total) * 100) : 0;

    // Verificar quantas campanhas têm business/creators válidos
    for (const campaign of campaigns) {
      const businessExists = businesses.some(b => 
        b.nome.toLowerCase().trim() === campaign.business.toLowerCase().trim()
      );
      const creatorExists = creators.some(c => 
        c.nome.toLowerCase().trim() === campaign.influenciador.toLowerCase().trim()
      );
      
      if (businessExists) campaignStats.businessMatches++;
      if (creatorExists) campaignStats.creatorMatches++;
    }

    // ==========================================
    // ANÁLISE GERAL DO SISTEMA
    // ==========================================
    const systemHealth = {
      businessIdReady: businessStats.idCoverage >= 90,
      creatorIdReady: creatorStats.idCoverage >= 90,
      campaignIntegrity: campaignStats.total > 0 ? 
        Math.round(((campaignStats.businessMatches + campaignStats.creatorMatches) / (campaignStats.total * 2)) * 100) : 0,
      overallScore: 0,
      status: 'UNKNOWN' as 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL' | 'UNKNOWN',
      recommendations: [] as string[]
    };

    // Calcular score geral
    systemHealth.overallScore = Math.round(
      (businessStats.idCoverage + creatorStats.idCoverage + systemHealth.campaignIntegrity) / 3
    );

    // Determinar status
    if (systemHealth.overallScore >= 90) {
      systemHealth.status = 'EXCELLENT';
    } else if (systemHealth.overallScore >= 75) {
      systemHealth.status = 'GOOD';
    } else if (systemHealth.overallScore >= 50) {
      systemHealth.status = 'NEEDS_IMPROVEMENT';
    } else {
      systemHealth.status = 'CRITICAL';
    }

    // Gerar recomendações
    if (businessStats.idCoverage < 100) {
      systemHealth.recommendations.push(`Migrar ${businessStats.withoutId} businesses sem ID`);
    }
    if (creatorStats.idCoverage < 100) {
      systemHealth.recommendations.push(`Migrar ${creatorStats.withoutId} creators sem ID`);
    }
    if (businessStats.duplicateIds.length > 0) {
      systemHealth.recommendations.push(`Corrigir ${businessStats.duplicateIds.length} business IDs duplicados`);
    }
    if (creatorStats.duplicateIds.length > 0) {
      systemHealth.recommendations.push(`Corrigir ${creatorStats.duplicateIds.length} creator IDs duplicados`);
    }
    if (campaignStats.campaignIdCoverage < 50) {
      systemHealth.recommendations.push('Implementar Campaign IDs únicos');
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      systemHealth,
      details: {
        businesses: businessStats,
        creators: creatorStats,
        campaigns: campaignStats
      },
      summary: {
        totalEntities: businessStats.total + creatorStats.total + campaignStats.total,
        entitiesWithIds: businessStats.withId + creatorStats.withId + campaignStats.withCampaignId,
        systemReady: systemHealth.businessIdReady && systemHealth.creatorIdReady,
        nextSteps: systemHealth.recommendations
      }
    });

  } catch (error) {
    console.error('Erro na verificação de integridade:', error);
    return NextResponse.json({
      success: false,
      error: `Erro na verificação: ${error}`
    });
  }
}
