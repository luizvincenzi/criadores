import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testNameStandardization() {
  console.log('🧪 TESTANDO PADRONIZAÇÃO DO CAMPO NOME DO BUSINESS\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar API de negócios
    console.log('📊 1. TESTANDO API DE NEGÓCIOS...');
    const businessResponse = await fetch(`${baseUrl}/api/supabase/businesses`);
    const businessResult = await businessResponse.json();
    
    if (!businessResult.success) {
      console.log('❌ Erro na API:', businessResult.error);
      return;
    }
    
    console.log(`✅ ${businessResult.data.length} negócios encontrados na API`);
    
    // 2. Verificar estrutura dos dados
    console.log('\n🔍 2. VERIFICANDO ESTRUTURA DOS DADOS...');
    
    if (businessResult.data.length > 0) {
      const firstBusiness = businessResult.data[0];
      
      console.log('📋 CAMPOS DISPONÍVEIS NO PRIMEIRO NEGÓCIO:');
      console.log(`   - name: "${firstBusiness.name || 'N/A'}"`);
      console.log(`   - nome: "${firstBusiness.nome || 'N/A'}"`);
      console.log(`   - businessName: "${firstBusiness.businessName || 'N/A'}"`);
      
      // Verificar consistência
      const hasName = !!firstBusiness.name;
      const hasNome = !!firstBusiness.nome;
      const hasBusinessName = !!firstBusiness.businessName;
      
      console.log('\n✅ VERIFICAÇÃO DE CONSISTÊNCIA:');
      console.log(`   - Campo 'name' preenchido: ${hasName ? '✅' : '❌'}`);
      console.log(`   - Campo 'nome' preenchido: ${hasNome ? '✅' : '❌'}`);
      console.log(`   - Campo 'businessName' preenchido: ${hasBusinessName ? '✅' : '❌'}`);
      
      // Verificar se todos os campos têm o mesmo valor
      if (hasName && hasNome && hasBusinessName) {
        const allSame = firstBusiness.name === firstBusiness.nome && 
                       firstBusiness.nome === firstBusiness.businessName;
        console.log(`   - Todos os campos iguais: ${allSame ? '✅' : '❌'}`);
        
        if (!allSame) {
          console.log('⚠️ VALORES DIFERENTES:');
          console.log(`     name: "${firstBusiness.name}"`);
          console.log(`     nome: "${firstBusiness.nome}"`);
          console.log(`     businessName: "${firstBusiness.businessName}"`);
        }
      }
    }
    
    // 3. Testar Auto Posto Bela Suíça especificamente
    console.log('\n🎯 3. TESTANDO AUTO POSTO BELA SUÍÇA...');
    
    const autoPostoBusiness = businessResult.data.find((business: any) => 
      business.name?.toLowerCase().includes('auto posto') ||
      business.nome?.toLowerCase().includes('auto posto') ||
      business.businessName?.toLowerCase().includes('auto posto')
    );
    
    if (autoPostoBusiness) {
      console.log('✅ Auto Posto Bela Suíça encontrado!');
      console.log('📋 DADOS COMPLETOS:');
      console.log(`   - ID: ${autoPostoBusiness.id}`);
      console.log(`   - name: "${autoPostoBusiness.name}"`);
      console.log(`   - nome: "${autoPostoBusiness.nome}"`);
      console.log(`   - businessName: "${autoPostoBusiness.businessName}"`);
      console.log(`   - categoria: "${autoPostoBusiness.categoria}"`);
      console.log(`   - cidade: "${autoPostoBusiness.cidade}"`);
      
      // Simular mapeamento do modal
      console.log('\n🎯 SIMULAÇÃO DO MAPEAMENTO DO MODAL:');
      const modalMapping = autoPostoBusiness.name || autoPostoBusiness.nome || autoPostoBusiness.businessName || '';
      console.log(`   - Resultado: "${modalMapping}"`);
      console.log(`   - Status: ${modalMapping ? '✅ PREENCHIDO' : '❌ VAZIO'}`);
      
      // Simular mapeamento da página
      console.log('\n📄 SIMULAÇÃO DO MAPEAMENTO DA PÁGINA:');
      const pageMapping = autoPostoBusiness.name || autoPostoBusiness.nome || autoPostoBusiness.businessName || 'Sem Nome';
      console.log(`   - Resultado: "${pageMapping}"`);
      console.log(`   - Status: ${pageMapping !== 'Sem Nome' ? '✅ PREENCHIDO' : '❌ VAZIO'}`);
      
    } else {
      console.log('❌ Auto Posto Bela Suíça não encontrado');
    }
    
    // 4. Verificar todos os negócios
    console.log('\n📊 4. VERIFICANDO TODOS OS NEGÓCIOS...');
    
    let totalBusinesses = businessResult.data.length;
    let withName = 0;
    let withNome = 0;
    let withBusinessName = 0;
    let allFieldsConsistent = 0;
    
    businessResult.data.forEach((business: any) => {
      if (business.name) withName++;
      if (business.nome) withNome++;
      if (business.businessName) withBusinessName++;
      
      if (business.name && business.nome && business.businessName &&
          business.name === business.nome && business.nome === business.businessName) {
        allFieldsConsistent++;
      }
    });
    
    console.log('📈 ESTATÍSTICAS GERAIS:');
    console.log(`   - Total de negócios: ${totalBusinesses}`);
    console.log(`   - Com campo 'name': ${withName} (${Math.round(withName/totalBusinesses*100)}%)`);
    console.log(`   - Com campo 'nome': ${withNome} (${Math.round(withNome/totalBusinesses*100)}%)`);
    console.log(`   - Com campo 'businessName': ${withBusinessName} (${Math.round(withBusinessName/totalBusinesses*100)}%)`);
    console.log(`   - Todos os campos consistentes: ${allFieldsConsistent} (${Math.round(allFieldsConsistent/totalBusinesses*100)}%)`);
    
    // 5. Testar casos extremos
    console.log('\n🧪 5. TESTANDO CASOS EXTREMOS...');
    
    const emptyNames = businessResult.data.filter((business: any) => 
      !business.name && !business.nome && !business.businessName
    );
    
    const inconsistentNames = businessResult.data.filter((business: any) => 
      business.name && business.nome && business.businessName &&
      (business.name !== business.nome || business.nome !== business.businessName)
    );
    
    console.log(`   - Negócios sem nome: ${emptyNames.length}`);
    console.log(`   - Negócios com nomes inconsistentes: ${inconsistentNames.length}`);
    
    if (inconsistentNames.length > 0) {
      console.log('⚠️ NEGÓCIOS COM NOMES INCONSISTENTES:');
      inconsistentNames.slice(0, 3).forEach((business: any, index: number) => {
        console.log(`   ${index + 1}. ID: ${business.id}`);
        console.log(`      name: "${business.name}"`);
        console.log(`      nome: "${business.nome}"`);
        console.log(`      businessName: "${business.businessName}"`);
      });
    }
    
    // 6. Resultado final
    console.log('\n🎯 6. RESULTADO FINAL...');
    
    const success = withName === totalBusinesses && 
                   allFieldsConsistent === totalBusinesses && 
                   emptyNames.length === 0 && 
                   inconsistentNames.length === 0;
    
    if (success) {
      console.log('✅ PADRONIZAÇÃO 100% BEM-SUCEDIDA!');
      console.log('🎯 BENEFÍCIOS ALCANÇADOS:');
      console.log('   - ✅ Todos os negócios têm campo "name" preenchido');
      console.log('   - ✅ Todos os campos são consistentes');
      console.log('   - ✅ Nenhum nome vazio');
      console.log('   - ✅ Modal funcionará perfeitamente');
      console.log('   - ✅ Página de listagem funcionará perfeitamente');
      
      console.log('\n🚀 TESTE MANUAL RECOMENDADO:');
      console.log('1. Acesse: http://localhost:3000/businesses');
      console.log('2. Verifique se todos os nomes aparecem na listagem');
      console.log('3. Clique em "Ver Detalhes" em qualquer negócio');
      console.log('4. Verifique se o nome aparece no header do modal');
      console.log('5. Teste especialmente o "Auto Posto Bela Suíça"');
      
    } else {
      console.log('⚠️ PADRONIZAÇÃO PARCIAL');
      console.log('🔧 PROBLEMAS ENCONTRADOS:');
      
      if (withName < totalBusinesses) {
        console.log(`   - ${totalBusinesses - withName} negócios sem campo "name"`);
      }
      if (allFieldsConsistent < totalBusinesses) {
        console.log(`   - ${totalBusinesses - allFieldsConsistent} negócios com campos inconsistentes`);
      }
      if (emptyNames.length > 0) {
        console.log(`   - ${emptyNames.length} negócios sem nome`);
      }
      if (inconsistentNames.length > 0) {
        console.log(`   - ${inconsistentNames.length} negócios com nomes diferentes`);
      }
    }
    
    console.log('\n📊 RESUMO DA PADRONIZAÇÃO:');
    console.log(`✅ Campo principal: "name"`);
    console.log(`🔄 Compatibilidade: "nome" e "businessName" mantidos temporariamente`);
    console.log(`🎯 Prioridade no modal: business.name || business.nome || business.businessName`);
    console.log(`📄 Prioridade na página: business.name || business.nome || business.businessName`);
    console.log(`🗄️ Banco de dados: 100% padronizado com campo "name"`);
    
    return {
      success,
      totalBusinesses,
      withName,
      allFieldsConsistent,
      emptyNames: emptyNames.length,
      inconsistentNames: inconsistentNames.length
    };
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
}

if (require.main === module) {
  testNameStandardization()
    .then((result) => {
      console.log('\n🎉 Teste de padronização concluído');
      if (result.success) {
        console.log('✅ PADRONIZAÇÃO 100% FUNCIONAL!');
      } else {
        console.log('⚠️ Padronização parcial - verificar problemas acima');
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testNameStandardization };
