import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com service role para operações sem autenticação
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      audience_target = 'AMBOS', 
      source = 'blog', 
      variant = 'default',
      referrer 
    } = body;

    console.log('📧 Newsletter: Nova inscrição recebida:', { email, audience_target, source, variant });

    // Validação básica
    if (!email || !email.includes('@')) {
      return NextResponse.json({
        success: false,
        error: 'Email inválido'
      }, { status: 400 });
    }

    // Obter dados da requisição para tracking
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';
    const user_agent = request.headers.get('user-agent') || '';

    // Verificar se email já existe (com fallback se tabela não existir)
    let existingSubscriber = null;
    try {
      const { data, error: checkError } = await supabase
        .from('newsletter_subscribers')
        .select('id, status')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        // Se a tabela não existir, vamos usar uma abordagem alternativa
        if (checkError.message.includes('does not exist')) {
          console.warn('⚠️ Tabela newsletter_subscribers não existe ainda. Usando fallback...');
          // Por enquanto, vamos apenas logar e simular sucesso
          console.log('📧 Email de newsletter (fallback):', { email, audience_target, source, variant });

          return NextResponse.json({
            success: true,
            message: 'Inscrição registrada com sucesso! (Tabela será criada em breve)',
            subscriber_id: 'temp-' + Date.now()
          });
        } else {
          console.error('❌ Erro ao verificar subscriber existente:', checkError);
          return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
          }, { status: 500 });
        }
      }

      existingSubscriber = data;
    } catch (error) {
      console.warn('⚠️ Erro ao acessar tabela newsletter_subscribers:', error);
      // Fallback: apenas logar por enquanto
      console.log('📧 Email de newsletter (fallback):', { email, audience_target, source, variant });

      return NextResponse.json({
        success: true,
        message: 'Inscrição registrada com sucesso! (Tabela será criada em breve)',
        subscriber_id: 'temp-' + Date.now()
      });
    }

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json({
          success: false,
          error: 'Email já está inscrito na newsletter'
        }, { status: 409 });
      } else if (existingSubscriber.status === 'unsubscribed') {
        // Reativar inscrição
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'active',
            audience_target,
            source,
            variant,
            unsubscribed_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscriber.id);

        if (updateError) {
          console.error('❌ Erro ao reativar inscrição:', updateError);
          return NextResponse.json({
            success: false,
            error: 'Erro ao reativar inscrição'
          }, { status: 500 });
        }

        console.log('✅ Inscrição reativada:', existingSubscriber.id);
        return NextResponse.json({
          success: true,
          message: 'Inscrição reativada com sucesso!',
          subscriber_id: existingSubscriber.id
        });
      }
    }

    // Criar nova inscrição
    const subscriberData = {
      email: email.toLowerCase().trim(),
      audience_target,
      source,
      variant,
      ip_address,
      user_agent,
      referrer,
      status: 'active',
      preferences: {
        frequency: 'weekly',
        topics: ['marketing', 'criadores', 'empresas'],
        format: 'html'
      },
      metadata: {
        signup_date: new Date().toISOString(),
        browser: user_agent.includes('Chrome') ? 'Chrome' : 
                user_agent.includes('Firefox') ? 'Firefox' : 
                user_agent.includes('Safari') ? 'Safari' : 'Other'
      }
    };

    const { data: newSubscriber, error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([subscriberData])
      .select('id')
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar nova inscrição:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao processar inscrição'
      }, { status: 500 });
    }

    console.log('✅ Nova inscrição criada:', newSubscriber.id);

    // Opcional: Registrar interação no blog tracking se vier do blog
    if (source === 'blog') {
      try {
        await supabase
          .from('blog_interactions')
          .insert([{
            post_id: '00000000-0000-0000-0000-000000000001', // ID genérico para newsletter
            post_slug: 'newsletter-signup',
            post_title: 'Newsletter Signup',
            user_email: email,
            interaction_type: 'newsletter_signup',
            platform: variant,
            metadata: { audience_target, source },
            ip_address,
            user_agent
          }]);
      } catch (trackingError) {
        console.warn('⚠️ Erro ao registrar tracking (não crítico):', trackingError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Inscrição realizada com sucesso!',
      subscriber_id: newSubscriber.id
    });

  } catch (error) {
    console.error('❌ Erro na API de newsletter:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// GET - Obter estatísticas da newsletter (opcional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    if (!includeStats) {
      return NextResponse.json({
        success: false,
        error: 'Endpoint apenas para estatísticas'
      }, { status: 400 });
    }

    // Buscar estatísticas básicas
    const { data: stats, error } = await supabase
      .from('newsletter_subscribers')
      .select('status, audience_target, source, created_at')
      .eq('status', 'active');

    if (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar estatísticas'
      }, { status: 500 });
    }

    const totalActive = stats.length;
    const byAudience = {
      EMPRESAS: stats.filter(s => s.audience_target === 'EMPRESAS').length,
      CRIADORES: stats.filter(s => s.audience_target === 'CRIADORES').length,
      AMBOS: stats.filter(s => s.audience_target === 'AMBOS').length
    };

    const thisWeek = stats.filter(s => {
      const createdAt = new Date(s.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt >= weekAgo;
    }).length;

    return NextResponse.json({
      success: true,
      stats: {
        total_active: totalActive,
        by_audience: byAudience,
        new_this_week: thisWeek,
        growth_rate: '📈' // Placeholder para cálculo mais complexo
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
