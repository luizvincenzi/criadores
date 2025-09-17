import { NextRequest, NextResponse } from 'next/server';

/**
 * API para receber notificações de novos leads
 * Pode ser usada para integrar com serviços externos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadData, businessId, leadId, source = 'chatbot' } = body;
    
    console.log('🔔 [NEW LEAD NOTIFICATION] Novo lead recebido!');
    console.log('📋 Dados:', JSON.stringify(body, null, 2));
    
    // 1. LOG ESTRUTURADO PARA MONITORAMENTO
    const notification = {
      timestamp: new Date().toISOString(),
      event: 'new_lead',
      source,
      data: {
        leadId,
        businessId,
        name: leadData.name,
        email: leadData.email,
        whatsapp: leadData.whatsapp,
        type: leadData.userType,
        businessName: leadData.userType === 'empresa' ? leadData.businessName : null,
        segment: leadData.userType === 'empresa' ? leadData.businessSegment : leadData.creatorNiche
      }
    };
    
    // Log estruturado que pode ser capturado por sistemas de monitoramento
    console.log('📊 [LEAD_NOTIFICATION]', JSON.stringify(notification));
    
    // 2. WEBHOOK PARA ZAPIER/MAKE.COM (se configurado)
    const zapierWebhook = process.env.ZAPIER_NEW_LEAD_WEBHOOK;
    if (zapierWebhook) {
      try {
        await fetch(zapierWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notification)
        });
        console.log('✅ [NEW LEAD NOTIFICATION] Zapier webhook enviado');
      } catch (error) {
        console.log('⚠️ [NEW LEAD NOTIFICATION] Erro no Zapier webhook:', error);
      }
    }
    
    // 3. DISCORD WEBHOOK (gratuito e fácil de configurar)
    const discordWebhook = process.env.DISCORD_NEW_LEAD_WEBHOOK;
    if (discordWebhook) {
      try {
        const discordMessage = {
          embeds: [{
            title: '🚨 Novo Lead do Chatbot!',
            color: 0x00ff00, // Verde
            fields: [
              { name: '👤 Nome', value: leadData.name, inline: true },
              { name: '📧 Email', value: leadData.email, inline: true },
              { name: '📱 WhatsApp', value: leadData.whatsapp, inline: true },
              { name: '🏢 Tipo', value: leadData.userType === 'empresa' ? 'Empresa' : 'Criador', inline: true },
              { name: '🎫 Protocolo', value: leadId, inline: true },
              { name: '⏰ Horário', value: new Date().toLocaleString('pt-BR'), inline: true }
            ],
            footer: {
              text: `CRM Criadores • ${source}`
            }
          }]
        };
        
        if (leadData.userType === 'empresa' && leadData.businessName) {
          discordMessage.embeds[0].fields.push({
            name: '🏢 Empresa',
            value: leadData.businessName,
            inline: true
          });
        }
        
        await fetch(discordWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discordMessage)
        });
        
        console.log('✅ [NEW LEAD NOTIFICATION] Discord webhook enviado');
      } catch (error) {
        console.log('⚠️ [NEW LEAD NOTIFICATION] Erro no Discord webhook:', error);
      }
    }
    
    // 4. SLACK WEBHOOK (se configurado)
    const slackWebhook = process.env.SLACK_NEW_LEAD_WEBHOOK;
    if (slackWebhook) {
      try {
        const slackMessage = {
          text: `🚨 Novo Lead do Chatbot!`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🚨 Novo Lead do Chatbot!'
              }
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*👤 Nome:*\n${leadData.name}` },
                { type: 'mrkdwn', text: `*📧 Email:*\n${leadData.email}` },
                { type: 'mrkdwn', text: `*📱 WhatsApp:*\n${leadData.whatsapp}` },
                { type: 'mrkdwn', text: `*🏢 Tipo:*\n${leadData.userType === 'empresa' ? 'Empresa' : 'Criador'}` },
                { type: 'mrkdwn', text: `*🎫 Protocolo:*\n${leadId}` },
                { type: 'mrkdwn', text: `*⏰ Horário:*\n${new Date().toLocaleString('pt-BR')}` }
              ]
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '📱 WhatsApp'
                  },
                  url: `https://wa.me/55${leadData.whatsapp.replace(/\D/g, '')}`
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '🔗 Ver no CRM'
                  },
                  url: `https://criadores.app/businesses/${businessId}`
                }
              ]
            }
          ]
        };
        
        await fetch(slackWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slackMessage)
        });
        
        console.log('✅ [NEW LEAD NOTIFICATION] Slack webhook enviado');
      } catch (error) {
        console.log('⚠️ [NEW LEAD NOTIFICATION] Erro no Slack webhook:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notificação processada',
      timestamp: notification.timestamp
    });
    
  } catch (error) {
    console.error('❌ [NEW LEAD NOTIFICATION] Erro:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno'
    }, { status: 500 });
  }
}

/**
 * GET - Endpoint para testar notificações
 */
export async function GET() {
  return NextResponse.json({
    message: 'API de notificações de novos leads',
    endpoints: {
      discord: !!process.env.DISCORD_NEW_LEAD_WEBHOOK,
      slack: !!process.env.SLACK_NEW_LEAD_WEBHOOK,
      zapier: !!process.env.ZAPIER_NEW_LEAD_WEBHOOK
    },
    example: {
      leadData: {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        whatsapp: '11999999999',
        userType: 'empresa',
        businessName: 'Empresa Exemplo'
      },
      businessId: 'uuid-do-business',
      leadId: 'CRI123456',
      source: 'chatbot'
    }
  });
}
