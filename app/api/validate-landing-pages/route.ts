import { NextRequest, NextResponse } from 'next/server';
import { getAllCampaignUrls } from '@/lib/campaign-url-system';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [VALIDATION] Iniciando validação de todas as landing pages...');

    // ETAPA 1: Buscar todas as campanhas
    const allCampaigns = await getAllCampaignUrls();
    console.log(`📊 [VALIDATION] Encontradas ${allCampaigns.length} campanhas para validar`);

    if (allCampaigns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhuma campanha encontrada',
        data: {
          total: 0,
          valid: 0,
          invalid: 0,
          campaigns: []
        }
      });
    }

    // ETAPA 2: Validar cada landing page
    const validationResults = [];
    let validCount = 0;
    let invalidCount = 0;

    for (const campaign of allCampaigns) {
      console.log(`🧪 [VALIDATION] Testando: ${campaign.seoUrl}`);

      try {
        // Testar API SEO
        const apiUrl = `${request.nextUrl.origin}/api/campaign-seo?url=${encodeURIComponent(campaign.seoUrl)}`;
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        const result = await response.json();

        if (result.success) {
          validCount++;
          validationResults.push({
            campaignId: campaign.campaignId,
            businessName: campaign.businessName,
            campaignTitle: campaign.campaignTitle,
            monthYearId: campaign.monthYearId,
            seoUrl: campaign.seoUrl,
            status: 'valid',
            apiResponse: {
              success: true,
              creatorsCount: result.data?.creators?.length || 0,
              businessId: result.data?.business?.id,
              campaignId: result.data?.campaign?.id
            },
            landingPageUrl: `${request.nextUrl.origin}${campaign.seoUrl}`,
            testedAt: new Date().toISOString()
          });

          console.log(`✅ [VALIDATION] Válida: ${campaign.seoUrl}`);
        } else {
          invalidCount++;
          validationResults.push({
            campaignId: campaign.campaignId,
            businessName: campaign.businessName,
            campaignTitle: campaign.campaignTitle,
            monthYearId: campaign.monthYearId,
            seoUrl: campaign.seoUrl,
            status: 'invalid',
            error: result.error || 'Erro desconhecido',
            apiResponse: result,
            landingPageUrl: `${request.nextUrl.origin}${campaign.seoUrl}`,
            testedAt: new Date().toISOString()
          });

          console.log(`❌ [VALIDATION] Inválida: ${campaign.seoUrl} - ${result.error}`);
        }

      } catch (error) {
        invalidCount++;
        validationResults.push({
          campaignId: campaign.campaignId,
          businessName: campaign.businessName,
          campaignTitle: campaign.campaignTitle,
          monthYearId: campaign.monthYearId,
          seoUrl: campaign.seoUrl,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro de conexão',
          landingPageUrl: `${request.nextUrl.origin}${campaign.seoUrl}`,
          testedAt: new Date().toISOString()
        });

        console.log(`💥 [VALIDATION] Erro: ${campaign.seoUrl} - ${error}`);
      }
    }

    // ETAPA 3: Gerar relatório
    const report = {
      total: allCampaigns.length,
      valid: validCount,
      invalid: invalidCount,
      successRate: ((validCount / allCampaigns.length) * 100).toFixed(2),
      campaigns: validationResults,
      summary: {
        validCampaigns: validationResults.filter(c => c.status === 'valid'),
        invalidCampaigns: validationResults.filter(c => c.status === 'invalid' || c.status === 'error'),
        commonErrors: getCommonErrors(validationResults)
      },
      generatedAt: new Date().toISOString()
    };

    console.log(`📋 [VALIDATION] Relatório final: ${validCount}/${allCampaigns.length} válidas (${report.successRate}%)`);

    return NextResponse.json({
      success: true,
      message: `Validação concluída: ${validCount}/${allCampaigns.length} landing pages válidas`,
      data: report
    });

  } catch (error) {
    console.error('❌ [VALIDATION] Erro geral:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor durante validação'
    }, { status: 500 });
  }
}

function getCommonErrors(results: any[]): { error: string; count: number }[] {
  const errorCounts: Record<string, number> = {};

  results
    .filter(r => r.status === 'invalid' || r.status === 'error')
    .forEach(r => {
      const error = r.error || 'Erro desconhecido';
      errorCounts[error] = (errorCounts[error] || 0) + 1;
    });

  return Object.entries(errorCounts)
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count);
}


