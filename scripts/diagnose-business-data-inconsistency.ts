import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function diagnoseBusiness() {
  console.log('🔍 DIAGNÓSTICO DE INCONSISTÊNCIA DE DADOS - AUTO POSTO BELA SUÍÇA\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Buscar dados da API de negócios
    console.log('📊 1. BUSCANDO DADOS DA API DE NEGÓCIOS...');
    const businessResponse = await fetch(`${baseUrl}/api/supabase/businesses`);
    const businessResult = await businessResponse.json();
    
    if (!businessResult.success) {
      console.log('❌ Erro na API de negócios:', businessResult.error);
      return;
    }
    
    console.log(`✅ ${businessResult.data.length} negócios encontrados na API`);
    
    // 2. Procurar "Auto Posto Bela Suíça"
    console.log('\n🔍 2. PROCURANDO "AUTO POSTO BELA SUÍÇA"...');
    
    const autoPostoBusiness = businessResult.data.find((business: any) => 
      business.nome?.toLowerCase().includes('auto posto') ||
      business.nome?.toLowerCase().includes('bela suíça') ||
      business.nome?.toLowerCase().includes('bela suica')
    );
    
    if (autoPostoBusiness) {
      console.log('✅ ENCONTRADO! Dados do Auto Posto Bela Suíça:');
      console.log('📋 ESTRUTURA COMPLETA DOS DADOS:');
      console.log(JSON.stringify(autoPostoBusiness, null, 2));
      
      console.log('\n📝 CAMPOS MAPEADOS PARA O MODAL:');
      console.log(`   - ID: ${autoPostoBusiness.id}`);
      console.log(`   - Nome (business.nome): ${autoPostoBusiness.nome}`);
      console.log(`   - Nome (business.name): ${autoPostoBusiness.name || 'N/A'}`);
      console.log(`   - Nome (business.businessName): ${autoPostoBusiness.businessName || 'N/A'}`);
      console.log(`   - Categoria: ${autoPostoBusiness.categoria}`);
      console.log(`   - Plano Atual: ${autoPostoBusiness.planoAtual}`);
      console.log(`   - Comercial: ${autoPostoBusiness.comercial}`);
      console.log(`   - Nome Responsável: ${autoPostoBusiness.nomeResponsavel}`);
      console.log(`   - Cidade: ${autoPostoBusiness.cidade}`);
      console.log(`   - WhatsApp: ${autoPostoBusiness.whatsappResponsavel}`);
      console.log(`   - Prospecção: ${autoPostoBusiness.prospeccao}`);
      console.log(`   - Responsável: ${autoPostoBusiness.responsavel}`);
      console.log(`   - Instagram: ${autoPostoBusiness.instagram}`);
      
    } else {
      console.log('❌ Auto Posto Bela Suíça NÃO ENCONTRADO na API');
      
      console.log('\n📋 NEGÓCIOS DISPONÍVEIS:');
      businessResult.data.forEach((business: any, index: number) => {
        console.log(`   ${index + 1}. ${business.nome || business.name || 'SEM NOME'} (ID: ${business.id})`);
      });
    }
    
    // 3. Verificar dados diretos do Supabase
    console.log('\n🗄️ 3. VERIFICANDO DADOS DIRETOS DO SUPABASE...');
    
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Credenciais do Supabase não encontradas');
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: rawBusinesses, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('organization_id', '00000000-0000-0000-0000-000000000001')
        .eq('is_active', true);
      
      if (error) {
        console.log('❌ Erro ao buscar dados diretos:', error);
        return;
      }
      
      console.log(`✅ ${rawBusinesses.length} negócios encontrados no Supabase direto`);
      
      const autoPostoRaw = rawBusinesses.find((business: any) => 
        business.name?.toLowerCase().includes('auto posto') ||
        business.name?.toLowerCase().includes('bela suíça') ||
        business.name?.toLowerCase().includes('bela suica')
      );
      
      if (autoPostoRaw) {
        console.log('✅ DADOS BRUTOS DO SUPABASE:');
        console.log(JSON.stringify(autoPostoRaw, null, 2));
        
        console.log('\n🔄 MAPEAMENTO DA API:');
        console.log(`   - name (Supabase) → nome (API): ${autoPostoRaw.name} → ${autoPostoRaw.name}`);
        console.log(`   - tags[0] (Supabase) → categoria (API): ${autoPostoRaw.tags?.[0]} → ${autoPostoRaw.tags?.[0] || ''}`);
        console.log(`   - custom_fields.plano_atual → planoAtual: ${autoPostoRaw.custom_fields?.plano_atual || ''}`);
        console.log(`   - contact_info.primary_contact → nomeResponsavel: ${autoPostoRaw.contact_info?.primary_contact || ''}`);
        console.log(`   - address.city → cidade: ${autoPostoRaw.address?.city || ''}`);
        console.log(`   - contact_info.whatsapp → whatsappResponsavel: ${autoPostoRaw.contact_info?.whatsapp || ''}`);
        console.log(`   - status → prospeccao: ${autoPostoRaw.status}`);
        
      } else {
        console.log('❌ Auto Posto Bela Suíça NÃO ENCONTRADO no Supabase direto');
        
        console.log('\n📋 NEGÓCIOS NO SUPABASE:');
        rawBusinesses.forEach((business: any, index: number) => {
          console.log(`   ${index + 1}. ${business.name || 'SEM NOME'} (ID: ${business.id})`);
        });
      }
      
    } catch (supabaseError) {
      console.log('❌ Erro ao conectar com Supabase:', supabaseError);
    }
    
    // 4. Verificar mapeamento no modal
    console.log('\n🎯 4. VERIFICANDO MAPEAMENTO NO MODAL...');
    
    console.log('📝 MAPEAMENTO ATUAL NO BusinessModalNew.tsx:');
    console.log('   businessName: business.name || business.businessName || ""');
    console.log('   category: business.categoria || ""');
    console.log('   currentPlan: business.plano || business.currentPlan || ""');
    console.log('   comercial: business.comercial || ""');
    console.log('   nomeResponsavel: business.nomeResponsavel || business.responsavel || ""');
    console.log('   cidade: business.cidade || ""');
    console.log('   whatsappResponsavel: business.whatsappResponsavel || business.whatsapp || ""');
    console.log('   prospeccao: business.prospeccao || business.status || ""');
    
    // 5. Verificar se o problema está na página de negócios
    console.log('\n📄 5. VERIFICANDO PÁGINA DE NEGÓCIOS...');
    
    console.log('📝 DISPLAY NA PÁGINA (linha 255):');
    console.log('   {business.nome || business.name || "Sem Nome"}');
    
    console.log('\n📝 PASSAGEM PARA O MODAL (linha 331):');
    console.log('   onClick={() => handleOpenDetails(business)}');
    console.log('   Onde business é o objeto completo da API');
    
    // 6. Análise final
    console.log('\n🎯 6. ANÁLISE DO PROBLEMA...');
    
    if (autoPostoBusiness) {
      console.log('✅ DADOS ENCONTRADOS - Analisando inconsistência...');
      
      const modalBusinessName = autoPostoBusiness.name || autoPostoBusiness.businessName || '';
      const pageBusinessName = autoPostoBusiness.nome || autoPostoBusiness.name || 'Sem Nome';
      
      console.log('📊 COMPARAÇÃO:');
      console.log(`   - Nome na página: "${pageBusinessName}"`);
      console.log(`   - Nome no modal: "${modalBusinessName}"`);
      
      if (modalBusinessName !== pageBusinessName) {
        console.log('❌ INCONSISTÊNCIA ENCONTRADA!');
        console.log('🔧 PROBLEMA: Mapeamento diferente entre página e modal');
        console.log('💡 SOLUÇÃO: Ajustar mapeamento no modal para usar business.nome');
      } else {
        console.log('✅ Nomes consistentes - problema pode ser em outro lugar');
      }
      
      // Verificar se o nome está vazio
      if (!modalBusinessName || modalBusinessName.trim() === '') {
        console.log('❌ PROBLEMA: Nome do negócio está vazio no modal');
        console.log('🔧 CAUSA: business.name e business.businessName estão vazios');
        console.log('💡 SOLUÇÃO: Usar business.nome como fallback');
      }
      
    } else {
      console.log('❌ DADOS NÃO ENCONTRADOS - Verificar se o negócio existe');
    }
    
    console.log('\n🎯 RESUMO DO DIAGNÓSTICO:');
    console.log('1. ✅ API de negócios funcionando');
    console.log('2. 🔍 Verificação de dados específicos');
    console.log('3. 🗄️ Dados diretos do Supabase');
    console.log('4. 🎯 Mapeamento do modal');
    console.log('5. 📄 Display na página');
    console.log('6. 🔧 Análise de inconsistências');
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
  }
}

if (require.main === module) {
  diagnoseBusiness()
    .then(() => {
      console.log('\n🎉 Diagnóstico concluído');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Diagnóstico falhou:', error);
      process.exit(1);
    });
}

export { diagnoseBusiness };
