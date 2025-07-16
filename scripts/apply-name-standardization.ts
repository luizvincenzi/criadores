import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

async function applyNameStandardization() {
  console.log('🔧 APLICANDO PADRONIZAÇÃO DO CAMPO NOME DO BUSINESS\n');
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Credenciais do Supabase não encontradas');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Verificar estrutura atual
    console.log('🔍 1. VERIFICANDO ESTRUTURA ATUAL...');
    
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name, slug')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001')
      .eq('is_active', true);
    
    if (fetchError) {
      throw new Error(`Erro ao buscar negócios: ${fetchError.message}`);
    }
    
    console.log(`✅ ${businesses.length} negócios encontrados`);
    
    // 2. Analisar dados atuais
    console.log('\n📊 2. ANALISANDO DADOS ATUAIS...');
    
    const emptyNames = businesses.filter(b => !b.name || b.name.trim() === '');
    const validNames = businesses.filter(b => b.name && b.name.trim() !== '');
    const emptySlugs = businesses.filter(b => !b.slug || b.slug.trim() === '');
    
    console.log(`📋 ESTATÍSTICAS:
   - Total de negócios: ${businesses.length}
   - Nomes válidos: ${validNames.length} (${Math.round(validNames.length / businesses.length * 100)}%)
   - Nomes vazios: ${emptyNames.length}
   - Slugs vazios: ${emptySlugs.length}`);
    
    if (validNames.length > 0) {
      console.log('\n📝 EXEMPLOS DE NOMES ATUAIS:');
      validNames.slice(0, 5).forEach((business, index) => {
        console.log(`   ${index + 1}. "${business.name}" (slug: ${business.slug || 'vazio'})`);
      });
    }
    
    // 3. Verificar duplicatas
    console.log('\n🔍 3. VERIFICANDO DUPLICATAS...');
    
    const nameCount = new Map();
    validNames.forEach(business => {
      const name = business.name.trim().toLowerCase();
      nameCount.set(name, (nameCount.get(name) || 0) + 1);
    });
    
    const duplicates = Array.from(nameCount.entries()).filter(([name, count]) => count > 1);
    
    if (duplicates.length > 0) {
      console.log('⚠️ NOMES DUPLICADOS ENCONTRADOS:');
      duplicates.forEach(([name, count]) => {
        console.log(`   - "${name}" aparece ${count} vezes`);
      });
    } else {
      console.log('✅ Nenhuma duplicata encontrada');
    }
    
    // 4. Função para gerar slug
    function generateSlug(name: string): string {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim()
        .substring(0, 50) // Limita tamanho
        .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
    }
    
    // 5. Atualizar slugs vazios
    console.log('\n🔧 4. ATUALIZANDO SLUGS VAZIOS...');
    
    let updatedSlugs = 0;
    const slugsToUpdate = businesses.filter(b => b.name && (!b.slug || b.slug.trim() === ''));
    
    for (const business of slugsToUpdate) {
      const baseSlug = generateSlug(business.name);
      let finalSlug = baseSlug;
      let counter = 0;
      
      // Verificar unicidade do slug
      while (counter < 100) {
        const { data: existing } = await supabase
          .from('businesses')
          .select('id')
          .eq('slug', finalSlug)
          .neq('id', business.id)
          .single();
        
        if (!existing) {
          break; // Slug é único
        }
        
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }
      
      // Atualizar slug
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ 
          slug: finalSlug,
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id);
      
      if (updateError) {
        console.log(`❌ Erro ao atualizar slug para "${business.name}": ${updateError.message}`);
      } else {
        updatedSlugs++;
        if (updatedSlugs <= 5) {
          console.log(`   ✅ Slug criado: "${business.name}" → "${finalSlug}"`);
        }
      }
    }
    
    console.log(`✅ ${updatedSlugs} slugs atualizados`);
    
    // 6. Verificar estado final
    console.log('\n📊 5. VERIFICANDO ESTADO FINAL...');
    
    const { data: finalBusinesses, error: finalError } = await supabase
      .from('businesses')
      .select('id, name, slug')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001')
      .eq('is_active', true);
    
    if (finalError) {
      throw new Error(`Erro ao verificar estado final: ${finalError.message}`);
    }
    
    const finalValidNames = finalBusinesses.filter(b => b.name && b.name.trim() !== '');
    const finalValidSlugs = finalBusinesses.filter(b => b.slug && b.slug.trim() !== '');
    
    console.log(`📋 ESTATÍSTICAS FINAIS:
   - Total de negócios: ${finalBusinesses.length}
   - Nomes válidos: ${finalValidNames.length} (${Math.round(finalValidNames.length / finalBusinesses.length * 100)}%)
   - Slugs válidos: ${finalValidSlugs.length} (${Math.round(finalValidSlugs.length / finalBusinesses.length * 100)}%)`);
    
    // 7. Testar busca por nome
    console.log('\n🔍 6. TESTANDO BUSCA POR NOME...');
    
    if (finalValidNames.length > 0) {
      const testBusiness = finalValidNames[0];
      
      const { data: searchResult, error: searchError } = await supabase
        .from('businesses')
        .select('id, name, slug')
        .eq('name', testBusiness.name)
        .single();
      
      if (searchError) {
        console.log(`❌ Erro na busca por nome: ${searchError.message}`);
      } else {
        console.log(`✅ Busca por nome funcionando: "${searchResult.name}" encontrado`);
      }
    }
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Banco de dados padronizado');
    console.log('2. 🔄 Atualizar APIs para usar apenas "name"');
    console.log('3. 🔄 Atualizar frontend para usar apenas "name"');
    console.log('4. 🔄 Remover referências a "businessName" e "nome"');
    console.log('5. 🧪 Testar todas as funcionalidades');
    
    return {
      success: true,
      totalBusinesses: finalBusinesses.length,
      validNames: finalValidNames.length,
      validSlugs: finalValidSlugs.length,
      updatedSlugs
    };
    
  } catch (error) {
    console.error('❌ Erro na padronização:', error);
    throw error;
  }
}

if (require.main === module) {
  applyNameStandardization()
    .then((result) => {
      console.log('\n🎉 Padronização concluída com sucesso!');
      console.log(`📊 Resultado: ${result.validNames}/${result.totalBusinesses} nomes válidos`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Padronização falhou:', error);
      process.exit(1);
    });
}

export { applyNameStandardization };
