import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    const { email, password, accessToken, userData } = await request.json();

    console.log('🔐 [Set Password] Iniciando criação de senha para:', email);

    // Validações
    if (!email || !password || !accessToken) {
      return NextResponse.json(
        { error: 'Email, senha e token são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe em platform_users
    const { data: existingUser, error: fetchError } = await supabase
      .from('platform_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ [Set Password] Erro ao buscar usuário:', fetchError);
      return NextResponse.json(
        { error: 'Erro ao verificar usuário' },
        { status: 500 }
      );
    }

    // Gerar hash bcrypt da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ [Set Password] Hash gerado com sucesso');

    if (existingUser) {
      // Usuário já existe, apenas atualizar senha
      console.log('📝 [Set Password] Atualizando senha do usuário existente');

      const { error: updateError } = await supabase
        .from('platform_users')
        .update({
          password_hash: passwordHash,
          email_verified: true,
          is_active: true,
          last_password_change: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase())
        .eq('organization_id', DEFAULT_ORG_ID);

      if (updateError) {
        console.error('❌ [Set Password] Erro ao atualizar senha:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar senha' },
          { status: 500 }
        );
      }

      console.log('✅ [Set Password] Senha atualizada com sucesso');

      return NextResponse.json({
        success: true,
        message: 'Senha criada com sucesso',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          full_name: existingUser.full_name,
          role: existingUser.role,
          roles: existingUser.roles
        }
      });

    } else {
      // Usuário não existe, criar novo
      console.log('📝 [Set Password] Criando novo usuário em platform_users');

      // Determinar role e roles baseado nos dados do convite
      const role = userData?.role || 'business_owner';
      const roles = userData?.role === 'business_owner' 
        ? ['business_owner'] 
        : [userData?.role || 'creator'];

      // Preparar dados do novo usuário
      const newUserData: any = {
        organization_id: DEFAULT_ORG_ID,
        email: email.toLowerCase(),
        full_name: userData?.fullName || email.split('@')[0],
        role: role,
        roles: roles,
        password_hash: passwordHash,
        email_verified: true,
        is_active: true,
        platform: 'client',
        last_password_change: new Date().toISOString(),
        permissions: {
          campaigns: { read: true, write: role === 'business_owner', delete: false },
          conteudo: { read: true, write: role !== 'business_owner', delete: false },
          briefings: { read: true, write: role === 'marketing_strategist', delete: false },
          reports: { read: true, write: false, delete: false },
          tasks: { read: true, write: true, delete: false }
        },
        preferences: {
          theme: 'light',
          language: 'pt-BR',
          notifications: {
            push: true,
            email: true,
            in_app: true
          }
        },
        subscription_plan: 'basic',
        features_enabled: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Adicionar business_id se for business_owner
      if (userData?.businessId) {
        newUserData.business_id = userData.businessId;
        newUserData.managed_businesses = [userData.businessId];
      }

      const { data: newUser, error: insertError } = await supabase
        .from('platform_users')
        .insert([newUserData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ [Set Password] Erro ao criar usuário:', insertError);
        return NextResponse.json(
          { error: 'Erro ao criar usuário' },
          { status: 500 }
        );
      }

      console.log('✅ [Set Password] Usuário criado com sucesso:', newUser.id);

      return NextResponse.json({
        success: true,
        message: 'Usuário criado com sucesso',
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          roles: newUser.roles
        }
      });
    }

  } catch (error) {
    console.error('❌ [Set Password] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

