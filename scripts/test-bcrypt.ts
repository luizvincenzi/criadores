/**
 * Script para testar bcrypt
 * 
 * Execute com: npx ts-node scripts/test-bcrypt.ts
 */

import bcrypt from 'bcryptjs';

async function testBcrypt() {
  console.log('🧪 Testando bcrypt...\n');

  const password = 'TesteSenha123!';
  console.log('📝 Senha original:', password);

  // Gerar hash
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('🔐 Hash gerado:', hash);
  console.log('📏 Tamanho do hash:', hash.length);

  // Testar verificação
  const isValid = await bcrypt.compare(password, hash);
  console.log('✅ Verificação:', isValid ? 'PASSOU' : 'FALHOU');

  // Testar com senha errada
  const isInvalid = await bcrypt.compare('SenhaErrada', hash);
  console.log('❌ Senha errada:', isInvalid ? 'PASSOU (ERRO!)' : 'FALHOU (CORRETO)');

  console.log('\n✅ Teste concluído!');
}

testBcrypt().catch(console.error);

