import { NextResponse } from 'next/server';
import haversine from 'haversine-distance';
import { Cart, Order, Warehouse } from '@/models';
import { getRouteMetrics } from '@/lib/ecoRouting';

const BATCH_RADIUS_M = 1000;
const COINS_PER_100G = 1;

export async function POST(req) {
  const { sessionId, address, timeSlot } = await req.json();

  // 1) Load Cart
  const cart = await Cart.findOne({ sessionId }).populate('items.productId');
  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  // 2) Compute product baseline CO₂ (g)
  let baselineCO2g = 0;
  cart.items.forEach(({ productId, quantity }) => {
    baselineCO2g += productId.carbonFootprint * quantity * 1000;
  });

  // 3) Pick nearest Warehouse
  const warehouses = await Warehouse.find().lean();
  let nearest = warehouses[0];
  let minDist = Infinity;
  warehouses.forEach(w => {
    const d = haversine(
      { lat: w.location.lat, lng: w.location.lng },
      address
    );
    if (d < minDist) {
      minDist = d;
      nearest = w;
    }
  });

  // 4) Solo route CO₂ if delivered alone (depot → address → depot)
  const soloMetrics = await getRouteMetrics(
    { lat: nearest.location.lat, lng: nearest.location.lng },
    [address, { lat: nearest.location.lat, lng: nearest.location.lng }]
  );

  // 5) Create the new Order
  const newOrder = await Order.create({
    customerName:        cart.sessionId,
    address,
    items:               cart.items.map(i => ({
                            productId: i.productId._id,
                            quantity:  i.quantity,
                            priceAtTime: i.priceAtTime
                         })),
    totalAmount:         cart.totalAmount,
    timeSlot,
    warehouseId:         nearest._id, // ✅ added field
    estimatedCO2gIfAlone: soloMetrics.co2g,
    actualCO2gInCluster:  0,
    co2Saved:             0
  });

  // 6) Find batchable peer orders (same date, slot, within radius)
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const peersAll = await Order.find({
    _id:       { $ne: newOrder._id },
    timeSlot:  timeSlot,
    createdAt: { $gte: todayStart }
  }).lean();

  // Filter by radius around newOrder.address
  const peers = peersAll.filter(o => {
    if (!o.address?.lat) return false;
    const d = haversine(o.address, address);
    return d <= BATCH_RADIUS_M;
  });

  // 7) Build the cluster addresses list (depot → each peer → newOrder → back to depot)
  const addresses = [
    address,                           // new order first (optional ordering)
    ...peers.map(o => o.address)
  ];
  // Append return to depot automatically in getRouteMetrics

  // 8) Compute cluster route metrics
  const clusterMetrics = await getRouteMetrics(
    { lat: nearest.location.lat, lng: nearest.location.lng },
    [...addresses, { lat: nearest.location.lat, lng: nearest.location.lng }]
  );

  // 9) Allocate CO₂ evenly among (1 + peers.length)
  const batchSize = peers.length + 1;
  const perOrderCO2g = clusterMetrics.co2g / batchSize;

  // 10) Compute savings & reward for this order
  const co2Saved   = newOrder.estimatedCO2gIfAlone - perOrderCO2g;
  const rewardCoins = Math.floor(co2Saved / 100 * COINS_PER_100G);

  // 11) Update the order
  newOrder.actualCO2gInCluster = perOrderCO2g;
  newOrder.co2Saved            = co2Saved;
  await newOrder.save();

  return NextResponse.json({
    orderId:     newOrder._id,
    co2Saved:    co2Saved,
    rewardCoins
  });
}
