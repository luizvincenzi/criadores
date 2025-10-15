import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Usar service role key para ter permissões completas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function mergeDuplicatePietra() {
  console.log('🔍 Mesclando Pietras duplicadas...\n');

  const PIETRA_ORIGINAL_ID = '548f643b-0e0d-4a34-8582-d682c0000000'; // Com 8 campanhas
  const PIETRA_DUPLICADA_ID = '975c1933-cfa0-4b3a-9660-f14259ec4b26'; // Sem campanhas

  try {
    console.log('1️⃣ Atualizando platform_users...\n');
    
    // Atualizar platform_users para apontar para Pietra original
    const { data: platformUser, error: updatePlatformError } = await supabase
      .from('platform_users')
      .update({
        creator_id: PIETRA_ORIGINAL_ID,
        full_name: 'PIETRA MANTOVANI',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'pietramantovani98@gmail.com')
      .select()
      .single();

    if (updatePlatformError) {
      console.error('❌ Erro ao atualizar platform_users:', updatePlatformError);
      return;
    }

    console.log('✅ platform_users atualizado:');
    console.log(`   Email: ${platformUser.email}`);
    console.log(`   Creator ID: ${platformUser.creator_id}`);
    console.log(`   Roles: ${platformUser.roles?.join(', ')}`);

    console.log('\n2️⃣ Atualizando Pietra original (sem trigger)...\n');

    // Atualizar diretamente via SQL para evitar trigger
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE creators 
        SET 
          platform_email = 'pietramantovani98@gmail.com',
          platform_access_status = 'granted',
          platform_access_granted_at = NOW(),
          platform_access_granted_by = '00000000-0000-0000-0000-000000000001',
          platform_roles = ARRAY['creator', 'marketing_strategist']::platform_user_role[],
          contact_info = jsonb_build_object(
            'email', 'pietramantovani98@gmail.com',
            'whatsapp', '43 98807-2689',
            'phone', '',
            'preferred_contact', 'email'
          ),
          updated_at = NOW()
        WHERE id = '${PIETRA_ORIGINAL_ID}'
      `
    });

    if (sqlError) {
      console.log('⚠️ Função exec_sql não disponível, usando UPDATE direto...');
      
      // Tentar update direto (pode dar erro de trigger)
      const { error: directUpdateError } = await supabase
        .from('creators')
        .update({
          platform_access_status: 'granted',
          platform_access_granted_at: new Date().toISOString(),
          platform_access_granted_by: '00000000-0000-0000-0000-000000000001',
          platform_roles: ['creator', 'marketing_strategist'],
          contact_info: {
            email: 'pietramantovani98@gmail.com',
            whatsapp: '43 98807-2689',
            phone: '',
            preferred_contact: 'email'
          }
        })
        .eq('id', PIETRA_ORIGINAL_ID);

      if (directUpdateError) {
        console.error('❌ Erro no update direto:', directUpdateError);
        console.log('\n📝 Execute este SQL manualmente no Supabase:');
        console.log(`
UPDATE creators 
SET 
  platform_email = 'pietramantovani98@gmail.com',
  platform_access_status = 'granted',
  platform_access_granted_at = NOW(),
  platform_access_granted_by = '00000000-0000-0000-0000-000000000001',
  platform_roles = ARRAY['creator', 'marketing_strategist']::platform_user_role[],
  contact_info = jsonb_build_object(
    'email', 'pietramantovani98@gmail.com',
    'whatsapp', '43 98807-2689',
    'phone', '',
    'preferred_contact', 'email'
  ),
  updated_at = NOW()
WHERE id = '${PIETRA_ORIGINAL_ID}';
        `);
      } else {
        console.log('✅ Pietra original atualizada (sem platform_email por enquanto)');
      }
    } else {
      console.log('✅ Pietra original atualizada via SQL');
    }

    console.log('\n3️⃣ Deletando Pietra duplicada...\n');

    const { error: deleteError } = await supabase
      .from('creators')
      .delete()
      .eq('id', PIETRA_DUPLICADA_ID);

    if (deleteError) {
      console.error('❌ Erro ao deletar Pietra duplicada:', deleteError);
      return;
    }

    console.log('✅ Pietra duplicada deletada!');

    console.log('\n4️⃣ Verificação final...\n');

    // Verificar Pietra final
    const { data: finalPietra } = await supabase
      .from('creators')
      .select('*')
      .eq('id', PIETRA_ORIGINAL_ID)
      .single();

    if (finalPietra) {
      console.log('✅ PIETRA FINAL:');
      console.log(`   ID: ${finalPietra.id}`);
      console.log(`   Nome: ${finalPietra.name}`);
      console.log(`   Email: ${finalPietra.platform_email || 'N/A'}`);
      console.log(`   Status: ${finalPietra.platform_access_status}`);
      console.log(`   Instagram: ${finalPietra.social_media?.instagram?.username}`);
      console.log(`   Followers: ${finalPietra.social_media?.instagram?.followers}`);
    }

    // Verificar campanhas
    const { data: campaigns } = await supabase
      .from('campaign_creators')
      .select('id')
      .eq('creator_id', PIETRA_ORIGINAL_ID);

    console.log(`\n✅ Campanhas: ${campaigns?.length || 0}`);

    // Verificar platform_users
    const { data: finalPlatformUser } = await supabase
      .from('platform_users')
      .select('*')
      .eq('email', 'pietramantovani98@gmail.com')
      .single();

    if (finalPlatformUser) {
      console.log('\n✅ platform_users:');
      console.log(`   Email: ${finalPlatformUser.email}`);
      console.log(`   Creator ID: ${finalPlatformUser.creator_id}`);
      console.log(`   Roles: ${finalPlatformUser.roles?.join(', ')}`);
      console.log(`   Ativo: ${finalPlatformUser.is_active}`);
    }

    console.log('\n🎉 Migração concluída!');
    
    if (!finalPietra?.platform_email) {
      console.log('\n⚠️ ATENÇÃO: platform_email não foi atualizado devido ao trigger.');
      console.log('Execute manualmente no Supabase SQL Editor:');
      console.log(`
UPDATE creators 
SET platform_email = 'pietramantovani98@gmail.com'
WHERE id = '${PIETRA_ORIGINAL_ID}';
      `);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

mergeDuplicatePietra();

