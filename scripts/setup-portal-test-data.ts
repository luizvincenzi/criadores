#!/usr/bin/env tsx

/**
 * Script para criar dados de teste do Portal
 * Cria usuários de teste para empresas e criadores
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPortalTestData() {
  console.log('🚀 Configurando dados de teste do Portal...\n');

  try {
    // Verificar se a tabela portal_users existe
    const { data: tableExists } = await supabase
      .from('portal_users')
      .select('id')
      .limit(1);

    if (!tableExists) {
      console.log('❌ Tabela portal_users não existe. Execute as migrations primeiro.');
      console.log('📋 Execute o SQL das migrations no Supabase Dashboard:');
      console.log('   1. Acesse: https://supabase.com/dashboard/project/ecbhcalmulaiszslwhqz/sql');
      console.log('   2. Execute o conteúdo dos arquivos em supabase/migrations/');
      return;
    }

    console.log('✅ Tabela portal_users encontrada');
    // 1. Buscar algumas empresas e criadores existentes
    console.log('📊 Buscando empresas e criadores existentes...');
    
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, contact_info')
      .eq('is_active', true)
      .limit(5);

    if (businessError) {
      console.error('❌ Erro ao buscar empresas:', businessError);
      return;
    }

    const { data: creators, error: creatorError } = await supabase
      .from('creators')
      .select('id, name, contact_info')
      .eq('status', 'Ativo')
      .limit(5);

    if (creatorError) {
      console.error('❌ Erro ao buscar criadores:', creatorError);
      return;
    }

    console.log(`✅ Encontradas ${businesses?.length || 0} empresas e ${creators?.length || 0} criadores`);

    // 2. Criar usuários do portal para empresas
    console.log('\n👥 Criando usuários do portal para empresas...');
    
    const portalUsers = [];
    
    if (businesses && businesses.length > 0) {
      for (let i = 0; i < Math.min(3, businesses.length); i++) {
        const business = businesses[i];
        const email = `empresa${i + 1}@criadores.app`;
        const password = 'Portal2024!';
        const passwordHash = await bcrypt.hash(password, 10);

        const portalUser = {
          email,
          password_hash: passwordHash,
          user_type: 'empresa',
          entity_id: business.id,
          full_name: `Gestor ${business.name}`,
          is_active: true,
          organization_id: '00000000-0000-0000-0000-000000000001'
        };

        portalUsers.push(portalUser);
        console.log(`  📧 ${email} → ${business.name} (senha: ${password})`);
      }
    }

    // 3. Criar usuários do portal para criadores
    console.log('\n🎨 Criando usuários do portal para criadores...');
    
    if (creators && creators.length > 0) {
      for (let i = 0; i < Math.min(3, creators.length); i++) {
        const creator = creators[i];
        const email = `criador${i + 1}@criadores.app`;
        const password = 'Portal2024!';
        const passwordHash = await bcrypt.hash(password, 10);

        const portalUser = {
          email,
          password_hash: passwordHash,
          user_type: 'criador',
          entity_id: creator.id,
          full_name: creator.name,
          is_active: true,
          organization_id: '00000000-0000-0000-0000-000000000001'
        };

        portalUsers.push(portalUser);
        console.log(`  📧 ${email} → ${creator.name} (senha: ${password})`);
      }
    }

    // 4. Inserir usuários do portal
    if (portalUsers.length > 0) {
      console.log('\n💾 Inserindo usuários do portal...');
      
      const { data: insertedUsers, error: insertError } = await supabase
        .from('portal_users')
        .insert(portalUsers)
        .select();

      if (insertError) {
        console.error('❌ Erro ao inserir usuários do portal:', insertError);
        return;
      }

      console.log(`✅ ${insertedUsers?.length || 0} usuários do portal criados com sucesso!`);
    }

    // 5. Criar configurações padrão para empresas
    console.log('\n⚙️ Criando configurações padrão para empresas...');
    
    if (businesses && businesses.length > 0) {
      const businessSettings = businesses.slice(0, 3).map(business => ({
        business_id: business.id,
        show_financial_data: false,
        show_creator_details: true,
        show_campaign_metrics: true,
        show_task_system: true,
        custom_branding: {
          primary_color: '#3B82F6',
          logo_url: null,
          company_name: business.name
        }
      }));

      const { error: settingsError } = await supabase
        .from('business_portal_settings')
        .insert(businessSettings);

      if (settingsError) {
        console.error('❌ Erro ao criar configurações:', settingsError);
      } else {
        console.log(`✅ Configurações criadas para ${businessSettings.length} empresas`);
      }
    }

    // 6. Criar algumas notificações de teste
    console.log('\n🔔 Criando notificações de teste...');
    
    const { data: allPortalUsers } = await supabase
      .from('portal_users')
      .select('id, user_type, full_name');

    if (allPortalUsers && allPortalUsers.length > 0) {
      const notifications = [];
      
      for (const user of allPortalUsers.slice(0, 3)) {
        notifications.push({
          user_id: user.id,
          title: 'Bem-vindo ao Portal crIAdores!',
          message: `Olá ${user.full_name}, seja bem-vindo ao portal. Aqui você pode acompanhar suas campanhas e métricas.`,
          type: 'info',
          is_read: false
        });

        if (user.user_type === 'empresa') {
          notifications.push({
            user_id: user.id,
            title: 'Nova campanha disponível',
            message: 'Uma nova campanha foi criada e está aguardando sua aprovação.',
            type: 'success',
            is_read: false
          });
        } else {
          notifications.push({
            user_id: user.id,
            title: 'Entrega pendente',
            message: 'Você tem uma entrega de conteúdo pendente para esta semana.',
            type: 'warning',
            is_read: false
          });
        }
      }

      const { error: notifError } = await supabase
        .from('portal_notifications')
        .insert(notifications);

      if (notifError) {
        console.error('❌ Erro ao criar notificações:', notifError);
      } else {
        console.log(`✅ ${notifications.length} notificações de teste criadas`);
      }
    }

    // 7. Resumo final
    console.log('\n📋 RESUMO DOS DADOS DE TESTE CRIADOS:');
    console.log('=====================================');
    
    const { data: finalUsers } = await supabase
      .from('portal_users')
      .select('email, user_type, full_name')
      .order('user_type', { ascending: true });

    if (finalUsers) {
      console.log('\n👥 USUÁRIOS DO PORTAL:');
      finalUsers.forEach(user => {
        const icon = user.user_type === 'empresa' ? '🏢' : '🎨';
        console.log(`  ${icon} ${user.email} - ${user.full_name} (${user.user_type})`);
      });
    }

    console.log('\n🔑 CREDENCIAIS DE TESTE:');
    console.log('  📧 Email: empresa1@criadores.app | Senha: Portal2024!');
    console.log('  📧 Email: criador1@criadores.app | Senha: Portal2024!');
    
    console.log('\n✅ Setup do portal concluído com sucesso!');
    console.log('🌐 Agora você pode testar o login no portal criadores.app');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
setupPortalTestData();
