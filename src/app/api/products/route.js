import { NextResponse } from 'next/server';
import { connectToDatabase, Product } from '@/lib/db';

export async function GET() {
  await connectToDatabase();
  const products = await Product.find();
  return NextResponse.json(products);
}

export async function POST(request) {
  await connectToDatabase();
  const data = await request.json();
  const product = new Product(data);
  await product.save();
  return NextResponse.json(product, { status: 201 });
}