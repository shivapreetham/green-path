'use client';

import { useEffect, useMemo } from 'react';
import useOrderStore from '@/store/orderStore';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import clsx from 'clsx';

export default function OrdersPage() {
  const { orders, loading, fetchAllOrders, error } = useOrderStore();

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // 📅 Prepare streak data
  const streakData = useMemo(() => {
    const counts = new Map();

    orders.forEach(order => {
      const date = format(new Date(order.createdAt), 'yyyy-MM-dd');
      counts.set(date, (counts.get(date) || 0) + 1);
    });

    return counts;
  }, [orders]);

  // 🔢 Analytics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalCO2Saved = orders.reduce((acc, o) => acc + (o.co2Saved || 0), 0); // grams
  const treesPlanted = (totalCO2Saved / 21000).toFixed(2);

  const last90Days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 89);
    return eachDayOfInterval({ start, end });
  }, []);

  const getBoxColor = (count) => {
    if (!count) return 'bg-gray-200';
    if (count >= 5) return 'bg-green-700';
    if (count >= 3) return 'bg-green-500';
    return 'bg-green-300';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6">📦 My Green Orders</h1>

      {/* 📊 Analytics */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white shadow-sm rounded-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-xl font-bold text-green-700">{totalOrders}</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4 border-l-4 border-emerald-500">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-xl font-bold text-emerald-700">₹{totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4 border-l-4 border-lime-500">
          <p className="text-sm text-gray-500">CO₂ Saved</p>
          <p className="text-xl font-bold text-lime-700">
            {(totalCO2Saved / 1000).toFixed(2)} kg ≈ 🌱 {treesPlanted} trees
          </p>
        </div>
      </div>

      {/* 🔥 Streak */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">90-Day Eco-Streak</h2>
        <div className="grid grid-cols-30 gap-[5px]">
          {last90Days.map((date, i) => {
            const key = format(date, 'yyyy-MM-dd');
            const count = streakData.get(key);
            return (
              <div
                key={i}
                title={`${key}: ${count || 0} orders`}
                className={clsx(
                  'w-4 h-4 rounded-sm transition',
                  getBoxColor(count)
                )}
              />
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          More orders = darker green. Keep your eco streak going! 🌱
        </p>
      </div>

      {/* 📃 Orders */}
      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && orders.length === 0 && (
        <p className="text-gray-600">No orders placed yet.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order, i) => (
          <div key={i} className="bg-white p-5 rounded-lg shadow hover:shadow-md border border-gray-200 transition-all">
            <p className="text-sm text-gray-500">
              📅 {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-md font-semibold text-green-700 mt-1">
              ₹{order.totalAmount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-700 mt-2">
              📍 {order.address?.fullAddress || 'Unknown'}
            </p>

            <div className="mt-3 text-sm text-gray-600">
              <p className="font-medium mb-1">Items:</p>
              <ul className="list-disc ml-5 space-y-1">
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.productId?.name
                      ? `${item.productId.name} × ${item.quantity}`
                      : 'Unknown item'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
