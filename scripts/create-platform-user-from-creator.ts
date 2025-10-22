import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function createPlatformUserFromCreator(creatorEmail: string) {
  try {
    console.log('🔍 Buscando creator:', creatorEmail);

    // 1. Buscar creator
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('platform_email', creatorEmail)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (creatorError || !creator) {
      console.error('❌ Creator não encontrado:', creatorError?.message);
      return;
    }

    console.log('✅ Creator encontrado:', {
      id: creator.id,
      name: creator.name,
      email: creator.platform_email,
      roles: creator.platform_roles,
      access_status: creator.platform_access_status
    });

    // 2. Verificar se já existe em platform_users
    const { data: existingUser, error: checkError } = await supabase
      .from('platform_users')
      .select('id')
      .eq('email', creatorEmail)
      .single();

    if (existingUser) {
      console.log('⚠️ Usuário já existe em platform_users:', existingUser.id);
      return;
    }

    // 3. Criar platform_user
    const platformRoles = creator.platform_roles || ['creator'];
    const mainRole = platformRoles.includes('marketing_strategist') 
      ? 'marketing_strategist' 
      : 'creator';

    const newUser = {
      id: crypto.randomUUID(),
      organization_id: DEFAULT_ORG_ID,
      email: creator.platform_email,
      full_name: creator.name,
      role: mainRole,
      roles: platformRoles,
      creator_id: creator.id,
      is_active: true,
      platform_access_status: 'granted',
      platform_access_granted_at: creator.platform_access_granted_at || new Date().toISOString(),
      platform_access_granted_by: creator.platform_access_granted_by || null,
      password_hash: creator.platform_password_hash,
      permissions: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Criando platform_user:', {
      email: newUser.email,
      role: newUser.role,
      roles: newUser.roles,
      creator_id: newUser.creator_id
    });

    const { data: insertedUser, error: insertError } = await supabase
      .from('platform_users')
      .insert(newUser)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar platform_user:', insertError.message);
      return;
    }

    console.log('✅ Platform_user criado com sucesso!');
    console.log('ID:', insertedUser.id);
    console.log('Email:', insertedUser.email);
    console.log('Role:', insertedUser.role);
    console.log('Roles:', insertedUser.roles);
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar para Julia Franco
const creatorEmail = process.argv[2] || 'juliacarolinasan83@gmail.com';
createPlatformUserFromCreator(creatorEmail)
  .then(() => {
    console.log('✅ Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  });