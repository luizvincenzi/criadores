import { createClient } from '../lib/supabase/server';

async function generateInstagramVideosReport() {
  const supabase = await createClient();

  console.log('📊 GERANDO RELATÓRIO: Vídeos do Instagram - Setembro 2025');
  console.log('=' .repeat(80));

  try {
    // Buscar todos os vídeos do Instagram de setembro 2025
    const { data: videos, error } = await supabase
      .from('campaigns_creator')
      .select(`
        video_instagram_link,
        video_tiktok_link,
        created_at,
        campaign_month,
        campaign_id,
        creator_id,
        status,
        creators (
          name,
          instagram_username
        ),
        campaigns (
          business_name,
          month_year
        )
      `)
      .eq('campaign_month', '2025-09')
      .not('video_instagram_link', 'is', null)
      .not('video_instagram_link', 'eq', '')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro na consulta:', error);
      return;
    }

    // Estatísticas gerais
    const totalVideos = videos?.length || 0;
    const videosPorDia = videos?.reduce((acc: any, video) => {
      const dia = new Date(video.created_at).toISOString().split('T')[0];
      acc[dia] = (acc[dia] || 0) + 1;
      return acc;
    }, {}) || {};

    const videosPorCriador = videos?.reduce((acc: any, video) => {
      const nomeCriador = video.creators?.name || 'Não informado';
      acc[nomeCriador] = (acc[nomeCriador] || 0) + 1;
      return acc;
    }, {}) || {};

    const videosPorEmpresa = videos?.reduce((acc: any, video) => {
      const nomeEmpresa = video.campaigns?.business_name || 'Não informado';
      acc[nomeEmpresa] = (acc[nomeEmpresa] || 0) + 1;
      return acc;
    }, {}) || {};

    // Relatório principal
    console.log('🎬 RELATÓRIO DE VÍDEOS DO INSTAGRAM - SETEMBRO 2025');
    console.log('=' .repeat(80));
    console.log(`📅 Período: Setembro 2025`);
    console.log(`📊 Total de vídeos: ${totalVideos}`);
    console.log(`📈 Média por dia: ${(totalVideos / 30).toFixed(1)} vídeos`);
    console.log('');

    // Distribuição por dia
    console.log('📅 DISTRIBUIÇÃO POR DIA:');
    console.log('-'.repeat(40));
    Object.entries(videosPorDia)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([dia, quantidade]) => {
        const dataFormatada = new Date(dia).toLocaleDateString('pt-BR');
        console.log(`${dataFormatada}: ${quantidade} vídeo(s)`);
      });
    console.log('');

    // Top criadores
    console.log('👥 TOP CRIADORES:');
    console.log('-'.repeat(40));
    Object.entries(videosPorCriador)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .forEach(([criador, quantidade]) => {
        console.log(`${criador}: ${quantidade} vídeo(s)`);
      });
    console.log('');

    // Top empresas
    console.log('🏢 TOP EMPRESAS:');
    console.log('-'.repeat(40));
    Object.entries(videosPorEmpresa)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .forEach(([empresa, quantidade]) => {
        console.log(`${empresa}: ${quantidade} vídeo(s)`);
      });
    console.log('');

    // Lista completa de links
    console.log('🔗 LISTA COMPLETA DE LINKS DO INSTAGRAM:');
    console.log('='.repeat(80));

    videos?.forEach((video, index) => {
      const numero = (index + 1).toString().padStart(3, '0');
      const data = new Date(video.created_at).toLocaleString('pt-BR');
      const criador = video.creators?.name || 'N/A';
      const empresa = video.campaigns?.business_name || 'N/A';
      const status = video.status || 'N/A';

      console.log(`${numero}. ${video.video_instagram_link}`);
      console.log(`    📅 Data: ${data}`);
      console.log(`    👤 Criador: ${criador}`);
      console.log(`    🏢 Empresa: ${empresa}`);
      console.log(`    📊 Status: ${status}`);
      console.log('');
    });

    // Salvar relatório em arquivo
    const fs = require('fs');
    const reportContent = `
RELATÓRIO DE VÍDEOS DO INSTAGRAM - SETEMBRO 2025
${'='.repeat(60)}

ESTATÍSTICAS GERAIS:
- Total de vídeos: ${totalVideos}
- Período: Setembro 2025
- Média diária: ${(totalVideos / 30).toFixed(1)} vídeos

LISTA DE LINKS:
${videos?.map((video, index) =>
  `${index + 1}. ${video.video_instagram_link} (${new Date(video.created_at).toLocaleDateString('pt-BR')})`
).join('\n')}

DISTRIBUIÇÃO POR DIA:
${Object.entries(videosPorDia)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([dia, qtd]) => `${new Date(dia).toLocaleDateString('pt-BR')}: ${qtd} vídeo(s)`)
  .join('\n')}
`;

    fs.writeFileSync('relatorio-instagram-setembro-2025.txt', reportContent);
    console.log('💾 Relatório salvo em: relatorio-instagram-setembro-2025.txt');

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
  }
}

generateInstagramVideosReport().catch(console.error);