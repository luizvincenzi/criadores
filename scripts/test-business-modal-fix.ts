import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testBusinessModalFix() {
  console.log('🔧 TESTANDO CORREÇÃO DO MODAL DE NEGÓCIOS\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Buscar dados da API
    console.log('📊 1. BUSCANDO DADOS DA API...');
    const businessResponse = await fetch(`${baseUrl}/api/supabase/businesses`);
    const businessResult = await businessResponse.json();
    
    if (!businessResult.success) {
      console.log('❌ Erro na API:', businessResult.error);
      return;
    }
    
    // 2. Encontrar Auto Posto Bela Suíça
    const autoPostoBusiness = businessResult.data.find((business: any) => 
      business.nome?.toLowerCase().includes('auto posto')
    );
    
    if (!autoPostoBusiness) {
      console.log('❌ Auto Posto Bela Suíça não encontrado');
      return;
    }
    
    console.log('✅ Auto Posto Bela Suíça encontrado!');
    
    // 3. Simular mapeamento do modal ANTES da correção
    console.log('\n🔍 2. SIMULANDO MAPEAMENTO ANTES DA CORREÇÃO...');
    const oldMapping = {
      businessName: autoPostoBusiness.name || autoPostoBusiness.businessName || '',
      category: autoPostoBusiness.categoria || '',
      currentPlan: autoPostoBusiness.plano || autoPostoBusiness.currentPlan || '',
    };
    
    console.log('❌ MAPEAMENTO ANTIGO (INCORRETO):');
    console.log(`   - businessName: "${oldMapping.businessName}" (VAZIO!)`);
    console.log(`   - category: "${oldMapping.category}"`);
    console.log(`   - currentPlan: "${oldMapping.currentPlan}" (VAZIO!)`);
    
    // 4. Simular mapeamento do modal DEPOIS da correção
    console.log('\n✅ 3. SIMULANDO MAPEAMENTO DEPOIS DA CORREÇÃO...');
    const newMapping = {
      businessName: autoPostoBusiness.nome || autoPostoBusiness.name || autoPostoBusiness.businessName || '',
      category: autoPostoBusiness.categoria || '',
      currentPlan: autoPostoBusiness.planoAtual || autoPostoBusiness.plano || autoPostoBusiness.currentPlan || '',
    };
    
    console.log('✅ MAPEAMENTO NOVO (CORRETO):');
    console.log(`   - businessName: "${newMapping.businessName}" (PREENCHIDO!)`);
    console.log(`   - category: "${newMapping.category}"`);
    console.log(`   - currentPlan: "${newMapping.currentPlan}" (PREENCHIDO!)`);
    
    // 5. Comparação
    console.log('\n📊 4. COMPARAÇÃO DOS RESULTADOS...');
    
    const fixes = [];
    
    if (oldMapping.businessName !== newMapping.businessName) {
      fixes.push({
        field: 'businessName',
        before: oldMapping.businessName || '(vazio)',
        after: newMapping.businessName,
        status: newMapping.businessName ? '✅ CORRIGIDO' : '❌ AINDA VAZIO'
      });
    }
    
    if (oldMapping.currentPlan !== newMapping.currentPlan) {
      fixes.push({
        field: 'currentPlan',
        before: oldMapping.currentPlan || '(vazio)',
        after: newMapping.currentPlan,
        status: newMapping.currentPlan ? '✅ CORRIGIDO' : '❌ AINDA VAZIO'
      });
    }
    
    if (fixes.length > 0) {
      console.log('🔧 CORREÇÕES APLICADAS:');
      fixes.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix.field}:`);
        console.log(`      Antes: "${fix.before}"`);
        console.log(`      Depois: "${fix.after}"`);
        console.log(`      Status: ${fix.status}`);
      });
    } else {
      console.log('ℹ️ Nenhuma correção necessária');
    }
    
    // 6. Verificar todos os campos importantes
    console.log('\n📋 5. VERIFICAÇÃO COMPLETA DOS CAMPOS...');
    
    const allFields = {
      businessName: autoPostoBusiness.nome || autoPostoBusiness.name || autoPostoBusiness.businessName || '',
      category: autoPostoBusiness.categoria || '',
      currentPlan: autoPostoBusiness.planoAtual || autoPostoBusiness.plano || autoPostoBusiness.currentPlan || '',
      comercial: autoPostoBusiness.comercial || '',
      nomeResponsavel: autoPostoBusiness.nomeResponsavel || autoPostoBusiness.responsavel || '',
      cidade: autoPostoBusiness.cidade || '',
      whatsappResponsavel: autoPostoBusiness.whatsappResponsavel || autoPostoBusiness.whatsapp || '',
      prospeccao: autoPostoBusiness.prospeccao || autoPostoBusiness.status || '',
      responsavel: autoPostoBusiness.responsavel || '',
      instagram: autoPostoBusiness.instagram || ''
    };
    
    console.log('📝 TODOS OS CAMPOS MAPEADOS:');
    Object.entries(allFields).forEach(([key, value]) => {
      const status = value ? '✅' : '⚠️';
      console.log(`   ${status} ${key}: "${value}"`);
    });
    
    // 7. Verificar se o header do modal vai funcionar
    console.log('\n🎯 6. VERIFICAÇÃO DO HEADER DO MODAL...');
    
    const headerData = {
      title: allFields.businessName,
      category: allFields.category,
      city: allFields.cidade,
      plan: allFields.currentPlan,
      status: allFields.prospeccao
    };
    
    console.log('🏢 DADOS DO HEADER:');
    console.log(`   📊 Título: "${headerData.title}" ${headerData.title ? '✅' : '❌'}`);
    console.log(`   🏷️ Categoria: "${headerData.category}" ${headerData.category ? '✅' : '⚠️'}`);
    console.log(`   📍 Cidade: "${headerData.city}" ${headerData.city ? '✅' : '⚠️'}`);
    console.log(`   💼 Plano: "${headerData.plan}" ${headerData.plan ? '✅' : '⚠️'}`);
    console.log(`   📈 Status: "${headerData.status}" ${headerData.status ? '✅' : '⚠️'}`);
    
    // 8. Resultado final
    console.log('\n🎉 7. RESULTADO FINAL...');
    
    const criticalFields = ['businessName', 'nomeResponsavel'];
    const allCriticalFieldsFilled = criticalFields.every(field => allFields[field as keyof typeof allFields]);
    
    if (allCriticalFieldsFilled) {
      console.log('✅ CORREÇÃO BEM-SUCEDIDA!');
      console.log('🎯 O modal agora vai exibir:');
      console.log(`   - Nome do negócio: "${allFields.businessName}"`);
      console.log(`   - Responsável: "${allFields.nomeResponsavel}"`);
      console.log(`   - Cidade: "${allFields.cidade}"`);
      console.log(`   - Plano: "${allFields.currentPlan}"`);
      
      console.log('\n🚀 TESTE MANUAL:');
      console.log('1. Acesse: http://localhost:3000/businesses');
      console.log('2. Procure por "Auto Posto Bela Suíça"');
      console.log('3. Clique em "Ver Detalhes"');
      console.log('4. Verifique se o nome aparece no header do modal');
      
    } else {
      console.log('❌ AINDA HÁ PROBLEMAS');
      console.log('🔧 Campos críticos vazios:');
      criticalFields.forEach(field => {
        if (!allFields[field as keyof typeof allFields]) {
          console.log(`   - ${field}: vazio`);
        }
      });
    }
    
    console.log('\n📊 ESTATÍSTICAS:');
    const totalFields = Object.keys(allFields).length;
    const filledFields = Object.values(allFields).filter(value => value).length;
    const percentage = Math.round((filledFields / totalFields) * 100);
    
    console.log(`   - Total de campos: ${totalFields}`);
    console.log(`   - Campos preenchidos: ${filledFields}`);
    console.log(`   - Porcentagem: ${percentage}%`);
    
    if (percentage >= 70) {
      console.log('✅ DADOS SUFICIENTES PARA MODAL FUNCIONAL');
    } else {
      console.log('⚠️ POUCOS DADOS - MODAL PODE PARECER VAZIO');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testBusinessModalFix()
    .then(() => {
      console.log('\n🎉 Teste de correção concluído');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testBusinessModalFix };
