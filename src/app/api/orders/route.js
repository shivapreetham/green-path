import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import { Order } from '@/models';

export async function POST(req) {
  await connectToDB();
  const body = await req.json();

  // Basic validation
  if (!body.items || !body.address) {
    return NextResponse.json(
      { error: 'Missing required fields: items and address are required' },
      { status: 400 }
    );
  }

  // TODO: Calculate totalAmount securely
  const order = new Order(body);
  await order.save();

  return NextResponse.json({ success: true, order });
}

export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);

  // New filtering support
  const warehouseId = searchParams.get('warehouseId');
  const timeSlot = searchParams.get('timeSlot');

  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  // Dynamic query filter
  const filter = {};
  if (warehouseId) filter.warehouseId = warehouseId;
  if (timeSlot) filter.timeSlot = timeSlot;

  const orders = await Order.find(filter)
    .populate('items.productId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}
