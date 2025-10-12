import { NextRequest, NextResponse } from 'next/server';
import { productsService } from '@/lib/productsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');

    if (slug) {
      const product = await productsService.getProductBySlug(slug);
      return NextResponse.json({ success: true, data: product });
    }

    if (category) {
      const products = await productsService.getProductsByCategory(category);
      return NextResponse.json({ success: true, data: products });
    }

    const products = await productsService.getAllProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error('Erro na API de produtos:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

