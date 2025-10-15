import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function mergeDuplicatePietra() {
  console.log('🔍 Analisando duplicação da Pietra...\n');

  try {
    // 1. Buscar todas as Pietras
    console.log('1️⃣ Buscando todas as entradas de Pietra...');
    const { data: pietras, error: pietrasError } = await supabase
      .from('creators')
      .select('*')
      .ilike('name', '%pietra%mantovani%')
      .order('created_at', { ascending: true });

    if (pietrasError) {
      console.error('❌ Erro ao buscar Pietras:', pietrasError);
      return;
    }

    if (!pietras || pietras.length === 0) {
      console.log('❌ Nenhuma Pietra encontrada');
      return;
    }

    console.log(`✅ Encontradas ${pietras.length} entradas de Pietra:\n`);
    
    pietras.forEach((p, index) => {
      console.log(`${index + 1}. ID: ${p.id}`);
      console.log(`   Nome: ${p.name}`);
      console.log(`   Slug: ${p.slug}`);
      console.log(`   Email: ${p.platform_email || 'N/A'}`);
      console.log(`   Status Acesso: ${p.platform_access_status}`);
      console.log(`   Criado em: ${p.created_at}`);
      console.log(`   Instagram: ${p.social_media?.instagram?.username || 'N/A'}`);
      console.log(`   Followers: ${p.social_media?.instagram?.followers || 0}`);
      console.log('');
    });

    // 2. Verificar campanhas de cada Pietra
    console.log('2️⃣ Verificando campanhas de cada Pietra...\n');
    
    const pietraWithCampaigns: any[] = [];
    
    for (const pietra of pietras) {
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaign_creators')
        .select('id, campaign_id, status')
        .eq('creator_id', pietra.id);

      if (campaignsError) {
        console.error(`❌ Erro ao buscar campanhas de ${pietra.name}:`, campaignsError);
        continue;
      }

      const campaignCount = campaigns?.length || 0;
      console.log(`   ${pietra.name} (${pietra.id}): ${campaignCount} campanhas`);
      
      pietraWithCampaigns.push({
        ...pietra,
        campaign_count: campaignCount
      });
    }

    // 3. Identificar Pietra principal (com mais campanhas ou mais antiga)
    console.log('\n3️⃣ Identificando Pietra principal...\n');
    
    const pietraOriginal = pietraWithCampaigns[0]; // Mais antiga (548f643b...)
    const pietraDuplicada = pietraWithCampaigns[1]; // Mais recente (975c1933...)

    console.log('📊 Análise:');
    console.log(`\n✅ PIETRA ORIGINAL (manter):`);
    console.log(`   ID: ${pietraOriginal.id}`);
    console.log(`   Nome: ${pietraOriginal.name}`);
    console.log(`   Criado em: ${pietraOriginal.created_at}`);
    console.log(`   Campanhas: ${pietraOriginal.campaign_count}`);
    console.log(`   Instagram: ${pietraOriginal.social_media?.instagram?.username}`);
    console.log(`   Followers: ${pietraOriginal.social_media?.instagram?.followers}`);
    console.log(`   Email plataforma: ${pietraOriginal.platform_email || 'N/A'}`);
    console.log(`   Status acesso: ${pietraOriginal.platform_access_status}`);

    console.log(`\n❌ PIETRA DUPLICADA (deletar):`);
    console.log(`   ID: ${pietraDuplicada.id}`);
    console.log(`   Nome: ${pietraDuplicada.name}`);
    console.log(`   Criado em: ${pietraDuplicada.created_at}`);
    console.log(`   Campanhas: ${pietraDuplicada.campaign_count}`);
    console.log(`   Email plataforma: ${pietraDuplicada.platform_email || 'N/A'}`);
    console.log(`   Status acesso: ${pietraDuplicada.platform_access_status}`);

    // 4. PRIMEIRO: Atualizar platform_users para apontar para Pietra original
    console.log('\n4️⃣ Atualizando platform_users...\n');

    // Verificar se existe entrada em platform_users para a duplicada
    const { data: platformUser, error: platformUserError } = await supabase
      .from('platform_users')
      .select('*')
      .eq('creator_id', pietraDuplicada.id)
      .maybeSingle();

    if (platformUser) {
      console.log('📝 Atualizando platform_users para apontar para Pietra original...');
      console.log(`   Email: ${platformUser.email}`);
      console.log(`   Creator ID atual: ${platformUser.creator_id}`);
      console.log(`   Novo Creator ID: ${pietraOriginal.id}`);

      const { error: updatePlatformError } = await supabase
        .from('platform_users')
        .update({
          creator_id: pietraOriginal.id,
          full_name: pietraOriginal.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', platformUser.id);

      if (updatePlatformError) {
        console.error('❌ Erro ao atualizar platform_users:', updatePlatformError);
        return;
      } else {
        console.log('✅ platform_users atualizado com sucesso!');
      }
    } else {
      console.log('ℹ️ Nenhuma entrada em platform_users para a duplicada');

      // Verificar se existe para a original
      const { data: originalPlatformUser } = await supabase
        .from('platform_users')
        .select('*')
        .eq('creator_id', pietraOriginal.id)
        .maybeSingle();

      if (!originalPlatformUser) {
        console.log('⚠️ Criando entrada em platform_users para Pietra original...');

        const { error: createError } = await supabase
          .from('platform_users')
          .insert({
            organization_id: '00000000-0000-0000-0000-000000000001',
            email: 'pietramantovani98@gmail.com',
            full_name: pietraOriginal.name,
            roles: ['creator', 'marketing_strategist'],
            creator_id: pietraOriginal.id,
            is_active: true
          });

        if (createError) {
          console.error('❌ Erro ao criar platform_users:', createError);
          return;
        }
        console.log('✅ platform_users criado com sucesso!');
      }
    }

    // 5. DEPOIS: Migrar dados de acesso da duplicada para a original
    console.log('\n5️⃣ Migrando dados de acesso para Pietra original...\n');

    const updateData = {
      platform_email: 'pietramantovani98@gmail.com',
      platform_access_status: 'granted',
      platform_access_granted_at: new Date().toISOString(),
      platform_access_granted_by: '00000000-0000-0000-0000-000000000001',
      platform_roles: ['creator', 'marketing_strategist'],
      // Manter os dados melhores (followers, etc)
      social_media: {
        instagram: {
          username: '@pietramantovani',
          followers: 21534,
          verified: false,
          engagement_rate: 0
        },
        tiktok: {
          username: '',
          followers: 0
        },
        youtube: {
          channel: '',
          subscribers: 0
        }
      },
      contact_info: {
        email: 'pietramantovani98@gmail.com',
        whatsapp: '43 98807-2689',
        phone: '',
        preferred_contact: 'email'
      }
    };

    const { data: updated, error: updateError } = await supabase
      .from('creators')
      .update(updateData)
      .eq('id', pietraOriginal.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar Pietra original:', updateError);
      return;
    }

    console.log('✅ Pietra original atualizada com sucesso!');
    console.log(`   Email: ${updated.platform_email}`);
    console.log(`   Status: ${updated.platform_access_status}`);
    console.log(`   Roles: ${updated.platform_roles?.join(', ')}`)

    // 6. Deletar Pietra duplicada
    console.log('\n6️⃣ Deletando Pietra duplicada...\n');

    const { error: deleteError } = await supabase
      .from('creators')
      .delete()
      .eq('id', pietraDuplicada.id);

    if (deleteError) {
      console.error('❌ Erro ao deletar Pietra duplicada:', deleteError);
      return;
    }

    console.log('✅ Pietra duplicada deletada com sucesso!');

    // 7. Verificação final
    console.log('\n7️⃣ Verificação final...\n');

    const { data: finalPietra, error: finalError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', pietraOriginal.id)
      .single();

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError);
      return;
    }

    console.log('✅ PIETRA FINAL (única):');
    console.log(`   ID: ${finalPietra.id}`);
    console.log(`   Nome: ${finalPietra.name}`);
    console.log(`   Email: ${finalPietra.platform_email}`);
    console.log(`   Status: ${finalPietra.platform_access_status}`);
    console.log(`   Roles: ${finalPietra.platform_roles?.join(', ')}`);
    console.log(`   Instagram: ${finalPietra.social_media?.instagram?.username}`);
    console.log(`   Followers: ${finalPietra.social_media?.instagram?.followers}`);

    // Verificar platform_users
    const { data: finalPlatformUser, error: finalPlatformError } = await supabase
      .from('platform_users')
      .select('*')
      .eq('email', 'pietramantovani98@gmail.com')
      .maybeSingle();

    if (finalPlatformUser) {
      console.log('\n✅ platform_users:');
      console.log(`   ID: ${finalPlatformUser.id}`);
      console.log(`   Email: ${finalPlatformUser.email}`);
      console.log(`   Creator ID: ${finalPlatformUser.creator_id}`);
      console.log(`   Roles: ${finalPlatformUser.roles?.join(', ')}`);
    }

    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Testar login com pietramantovani98@gmail.com');
    console.log('2. Verificar se as campanhas aparecem');
    console.log('3. Associar Pietra às campanhas existentes (se necessário)');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

mergeDuplicatePietra();

