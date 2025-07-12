import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import { Coins } from '@/models';

export async function GET(req) {
  try {
    await connectToDB();
  const coins = await Coins.find({});
  return NextResponse.json({ success: true, coins });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const body = await req.json();

    const coins = await Coins.find({});
    coins[0].coins += body.coins;
    await coins[0].save();

    return NextResponse.json({ success: true, coins });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}