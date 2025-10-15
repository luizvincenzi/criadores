/**
 * Script para corrigir a role principal da Marilia
 */

import { supabase } from '../lib/supabase';

async function fixMariliaRole() {
  console.log('🔧 Corrigindo role da Marilia...\n');

  const { data, error } = await supabase
    .from('platform_users')
    .update({ role: 'marketing_strategist' })
    .eq('email', 'marilia12cavalheiro@gmail.com')
    .select();

  if (error) {
    console.error('❌ Erro ao atualizar:', error);
    process.exit(1);
  }

  console.log('✅ Role atualizada com sucesso!');
  console.log('Dados atualizados:', data);
}

fixMariliaRole();

