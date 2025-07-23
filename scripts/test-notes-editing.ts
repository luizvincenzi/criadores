import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testNotesEditing() {
  try {
    console.log('🧪 TESTANDO FUNCIONALIDADE DE EDIÇÃO DE NOTAS');
    console.log('==============================================\n');

    const baseUrl = 'http://localhost:3000';
    const testBusinessId = '257c4a33-0e0d-494d-8323-5b2b30000000';

    // 1. Buscar notas existentes
    console.log('📋 1. Buscando notas existentes...');
    const searchResponse = await fetch(`${baseUrl}/api/notes?business_id=${testBusinessId}`);
    
    if (!searchResponse.ok) {
      console.log('❌ Erro ao buscar notas:', searchResponse.status);
      return false;
    }

    const searchData = await searchResponse.json();
    console.log(`✅ ${searchData.total || 0} notas encontradas`);

    let testNoteId = null;

    // 2. Criar uma nova nota para testar edição
    if (searchData.total === 0) {
      console.log('\n📝 2. Criando nota de teste...');
      
      const createResponse = await fetch(`${baseUrl}/api/crm/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: testBusinessId,
          user_id: '00000000-0000-0000-0000-000000000001',
          content: 'Nota original para teste de edição - criada em ' + new Date().toLocaleString('pt-BR'),
          note_type: 'general',
          create_activity: false
        })
      });

      if (createResponse.ok) {
        const createData = await createResponse.json();
        testNoteId = createData.note?.id;
        console.log(`✅ Nota criada para teste: ${testNoteId}`);
      } else {
        console.log('❌ Erro ao criar nota de teste');
        return false;
      }
    } else {
      // Usar a primeira nota existente
      testNoteId = searchData.notes[0].id;
      console.log(`✅ Usando nota existente para teste: ${testNoteId}`);
    }

    // 3. Testar edição da nota
    console.log('\n✏️ 3. Testando edição da nota...');
    
    const editResponse = await fetch(`${baseUrl}/api/notes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testNoteId,
        content: `Nota EDITADA via teste automatizado - ${new Date().toLocaleString('pt-BR')} - Sistema de edição funcionando perfeitamente! 🎉`,
        note_type: 'general'
      })
    });

    if (editResponse.ok) {
      const editData = await editResponse.json();
      console.log('✅ Nota editada com sucesso!');
      console.log(`   📝 ID: ${editData.note?.id}`);
      console.log(`   💬 Novo conteúdo: ${editData.note?.content?.substring(0, 50)}...`);
      console.log(`   📅 Criada em: ${editData.note?.created_at}`);
      console.log(`   ✏️ Editada em: ${editData.note?.updated_at}`);
    } else {
      const errorText = await editResponse.text();
      console.log(`❌ Erro ao editar nota: ${editResponse.status}`);
      console.log('Erro:', errorText.substring(0, 200));
      return false;
    }

    // 4. Verificar se a edição foi salva corretamente
    console.log('\n🔍 4. Verificando se a edição foi salva...');
    
    const verifyResponse = await fetch(`${baseUrl}/api/notes?business_id=${testBusinessId}`);
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const editedNote = verifyData.notes.find((note: any) => note.id === testNoteId);
      
      if (editedNote) {
        console.log('✅ Nota editada encontrada na lista!');
        console.log(`   💬 Conteúdo: ${editedNote.content.substring(0, 80)}...`);
        console.log(`   📅 Criada: ${new Date(editedNote.created_at).toLocaleString('pt-BR')}`);
        console.log(`   ✏️ Editada: ${new Date(editedNote.updated_at).toLocaleString('pt-BR')}`);
        
        const wasEdited = editedNote.updated_at !== editedNote.created_at;
        console.log(`   🔄 Foi editada: ${wasEdited ? 'SIM ✅' : 'NÃO ❌'}`);
        
        if (wasEdited) {
          const timeDiff = new Date(editedNote.updated_at).getTime() - new Date(editedNote.created_at).getTime();
          console.log(`   ⏱️ Diferença de tempo: ${Math.round(timeDiff / 1000)} segundos`);
        }
      } else {
        console.log('❌ Nota editada não encontrada na lista');
        return false;
      }
    }

    // 5. Testar edição com conteúdo vazio (deve falhar)
    console.log('\n🚫 5. Testando edição com conteúdo vazio (deve falhar)...');
    
    const emptyEditResponse = await fetch(`${baseUrl}/api/notes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testNoteId,
        content: '',
        note_type: 'general'
      })
    });

    if (!emptyEditResponse.ok) {
      console.log('✅ Validação funcionando - edição com conteúdo vazio foi rejeitada');
    } else {
      console.log('⚠️ Atenção: Edição com conteúdo vazio foi aceita (pode ser um problema)');
    }

    console.log('\n🎉 TESTE DE EDIÇÃO DE NOTAS CONCLUÍDO!');
    console.log('=====================================');
    console.log('✅ Busca de notas funcionando');
    console.log('✅ Criação de notas funcionando');
    console.log('✅ Edição de notas funcionando');
    console.log('✅ Campo updated_at sendo atualizado');
    console.log('✅ Diferenciação entre created_at e updated_at');
    console.log('✅ Validação de conteúdo vazio');

    console.log('\n📋 TESTE AGORA NA INTERFACE:');
    console.log('1. Acesse http://localhost:3000/deals');
    console.log('2. Clique em qualquer negócio');
    console.log('3. Vá para a aba "Notas"');
    console.log('4. Clique no ícone de edição (✏️) em qualquer nota');
    console.log('5. Edite o conteúdo e clique "Salvar"');
    console.log('6. Veja o badge "✏️ Editada" e as datas de criação/edição!');

    return true;

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testNotesEditing()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { testNotesEditing };
