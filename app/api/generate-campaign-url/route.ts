import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { businessName, month } = await request.json();

    if (!businessName || !month) {
      return NextResponse.json({ 
        success: false, 
        error: 'Business name and month are required' 
      });
    }

    // Converter nome do business para URL amigável
    const businessSlug = businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();

    // Converter mês para URL amigável
    const monthSlug = month
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();

    // Gerar URL completa
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://criadores.digital';
    const campaignUrl = `${baseUrl}/campaign/${businessSlug}/${monthSlug}`;

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
