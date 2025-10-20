import { createClient } from '../lib/supabase/server';

async function getInstagramVideosSetembro2025() {
  const supabase = await createClient();

  console.log('🔍 Buscando vídeos do Instagram de setembro de 2025...');

  const { data: videos, error } = await supabase
    .from('campaigns_creator')
    .select('video_instagram_link, created_at, campaign_month')
    .not('video_instagram_link', 'is', null)
    .eq('campaign_month', '2025-09')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log(`✅ Encontrados ${videos?.length || 0} vídeos do Instagram em setembro de 2025:`);
  console.log('================================================');

  videos?.forEach((video, index) => {
    console.log(`${index + 1}. ${video.video_instagram_link}`);
    console.log(`   Criado em: ${new Date(video.created_at).toLocaleString('pt-BR')}`);
    console.log('');
  });

  console.log('================================================');
  console.log('📋 Lista apenas dos links:');
  console.log('');

  videos?.forEach((video, index) => {
    console.log(video.video_instagram_link);
  });

  // Salvar em arquivo também
  if (videos && videos.length > 0) {
    const fs = require('fs');
    const output = videos.map(v => v.video_instagram_link).join('\n');
    fs.writeFileSync('instagram-videos-setembro-2025.txt', output);
    console.log('💾 Links salvos em: instagram-videos-setembro-2025.txt');
  }
}

getInstagramVideosSetembro2025().catch(console.error);