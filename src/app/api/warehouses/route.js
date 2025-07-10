import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Warehouse } from '@/models';

export async function GET() {
  try {
    await connectDB();
    const warehouses = await Warehouse.find({}).select('name _id').lean();
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error('Warehouses API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 });
  }
}