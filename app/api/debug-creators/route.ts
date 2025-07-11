import { NextResponse } from 'next/server';
import { getCreatorsData } from '@/app/actions/sheetsActions';

export async function GET() {
  try {
    const creators = await getCreatorsData();
    
    return NextResponse.json({
      success: true,
      count: creators.length,
      sample: creators.slice(0, 5), // Primeiros 5 criadores
      data: creators
    });
  } catch (error) {
    console.error('Erro ao buscar criadores:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
