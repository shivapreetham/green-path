// app/api/warehouses/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Warehouse } from '@/models';

export async function GET() {
  await connectDB();
  const warehouses = await Warehouse.find({})
    .select('name _id location.address location.lat location.lng')  // ✅ fix here
    .lean();

  console.log(warehouses);
  return NextResponse.json(warehouses);
}


export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, location } = body;

    // basic validation
    if (
      !name ||
      !location ||
      typeof location.address !== 'string' ||
      typeof location.lat !== 'number' ||
      typeof location.lng !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid fields: name, location.address, location.lat, location.lng' },
        { status: 400 }
      );
    }

    // create and save
    const newWarehouse = await Warehouse.create({
      name,
      location: {
        address: location.address,
        lat: location.lat,
        lng: location.lng,
      },
    });

    // return the created warehouse
    return NextResponse.json(newWarehouse, { status: 201 });
  } catch (error) {
    console.error('Warehouses POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to add warehouse' },
      { status: 500 }
    );
  }
}
