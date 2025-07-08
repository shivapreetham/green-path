// app/api/orders/route.js
import { Order } from '@/models';
import  connectToDB  from '@/lib/db';

export async function POST(req) {
  await connectToDB();
  const body = await req.json();

  const order = new Order(body);
  await order.save();

  return Response.json({ success: true, order });
}

export async function GET() {
  await connectToDB();
  const orders = await Order.find({})
    .populate('items.productId') // Optional: populate product details
    .sort({ createdAt: -1 });

  return Response.json({ orders });
}
