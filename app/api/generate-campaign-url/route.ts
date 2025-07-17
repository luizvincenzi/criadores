import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { businessName, month, campaignId } = await request.json();

    if (!businessName || !month) {
      return NextResponse.json({
        success: false,
        error: 'Business name and month are required'
      });
    }

    console.log('🔗 [URL GENERATOR] Gerando URL para:', { businessName, month, campaignId });

    // VALIDAÇÃO: Verificar se a campanha existe antes de gerar URL
    if (campaignId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          month,
          businesses!inner(name)
        `)
        .eq('id', campaignId)
        .single();

      if (error || !campaign) {
        console.error('❌ [URL GENERATOR] Campanha não encontrada:', campaignId);
        return NextResponse.json({
          success: false,
          error: 'Campanha não encontrada para gerar URL'
        });
      }

      console.log('✅ [URL GENERATOR] Campanha validada:', {
        id: campaign.id,
        title: campaign.title,
        business: campaign.businesses.name,
        month: campaign.month
      });
    }

    // Converter nome do business para URL amigável (padronizado)
    const businessSlug = businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
      .trim();

    // Converter mês para URL amigável (manter formato YYYYMM)
    let monthSlug = month;
    if (typeof month === 'string') {
      // Se for formato "jul 25", converter para "202507"
      if (month.includes(' ')) {
        const [monthName, year] = month.split(' ');
        const monthMap: { [key: string]: string } = {
          'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
          'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
          'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
        };
        const monthNum = monthMap[monthName.toLowerCase()] || '01';
        const fullYear = year.length === 2 ? `20${year}` : year;
        monthSlug = `${fullYear}${monthNum}`;
      } else {
        // Limpar caracteres especiais mantendo números
        monthSlug = month.replace(/[^0-9]/g, '');
      }
    }

    // Converter monthSlug (202507) para formato premium (jul-2025)
    let premiumMonthSlug = monthSlug;
    if (monthSlug.length === 6) {
      const year = monthSlug.substring(0, 4);
      const monthNum = parseInt(monthSlug.substring(4, 6));
      const monthNames = ['', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const monthName = monthNames[monthNum] || 'jan';
      premiumMonthSlug = `${monthName}-${year}`;
    }

    console.log('🔗 [URL GENERATOR] Slugs gerados:', { businessSlug, monthSlug, premiumMonthSlug });

    // Gerar URL completa no formato premium: /campaign/business-name-mes-ano
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://criadores.digital';
    const campaignUrl = `${baseUrl}/campaign/${businessSlug}-${premiumMonthSlug}`;

    console.log('✅ [URL GENERATOR] URL gerada:', campaignUrl);

    // TESTE: Verificar se a URL funciona usando a API campaign-seo
    try {
      const seoUrl = `/campaign/${businessSlug}-${premiumMonthSlug}`;
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006'}/api/campaign-seo?url=${encodeURIComponent(seoUrl)}`);
      const testResult = await testResponse.json();

      if (!testResult.success) {
        console.warn('⚠️ [URL GENERATOR] URL gerada não funciona:', {
          url: campaignUrl,
          seoUrl,
          error: testResult.error
        });
      } else {
        console.log('✅ [URL GENERATOR] URL validada com sucesso');
      }
    } catch (testError) {
      console.warn('⚠️ [URL GENERATOR] Erro ao testar URL:', testError);
    }

    // Gerar URL de compartilhamento para WhatsApp
    const shareMessage = encodeURIComponent(
      `🎯 Confira os detalhes da campanha ${businessName} - ${month}!\n\n` +
      `📊 Veja todos os criadores selecionados e informações da campanha:\n` +
      `${campaignUrl}\n\n` +
      `#MarketingDigital #Campanhas #CRMCriadores`
    );

    const whatsappShareUrl = `https://wa.me/?text=${shareMessage}`;

    return NextResponse.json({
      success: true,
      data: {
        campaignUrl,
        businessSlug,
        monthSlug,
        shareUrls: {
          whatsapp: whatsappShareUrl,
          direct: campaignUrl
        },
        metadata: {
          businessName,
          month,
          campaignId: campaignId || null,
          generatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao gerar URL da campanha:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}
