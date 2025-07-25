'use server';

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Configuração de autenticação do Google Calendar
function getGoogleCalendarAuth() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Credenciais do Google Calendar não configuradas');
  }

  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

// Interface para evento do calendário
interface CalendarEvent {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  attendees?: string[];
  location?: string;
}

// Função para criar evento no Google Calendar
export async function createCalendarEvent(event: CalendarEvent) {
  try {
    const auth = getGoogleCalendarAuth();
    const calendar = google.calendar({ version: 'v3', auth });
    
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    
    if (!calendarId || calendarId === 'primary') {
      console.log('Simulando criação de evento no calendário:', event.summary);
      return { 
        success: true, 
        message: 'Evento simulado criado com sucesso',
        eventId: `simulated-${Date.now()}`
      };
    }

    const calendarEvent = {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: event.startDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      // attendees: event.attendees?.map(email => ({ email })), // Removido: Service accounts não podem convidar participantes
      location: event.location,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 dia antes
          { method: 'popup', minutes: 60 }, // 1 hora antes
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: calendarEvent,
    });

    return { 
      success: true, 
      data: response.data,
      eventId: response.data.id 
    };
  } catch (error) {
    console.error('Erro ao criar evento no calendário:', error);
    throw new Error('Falha ao criar evento no calendário');
  }
}

// Função para atualizar evento no Google Calendar
export async function updateCalendarEvent(eventId: string, event: Partial<CalendarEvent>) {
  try {
    const auth = getGoogleCalendarAuth();
    const calendar = google.calendar({ version: 'v3', auth });
    
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    
    if (!calendarId || calendarId === 'primary') {
      console.log('Simulando atualização de evento no calendário:', eventId);
      return { 
        success: true, 
        message: 'Evento simulado atualizado com sucesso' 
      };
    }

    const updateData: any = {};
    
    if (event.summary) updateData.summary = event.summary;
    if (event.description) updateData.description = event.description;
    if (event.startDateTime) {
      updateData.start = {
        dateTime: event.startDateTime,
        timeZone: 'America/Sao_Paulo',
      };
    }
    if (event.endDateTime) {
      updateData.end = {
        dateTime: event.endDateTime,
        timeZone: 'America/Sao_Paulo',
      };
    }
    if (event.attendees) {
      updateData.attendees = event.attendees.map(email => ({ email }));
    }
    if (event.location) updateData.location = event.location;

    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: updateData,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao atualizar evento no calendário:', error);
    throw new Error('Falha ao atualizar evento no calendário');
  }
}

// Função para deletar evento do Google Calendar
export async function deleteCalendarEvent(eventId: string) {
  try {
    const auth = getGoogleCalendarAuth();
    const calendar = google.calendar({ version: 'v3', auth });
    
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    
    if (!calendarId || calendarId === 'primary') {
      console.log('Simulando exclusão de evento no calendário:', eventId);
      return { 
        success: true, 
        message: 'Evento simulado excluído com sucesso' 
      };
    }

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar evento no calendário:', error);
    throw new Error('Falha ao deletar evento do calendário');
  }
}

// Função para criar agendamento automático quando negócio entra na fase "Agendamentos"
export async function createSchedulingEvent(businessData: any) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2); // 2 dias a partir de hoje
    startDate.setHours(14, 0, 0, 0); // 14:00

    const endDate = new Date(startDate);
    endDate.setHours(15, 0, 0, 0); // 15:00

    const event: CalendarEvent = {
      summary: `Agendamento: ${businessData.businessName}`,
      description: `
Agendamento para coordenação com criadores
        
Negócio: ${businessData.businessName}
Valor: R$ ${(businessData.value / 1000).toFixed(0)}K
Criadores: ${businessData.creators?.length || 0}
        
Próxima ação: ${businessData.nextAction}
        
Descrição: ${businessData.description}
      `.trim(),
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      location: 'Reunião Online',
      attendees: businessData.creators?.map((creator: any) => creator.email).filter(Boolean) || []
    };

    const result = await createCalendarEvent(event);
    
    console.log(`Evento criado para ${businessData.businessName}:`, result.eventId);
    
    return result;
  } catch (error) {
    console.error('Erro ao criar agendamento automático:', error);
    throw error;
  }
}

// Interface para tarefa
interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_user?: {
    full_name: string;
    email: string;
  };
  business_name?: string;
  campaign_month?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Função para criar evento no calendário a partir de uma tarefa
export async function createTaskCalendarEvent(task: Task) {
  try {
    if (!task.due_date) {
      throw new Error('Tarefa deve ter uma data de vencimento para ser agendada');
    }

    // Garantir que a data seja interpretada corretamente no timezone de São Paulo
    // Formato esperado: "2025-07-25T16:23:00"
    let startDate: Date;
    let endDate: Date;

    if (task.due_date.includes('T')) {
      // Tratar a string como horário local de São Paulo
      // Remover qualquer timezone existente e tratar como local
      const dateStr = task.due_date.replace(/[+-]\d{2}:\d{2}$|Z$/, '');

      // Criar data assumindo que é horário de São Paulo
      const [datePart, timePart] = dateStr.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second = 0] = timePart.split(':').map(Number);

      // Criar data no timezone de São Paulo
      startDate = new Date(year, month - 1, day, hour, minute, second);
      endDate = new Date(startDate.getTime() + (60 * 60 * 1000)); // 1 hora de duração

      console.log(`🕐 Data original: ${task.due_date}`);
      console.log(`🕐 Horário criado: ${hour}:${minute.toString().padStart(2, '0')}`);
      console.log(`🕐 Data local: ${startDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    } else {
      // Fallback para formato de data simples
      startDate = new Date(task.due_date);
      endDate = new Date(startDate.getTime() + (60 * 60 * 1000));
    }

    // Determinar cor baseada na prioridade
    const colorId = task.priority === 'urgent' ? '11' : // Vermelho
                   task.priority === 'high' ? '6' :    // Laranja
                   task.priority === 'medium' ? '5' :  // Amarelo
                   '2'; // Verde para baixa

    const event: CalendarEvent = {
      summary: `📋 ${task.title}`,
      description: `
🎯 TAREFA: ${task.title}

${task.description ? `📝 Descrição: ${task.description}\n` : ''}
${task.business_name ? `🏢 Projeto: ${task.business_name}${task.campaign_month ? ` - ${task.campaign_month}` : ''}\n` : ''}
${task.assigned_user ? `👤 Responsável: ${task.assigned_user.full_name}\n` : ''}
🔥 Prioridade: ${task.priority === 'urgent' ? 'Urgente' :
                task.priority === 'high' ? 'Alta' :
                task.priority === 'medium' ? 'Média' : 'Baixa'}

🔗 Ver tarefa: ${process.env.NEXT_PUBLIC_APP_URL || 'https://crm.criadores.com'}/tasks/${task.id}
      `.trim(),
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString()
      // attendees: task.assigned_user ? [task.assigned_user.email] : [] // Removido: Service accounts não podem convidar participantes
    };

    const result = await createCalendarEvent(event);

    console.log(`📅 Evento criado para tarefa "${task.title}":`, result.eventId);

    return {
      success: true,
      eventId: result.eventId,
      message: 'Tarefa agendada no Google Calendar com sucesso!'
    };
  } catch (error) {
    console.error('❌ Erro ao agendar tarefa no calendário:', error);
    throw new Error('Falha ao agendar tarefa no calendário');
  }
}

// Função para atualizar evento de tarefa no calendário
export async function updateTaskCalendarEvent(eventId: string, task: Task) {
  try {
    if (!task.due_date) {
      throw new Error('Tarefa deve ter uma data de vencimento para ser atualizada');
    }

    const dueDate = new Date(task.due_date);
    const startDate = new Date(dueDate);
    const endDate = new Date(dueDate.getTime() + (60 * 60 * 1000));

    const event: Partial<CalendarEvent> = {
      summary: `📋 ${task.title}`,
      description: `
🎯 TAREFA: ${task.title}

${task.description ? `📝 Descrição: ${task.description}\n` : ''}
${task.business_name ? `🏢 Projeto: ${task.business_name}${task.campaign_month ? ` - ${task.campaign_month}` : ''}\n` : ''}
${task.assigned_user ? `👤 Responsável: ${task.assigned_user.full_name}\n` : ''}
🔥 Prioridade: ${task.priority === 'urgent' ? 'Urgente' :
                task.priority === 'high' ? 'Alta' :
                task.priority === 'medium' ? 'Média' : 'Baixa'}

🔗 Ver tarefa: ${process.env.NEXT_PUBLIC_APP_URL || 'https://crm.criadores.com'}/tasks/${task.id}
      `.trim(),
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      attendees: task.assigned_user ? [task.assigned_user.email] : []
    };

    const result = await updateCalendarEvent(eventId, event);

    console.log(`📅 Evento atualizado para tarefa "${task.title}"`);

    return {
      success: true,
      message: 'Agendamento da tarefa atualizado no Google Calendar!'
    };
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento da tarefa:', error);
    throw new Error('Falha ao atualizar agendamento da tarefa');
  }
}

// Função para remover evento de tarefa do calendário
export async function deleteTaskCalendarEvent(eventId: string) {
  try {
    const result = await deleteCalendarEvent(eventId);

    console.log(`📅 Evento de tarefa removido do calendário`);

    return {
      success: true,
      message: 'Agendamento removido do Google Calendar!'
    };
  } catch (error) {
    console.error('❌ Erro ao remover agendamento da tarefa:', error);
    throw new Error('Falha ao remover agendamento da tarefa');
  }
}

// Função para listar eventos do calendário
export async function listCalendarEvents(timeMin?: string, timeMax?: string) {
  try {
    const auth = getGoogleCalendarAuth();
    const calendar = google.calendar({ version: 'v3', auth });
    
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    
    if (!calendarId || calendarId === 'primary') {
      console.log('Simulando listagem de eventos do calendário');
      return { 
        success: true, 
        events: [
          {
            id: 'simulated-1',
            summary: 'Agendamento: Loja de Roupas Fashion',
            start: { dateTime: new Date().toISOString() },
            end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
          }
        ]
      };
    }

    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return { 
      success: true, 
      events: response.data.items || [] 
    };
  } catch (error) {
    console.error('Erro ao listar eventos do calendário:', error);
    throw new Error('Falha ao listar eventos do calendário');
  }
}
