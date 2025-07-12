// app/api/clusters/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Cluster } from '@/models';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const timeSlot = searchParams.get('timeSlot');

    if (!warehouseId || !timeSlot) {
      return NextResponse.json(
        { error: 'warehouseId and timeSlot are required' },
        { status: 400 }
      );
    }

    const clusters = await Cluster.find({ warehouseId, timeSlot })
      .populate('orders')
      .lean();

    return NextResponse.json(clusters);
  } catch (err) {
    console.error('Cluster GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch clusters' }, { status: 500 });
  }
}
