'use client';

import { useEffect } from 'react';
import useOrderStore from '@/store/orderStore';

export default function OrdersPage() {
  const { orders, loading, fetchAllOrders, error } = useOrderStore();

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📦 All Orders (Demo)</h1>

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {orders.length === 0 && !loading ? (
        <p>No orders placed yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <div key={i} className="border p-4 rounded shadow">
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Address:</strong> {order.address.fullAddress}</p>
              <p><strong>Total:</strong> ₹{order.totalAmount}</p>
              <div className="mt-2">
                <p className="font-semibold">Items:</p>
                <ul className="list-disc ml-6">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {(item.productId.name || item.productId)} × {item.quantity} = ₹{item.priceAtTime * item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
