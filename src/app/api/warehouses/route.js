// app/api/warehouses/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Warehouse } from '@/models';

export async function GET() {
  try {
    await connectDB();
    // only return name and _id (as you had before)
    const warehouses = await Warehouse.find({})
      .select('name _id')
      .lean();
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error('Warehouses GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
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
