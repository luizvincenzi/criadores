import { NextRequest, NextResponse } from 'next/server';
import { getCreatorWorks } from '@/app/actions/sheetsActions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorName = searchParams.get('name');

    if (!creatorName) {
      return NextResponse.json({
        success: false,
        error: 'Nome do criador é obrigatório'
      }, { status: 400 });
    }

    const works = await getCreatorWorks(creatorName);

    return NextResponse.json({
      success: true,
      works: works
    });

  } catch (error) {
    console.error('❌ Erro ao buscar trabalhos do criador:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
