import { NextResponse } from 'next/server';
import { connectToDatabase, Product } from '../../../../lib/db';

export async function GET(request, { params }) {
  await connectToDatabase();
  const product = await Product.findById(params.id);
  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}