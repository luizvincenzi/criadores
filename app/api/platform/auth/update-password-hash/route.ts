import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Criar cliente admin do Supabase com service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 [Update Password Hash] Iniciando atualização para:', email);

    // Validações
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    // 1. Gerar hash bcrypt
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ [Update Password Hash] Hash bcrypt gerado');

    // 2. Buscar usuário em platform_users
    const { data: platformUser, error: userError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, full_name')
      .eq('email', email.toLowerCase())
      .single();

    if (platformUser) {
      // ✅ Usuário existe - apenas atualizar senha
      console.log('✅ [Update Password Hash] Usuário encontrado:', platformUser.id);

      const { error: updateError } = await supabaseAdmin
        .from('platform_users')
        .update({
          password_hash: passwordHash,
          is_active: true,
          email_verified: true,
          last_password_change: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', platformUser.id);

      if (updateError) {
        console.error('❌ [Update Password Hash] Erro ao atualizar:', updateError);
        return NextResponse.json(
          { success: false, error: 'Erro ao atualizar senha' },
          { status: 500 }
        );
      }

      console.log('✅ [Update Password Hash] platform_users atualizado com sucesso!');
    } else {
      // ⚠️ Usuário NÃO existe em platform_users - criar registro usando dados do Supabase Auth
      console.log('⚠️ [Update Password Hash] Usuário NÃO encontrado em platform_users. Criando registro...');

      // Buscar dados do usuário no Supabase Auth para obter metadata
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 50
      });

      if (listError) {
        console.error('❌ [Update Password Hash] Erro ao buscar auth users:', listError);
        return NextResponse.json(
          { success: false, error: 'Erro ao buscar dados do usuário' },
          { status: 500 }
        );
      }

      const authUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

      if (!authUser) {
        console.error('❌ [Update Password Hash] Usuário não encontrado nem no Supabase Auth');
        return NextResponse.json(
          { success: false, error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      const metadata = authUser.user_metadata || {};
      const entityType = metadata.entity_type || 'business';
      const isCreator = entityType === 'creator';
      const role = metadata.role || (isCreator ? 'creator' : 'business_owner');

      console.log('📋 [Update Password Hash] Dados do Auth user:', {
        id: authUser.id,
        email: authUser.email,
        fullName: metadata.full_name,
        entityType,
        role,
        businessId: metadata.business_id,
        creatorId: metadata.creator_id
      });

      // Criar registro em platform_users
      const newUserData: Record<string, unknown> = {
        id: authUser.id,
        organization_id: DEFAULT_ORG_ID,
        email: email.toLowerCase(),
        full_name: metadata.full_name || email.split('@')[0],
        role: role,
        roles: isCreator ? ['creator'] : [role],
        password_hash: passwordHash,
        email_verified: true,
        is_active: true,
        platform: 'criadores',
        last_password_change: new Date().toISOString(),
        permissions: {
          campaigns: { read: true, write: role === 'business_owner', delete: false },
          conteudo: { read: true, write: isCreator || role === 'marketing_strategist', delete: false },
          briefings: { read: true, write: role === 'marketing_strategist', delete: false },
          reports: { read: true, write: false, delete: false },
          tasks: { read: true, write: true, delete: false }
        },
        preferences: {
          theme: 'light',
          language: 'pt-BR',
          notifications: { push: true, email: true, in_app: true }
        },
        subscription_plan: 'basic',
        features_enabled: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Adicionar business_id se disponível
      if (metadata.business_id) {
        newUserData.business_id = metadata.business_id;
        newUserData.managed_businesses = [metadata.business_id];
      }

      // Adicionar creator_id se disponível
      if (metadata.creator_id) {
        newUserData.creator_id = metadata.creator_id;
      }

      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('platform_users')
        .insert([newUserData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ [Update Password Hash] Erro ao criar platform_user:', insertError);
        return NextResponse.json(
          { success: false, error: 'Erro ao criar registro do usuário: ' + insertError.message },
          { status: 500 }
        );
      }

      console.log('✅ [Update Password Hash] platform_user CRIADO com sucesso!', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      });
    }

    // 3. Invalidar tokens de ativação existentes (se houver)
    try {
      await supabaseAdmin
        .from('activation_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('email', email.toLowerCase())
        .is('used_at', null);

      console.log('✅ [Update Password Hash] Tokens de ativação invalidados');
    } catch (err) {
      console.warn('⚠️ [Update Password Hash] Erro ao invalidar tokens (não crítico):', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso'
    });

  } catch (error: any) {
    console.error('❌ [Update Password Hash] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: `Erro interno: ${error?.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}

