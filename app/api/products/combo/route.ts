import { NextResponse } from 'next/server';
import { productsService } from '@/lib/productsService';

export async function GET() {
  try {
    const comboPrice = await productsService.getComboPrice();
    return NextResponse.json({ success: true, data: comboPrice });
  } catch (error: any) {
    console.error('Erro ao calcular preço do combo:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

