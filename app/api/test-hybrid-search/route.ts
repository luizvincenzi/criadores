import { NextRequest, NextResponse } from 'next/server';
import { 
  findBusinessHybrid,
  findCreatorHybrid,
  findCreatorInCampaigns,
  generateBusinessId,
  generateCreatorId
} from '@/app/actions/sheetsActions';

/**
 * API para testar o sistema híbrido de busca por IDs
 * POST /api/test-hybrid-search
 */
export async function POST(request: NextRequest) {
  try {
    const { action, businessName, creatorName, mes } = await request.json();
    
    const results: any = {
      timestamp: new Date().toISOString(),
      action,
      results: {}
    };

    switch (action) {
      case 'test_business_search':
        console.log(`🔍 Testando busca híbrida para business: "${businessName}"`);
        
        const businessResult = await findBusinessHybrid(businessName);
        results.results = {
          businessName,
          found: !!businessResult,
          businessId: businessResult?.data[17], // Coluna R
          businessData: businessResult ? {
            nome: businessResult.data[0],
            categoria: businessResult.data[1],
            cidade: businessResult.data[5],
            businessId: businessResult.data[17]
          } : null
        };
        break;

      case 'test_creator_search':
        console.log(`🔍 Testando busca híbrida para criador: "${creatorName}"`);
        
        const creatorResult = await findCreatorHybrid(creatorName);
        results.results = {
          creatorName,
          found: !!creatorResult,
          creatorId: creatorResult?.data[21], // Coluna V
          creatorData: creatorResult ? {
            nome: creatorResult.data[0],
            status: creatorResult.data[1],
            cidade: creatorResult.data[3],
            instagram: creatorResult.data[6],
            criadorId: creatorResult.data[21]
          } : null
        };
        break;

      case 'test_campaign_search':
        console.log(`🔍 Testando busca de campanha: Business="${businessName}", Creator="${creatorName}", Mês="${mes}"`);
        
        const campaignResult = await findCreatorInCampaigns(businessName, mes, creatorName);
        results.results = {
          businessName,
          creatorName,
          mes,
          found: campaignResult?.found || false,
          rowIndex: campaignResult?.rowIndex || -1,
          campaignData: campaignResult?.data || null
        };
        break;

      case 'generate_ids':
        console.log(`🆔 Gerando IDs de exemplo`);
        
        results.results = {
          businessId: await generateBusinessId(businessName || 'Exemplo Business'),
          creatorId: await generateCreatorId(creatorName || 'Exemplo Creator'),
          explanation: {
            businessFormat: 'bus_[timestamp]_[random]_[nome_normalizado]',
            creatorFormat: 'crt_[timestamp]_[random]_[nome_normalizado]'
          }
        };
        break;

      case 'full_test':
        console.log(`🧪 Teste completo do sistema híbrido`);
        
        // Teste 1: Buscar business
        const fullBusinessResult = await findBusinessHybrid(businessName);
        
        // Teste 2: Buscar creator
        const fullCreatorResult = await findCreatorHybrid(creatorName);
        
        // Teste 3: Buscar campanha
        const fullCampaignResult = await findCreatorInCampaigns(businessName, mes, creatorName);
        
        results.results = {
          business: {
            searched: businessName,
            found: !!fullBusinessResult,
            hasId: !!fullBusinessResult?.data[17],
            businessId: fullBusinessResult?.data[17] || null
          },
          creator: {
            searched: creatorName,
            found: !!fullCreatorResult,
            hasId: !!fullCreatorResult?.data[21],
            creatorId: fullCreatorResult?.data[21] || null
          },
          campaign: {
            searched: { businessName, creatorName, mes },
            found: fullCampaignResult?.found || false,
            rowIndex: fullCampaignResult?.rowIndex || -1
          },
          summary: {
            businessWithId: !!fullBusinessResult?.data[17],
            creatorWithId: !!fullCreatorResult?.data[21],
            campaignFound: fullCampaignResult?.found || false,
            systemReady: !!fullBusinessResult?.data[17] && !!fullCreatorResult?.data[21]
          }
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação inválida. Use: test_business_search, test_creator_search, test_campaign_search, generate_ids, ou full_test'
        });
    }

    return NextResponse.json({
      success: true,
      message: `Teste "${action}" executado com sucesso`,
      ...results
    });

  } catch (error) {
    console.error('Erro no teste híbrido:', error);
    return NextResponse.json({
      success: false,
      error: `Erro no teste: ${error}`
    });
  }
}

/**
 * GET para listar ações disponíveis
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API de teste do sistema híbrido de busca',
    actions: [
      {
        action: 'test_business_search',
        description: 'Testa busca híbrida de business por nome',
        params: { businessName: 'string' }
      },
      {
        action: 'test_creator_search', 
        description: 'Testa busca híbrida de criador por nome',
        params: { creatorName: 'string' }
      },
      {
        action: 'test_campaign_search',
        description: 'Testa busca de campanha com sistema híbrido',
        params: { businessName: 'string', creatorName: 'string', mes: 'string' }
      },
      {
        action: 'generate_ids',
        description: 'Gera IDs de exemplo para business e creator',
        params: { businessName: 'string (opcional)', creatorName: 'string (opcional)' }
      },
      {
        action: 'full_test',
        description: 'Executa teste completo do sistema híbrido',
        params: { businessName: 'string', creatorName: 'string', mes: 'string' }
      }
    ],
    examples: [
      {
        method: 'POST',
        body: {
          action: 'full_test',
          businessName: 'Govinda',
          creatorName: 'Heloa canali',
          mes: 'Jul'
        }
      }
    ]
  });
}
