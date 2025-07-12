'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const ClusterMap = dynamic(() => import('@/components/ClusterMap'), { ssr: false });

export default function WarehouseDetailPage() {
  const { warehouseId } = useParams();
  const [warehouse, setWarehouse] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);

  const slots = ['morning', 'afternoon', 'evening'];

  // Fetch warehouse info
  useEffect(() => {
    fetch(`/api/warehouses`)
      .then(res => res.json())
      .then(data => {
        const w = data.find(w => w._id === warehouseId);
        setWarehouse(w);
      });
  }, [warehouseId]);

  // Fetch clusters for selected slot
  useEffect(() => {
    if (!selectedSlot) return;
    setLoading(true);
    fetch(`/api/clusters?warehouseId=${warehouseId}&timeSlot=${selectedSlot}`)
      .then(res => res.json())
      .then(data => {
        setClusters(data);
        setLoading(false);
      });
  }, [selectedSlot, warehouseId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        📍 {warehouse?.name || 'Warehouse'} ({warehouse?.location?.address})
      </h1>

      <div className="flex gap-4 mb-6 mt-4">
        {slots.map(slot => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            className={`px-4 py-2 rounded font-medium ${
              selectedSlot === slot ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-600">Loading clusters...</p>}

      {!loading && selectedSlot && clusters.length === 0 && (
        <p className="text-gray-600">No clusters found for this time slot.</p>
      )}

      {!loading && clusters.map(cluster => (
        <div
          key={cluster._id}
          className="border p-4 rounded shadow mb-6 bg-white"
        >
          <h2 className="text-lg font-semibold mb-2">
            🚚 Cluster for {new Date(cluster.date).toLocaleDateString()}
          </h2>

          <ClusterMap route={cluster.route} center={cluster.route[0]} />

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div><b>Total Distance:</b> {cluster.totalDistanceKm} km</div>
            <div><b>Duration:</b> {(cluster.totalDurationSec / 60).toFixed(1)} min</div>
            <div><b>CO₂ Emitted:</b> {cluster.totalCO2g} g</div>
            <div><b>Sensitive Zones:</b> {cluster.sensitiveZoneCount}</div>
          </div>

          <h3 className="mt-4 font-semibold">📦 Orders:</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {cluster.orders.map(order => (
              <li key={order._id}>
                {order.customerName} — {order.address?.fullAddress}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
