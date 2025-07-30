import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'portal-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verificar token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      // Token inválido, mas ainda assim vamos tentar remover a sessão
      console.log('Token inválido no logout, tentando remover sessão...');
    }

    // Remover sessão do banco
    const { error } = await supabase
      .from('portal_sessions')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('❌ Erro ao remover sessão:', error);
    }

    console.log('✅ Portal Logout: Sessão removida com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro na API de logout do portal:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
