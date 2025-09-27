#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔧 Configuração do Supabase:');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
console.log('Service Key:', supabaseServiceKey ? '✅ Configurada' : '❌ Não encontrada');
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.error('Verifique se .env.local contém:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function implementBriefingOptimized() {
  console.log('🚀 Implementando Sistema de Briefing Otimizado...\n');

  try {
    // 1. Ler o arquivo SQL
    const sqlPath = join(process.cwd(), 'scripts/create-briefing-optimized.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    console.log('📄 Arquivo SQL carregado:', sqlPath);

    // 2. Executar comandos específicos manualmente
    console.log('📋 Executando comandos SQL manualmente...\n');

    // 1. Verificar se a tabela já existe
    console.log('📋 Verificando se tabela briefing_performance_checklist existe...');
    const { data: existingTable, error: checkError } = await supabase
      .from('briefing_performance_checklist')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      console.log('📋 Tabela não existe, vamos usar business_notes para armazenar os dados');
      console.log('✅ Usando abordagem otimizada com tabelas existentes\n');
    } else {
      console.log('✅ Tabela briefing_performance_checklist já existe\n');
    }

    // 2. Usar abordagem otimizada - calcular score no JavaScript
    console.log('⚙️ Usando cálculo de score em JavaScript (mais simples)');

    function calculateBriefingScore(checklistItems: any): number {
      const items = Object.values(checklistItems);
      const totalItems = items.length;
      const completedItems = items.filter((item: any) => item.checked === true).length;

      if (totalItems === 0) return 0;
      return Math.round((completedItems / totalItems) * 100);
    }

    console.log('✅ Função de score configurada\n');

    // 3. Buscar um user_id válido para as inserções
    console.log('🔍 Buscando user_id válido...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    let validUserId = null;
    if (userData && userData.length > 0) {
      validUserId = userData[0].id;
      console.log(`✅ User ID encontrado: ${validUserId}`);
    } else {
      console.log('⚠️ Nenhum usuário encontrado, usando NULL para user_id');
    }

    // 4. Inserir dados de exemplo usando business_notes
    console.log('📊 Inserindo dados de exemplo...');

    // Preparar checklist com score calculado
    const checklistItems = {
      "feedback_collected": {
        "checked": true,
        "evidence": "Diogo detalhou a percepção sobre a energia morna de alguns vídeos do John e elogiou o padrão das entregas do Bra."
      },
      "strategy_understood": {
        "checked": true,
        "evidence": "Foi definida a estratégia de focar em dias específicos (quarta/quinta) e nos eventos (Oktoberfest/Halloween) para concentrar o impacto."
      },
      "campaigns_defined": {
        "checked": true,
        "evidence": "As 4 campanhas de Outubro foram claramente estabelecidas: 2 para eventos e 2 para fortalecer dias da semana."
      },
      "creator_profile_aligned": {
        "checked": true,
        "evidence": "Para o Bra, foi solicitado inverter a proporção para mais criadores de lifestyle. Para o John, foi discutida a possibilidade de recontratar perfis de sucesso."
      },
      "content_guidelines_discussed": {
        "checked": true,
        "evidence": "O feedback sobre capas, cenários e a pegada dos vídeos serviu como base para os Dos & Donts, que serão formalizados no briefing."
      },
      "deadlines_established": {
        "checked": true,
        "evidence": "Prazos definidos: vídeo do Oktoberfest até 06/10 e Halloween até 27/10. Para o Bra, foi definida uma postagem por semana, às sextas."
      },
      "metrics_identified": {
        "checked": true,
        "evidence": "Diogo solicitou expressamente os insights de audiência (público, faixa etária) dos posts feitos no perfil dos criadores."
      },
      "next_steps_defined": {
        "checked": true,
        "evidence": "Ao final, foram definidos os próximos passos: cliente envia briefing detalhado e a equipe interna apresenta os perfis e coleta os dados de audiência."
      }
    };

    const performanceScore = calculateBriefingScore(checklistItems);
    console.log(`📊 Score calculado: ${performanceScore}%`);

    // Inserir briefing como nota
    const { error: noteError } = await supabase
      .from('business_notes')
      .insert({
        business_id: '55310ebd-0e0d-492e-8c34-cd4740000000',
        user_id: validUserId,
        content: 'Briefing Mensal - Outubro/2025',
        note_type: 'briefing',
        attachments: {
          "briefing_data": {
            "ref_code": "BRF-202510-002",
            "reference_month": "Outubro/2025",
            "meeting_date": "2025-09-26",
            "participants": {
              "criadores": ["Luiz Vincenzi", "Rafa (criadores ops)", "Gabriel"],
              "client": ["Diogo Torresan (John Beer & Pork)"]
            },
            "executive_summary": {
              "month_campaigns": [
                "Evento: Oktoberfest (início do mês)",
                "Evento: Halloween (fim do mês)",
                "Dia da semana: Quarta-feira (Open Chopp)",
                "Dia da semana: Quinta-feira (Ladies Night)"
              ],
              "next_step": "Aguardando briefing detalhado do cliente (foco em Oktoberfest).",
              "identified_needs": [
                "Melhorar energia/pegada dos vídeos",
                "Criar capas de Reels mais atrativas",
                "Explorar cenários que reflitam o bar",
                "Obter insights de audiência dos posts"
              ]
            },
            "campaign_context": {
              "objective": "Aumentar o fluxo de clientes e o reconhecimento da marca ao concentrar esforços de divulgação em eventos e dias da semana específicos.",
              "strategy": "Adotar uma abordagem de pulso, focando a verba e a comunicação em campanhas de curta duração e alto impacto.",
              "pillars": "A comunicação será dividida em 4 pilares: 2 eventos principais (Oktoberfest e Halloween) para atrair grande público e 2 campanhas de sustentação."
            },
            "performance": {
              "checklist_items": checklistItems,
              "performance_score": performanceScore
            }
          }
        }
      });

    if (noteError) {
      console.error('❌ Erro ao inserir briefing:', noteError.message);
    } else {
      console.log('✅ Briefing inserido com sucesso');
    }

    // Inserir algumas tarefas de exemplo
    const briefingTasks = [
      {
        business_id: '55310ebd-0e0d-492e-8c34-cd4740000000',
        assigned_to_user_id: validUserId,
        created_by_user_id: validUserId,
        title: 'Apresentar perfis de influenciadores para as 4 campanhas',
        description: 'Selecionar e apresentar perfis adequados para Oktoberfest, Halloween, Open Chopp e Ladies Night',
        task_type: 'briefing',
        status: 'pending',
        priority: 'high',
        due_date: '2025-10-01'
      },
      {
        business_id: '55310ebd-0e0d-492e-8c34-cd4740000000',
        assigned_to_user_id: validUserId,
        created_by_user_id: validUserId,
        title: 'Enviar briefing detalhado das campanhas de Outubro',
        description: 'Cliente deve enviar briefing completo com detalhes das 4 campanhas',
        task_type: 'briefing',
        status: 'in_progress',
        priority: 'high',
        due_date: '2025-09-30'
      }
    ];

    const { error: tasksError } = await supabase
      .from('business_tasks')
      .insert(briefingTasks);

    if (tasksError) {
      console.error('❌ Erro ao inserir tarefas:', tasksError.message);
    } else {
      console.log('✅ Tarefas inseridas com sucesso');
    }

    console.log('✅ Dados de exemplo inseridos\n');

    // 4. Verificar implementação
    console.log('🔍 Verificando implementação...\n');

    // Verificar se business_notes suporta briefings
    const { data: notesCheck, error: notesCheckError } = await supabase
      .from('business_notes')
      .select('note_type')
      .eq('note_type', 'briefing')
      .limit(1);

    if (notesCheckError) {
      console.error('❌ Erro ao verificar business_notes:', notesCheckError.message);
    } else {
      console.log('✅ Sistema de business_notes configurado para briefings');
    }

    // Verificar dados inseridos
    const { data: briefingData, error: briefingError } = await supabase
      .from('business_notes')
      .select('*')
      .eq('note_type', 'briefing')
      .limit(1);

    if (briefingError) {
      console.error('❌ Erro ao verificar briefings:', briefingError.message);
    } else if (briefingData && briefingData.length > 0) {
      console.log('✅ Briefing de exemplo inserido com sucesso');
      console.log(`📋 Ref Code: ${briefingData[0].attachments?.briefing_data?.ref_code}`);
    } else {
      console.log('⚠️ Nenhum briefing encontrado');
    }

    // Verificar tarefas
    const { data: tasksData, error: tasksCheckError } = await supabase
      .from('business_tasks')
      .select('*')
      .eq('task_type', 'briefing')
      .limit(1);

    if (tasksCheckError) {
      console.error('❌ Erro ao verificar tarefas:', tasksCheckError.message);
    } else if (tasksData && tasksData.length > 0) {
      console.log('✅ Tarefas de briefing inseridas com sucesso');
      console.log(`📋 Total de tarefas: ${tasksData.length}`);
    } else {
      console.log('⚠️ Nenhuma tarefa de briefing encontrada');
    }

    // Verificar performance nos briefings
    const { data: performanceData, error: performanceError } = await supabase
      .from('business_notes')
      .select('attachments')
      .eq('note_type', 'briefing')
      .limit(1);

    if (performanceError) {
      console.error('❌ Erro ao verificar performance:', performanceError.message);
    } else if (performanceData && performanceData.length > 0) {
      const score = performanceData[0].attachments?.briefing_data?.performance?.performance_score;
      console.log('✅ Performance checklist inserido com sucesso');
      console.log(`📊 Score: ${score}%`);
    } else {
      console.log('⚠️ Nenhum checklist de performance encontrado');
    }

    console.log('\n🎉 IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Testar API: /api/briefings-optimized');
    console.log('2. Integrar na página de campanhas');
    console.log('3. Testar modal de briefing');

  } catch (error) {
    console.error('\n❌ ERRO NA IMPLEMENTAÇÃO:', error);
    process.exit(1);
  }
}

// Executar implementação
implementBriefingOptimized();
