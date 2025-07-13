import { NextResponse } from 'next/server';
import haversine from 'haversine-distance';
import { Order, Warehouse } from '@/models';
import { getRouteMetrics } from '@/lib/ecoRouting';

const BATCH_RADIUS_M = 1000;
const SLOTS = ['morning','afternoon','evening'];

export async function POST(req) {
  const { lat, lng } = await req.json();

  // 1) Pick nearest warehouse as depot
  const warehouses = await Warehouse.find().lean();
  let depot = warehouses[0], minD = Infinity;
  warehouses.forEach(w => {
    const d = haversine({ lat: w.location.lat, lng: w.location.lng }, { lat, lng });
    if (d < minD) { minD = d; depot = w; }
  });

  const results = [];

  // 2) For each slot, compute potential batch savings
  for (const timeSlot of SLOTS) {
    // a) solo CO2
    const solo = await getRouteMetrics(
      { lat: depot.location.lat, lng: depot.location.lng },
      [{ lat, lng }, { lat: depot.location.lat, lng: depot.location.lng }]
    );
    const soloCO2 = solo.co2g;

    // b) find peers in same slot & today within radius
    const today = new Date(); today.setHours(0,0,0,0);
    const peersAll = await Order.find({
      timeSlot, createdAt: { $gte: today }
    }).lean();
    const peerAddrs = peersAll
      .filter(o => o.address?.lat && haversine(o.address, { lat, lng }) <= BATCH_RADIUS_M)
      .map(o => o.address);

    if (peerAddrs.length === 0) {
      results.push({ timeSlot, peers: 0, savings: 0 });
      continue;
    }

    // c) batch CO2 over (peers + this loc)
    const addresses = [ { lat, lng }, ...peerAddrs ];
    const batch = await getRouteMetrics(
      { lat: depot.location.lat, lng: depot.location.lng },
      [...addresses, { lat: depot.location.lat, lng: depot.location.lng }]
    );
    const batchCO2each = batch.co2g / addresses.length;
    const savings = soloCO2 - batchCO2each;

    results.push({
      timeSlot,
      peers: peerAddrs.length,
      savings: parseFloat((savings/1000).toFixed(2))
    });
  }

  // 3) Pick best slot
  results.sort((a,b) => b.savings - a.savings);
  const best = results[0];

  return NextResponse.json({ best, all: results });
}
