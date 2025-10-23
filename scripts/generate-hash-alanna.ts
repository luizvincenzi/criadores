/**
 * Script para gerar hash bcrypt da senha da Alanna
 * Senha: 1#CriamudarA
 */

import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = '1#CriamudarA';
  const saltRounds = 12;

  console.log('🔐 Gerando hash bcrypt...');
  console.log('📝 Senha:', password);
  console.log('🔢 Salt rounds:', saltRounds);
  console.log('');

  const hash = await bcrypt.hash(password, saltRounds);

  console.log('✅ Hash gerado com sucesso!');
  console.log('');
  console.log('📋 COPIE O HASH ABAIXO:');
  console.log('─'.repeat(80));
  console.log(hash);
  console.log('─'.repeat(80));
  console.log('');
  console.log('📏 Comprimento:', hash.length, hash.length === 60 ? '✅' : '❌');
  console.log('🔤 Prefixo:', hash.substring(0, 4), hash.startsWith('$2a$') || hash.startsWith('$2b$') ? '✅' : '❌');
  console.log('');
  console.log('📝 SQL para inserir/atualizar:');
  console.log('─'.repeat(80));
  console.log(`
-- OPÇÃO 1: Se Alanna NÃO existe em platform_users, INSERIR:
INSERT INTO platform_users (
  id,
  organization_id,
  email,
  full_name,
  role,
  roles,
  is_active,
  platform,
  password_hash,
  permissions,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'alannaalicia17@gmail.com',
  'Alanna Alícia',
  'marketing_strategist',
  ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  true,
  'client',
  '${hash}',
  '{
    "campaigns": {"read": true, "write": true, "delete": false},
    "conteudo": {"read": true, "write": true, "delete": false},
    "briefings": {"read": true, "write": true, "delete": false},
    "reports": {"read": true, "write": false, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false}
  }'::jsonb,
  NOW(),
  NOW()
);

-- OPÇÃO 2: Se Alanna JÁ existe em platform_users, ATUALIZAR:
UPDATE platform_users 
SET 
  password_hash = '${hash}',
  updated_at = NOW()
WHERE email = 'alannaalicia17@gmail.com';
  `);
  console.log('─'.repeat(80));
  console.log('');
  console.log('✅ Pronto! Copie o SQL acima e execute no Supabase SQL Editor.');
}

generateHash().catch(console.error);

