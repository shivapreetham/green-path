'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import EcoRouteSummary from '@/components/EcoRouteSummary';

const ClusterMap = dynamic(() => import('@/components/ClusterMap'), { ssr: false });

export default function WarehouseDetailPage() {
  const { warehouseId } = useParams();
  const [warehouse, setWarehouse] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [orders, setOrders] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [vehicleType, setVehicleType] = useState('Petrol');

  const slots = ['morning', 'afternoon', 'evening'];
  const vehicleOptions = ['EV', 'Petrol', 'Diesel'];

  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => {
        const w = data.find(w => w._id === warehouseId);
        console.log("📍 Warehouse Coordinates:", w);
        setWarehouse(w);
      });
  }, [warehouseId]);

  useEffect(() => {
    if (!selectedSlot || !warehouseId) return;
    setLoading(true);
    fetch(`/api/orders?warehouseId=${warehouseId}&timeSlot=${selectedSlot}&limit=100`)
      .then(res => res.json())
      .then(data => {
        console.log("📦 Orders fetched:", data.orders);
        setOrders(data.orders);
        setRouteData(null);
        setLoading(false);
      });
  }, [selectedSlot, warehouseId]);

  const handleEcoRoute = async () => {
    if (!warehouse || orders.length === 0) return;
    const res = await fetch('/api/findEcoRoute', {
      method: 'POST',
      body: JSON.stringify({
        warehouse: warehouse.location,
        orders: orders.map(o => ({
          lat: o.address.lat,
          lng: o.address.lng,
          orderId: o._id
        })),
        vehicle: vehicleType
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    console.log("Eco route", data);
    setRouteData(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        📦 {warehouse?.name || 'Warehouse'} ({warehouse?.location?.address})
      </h1>

      {/* 🚗 Vehicle Type Selector */}
      <div className="mb-4">
        <label className="font-medium mr-2">Select Vehicle Type:</label>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          {vehicleOptions.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* 🕐 Time Slots */}
      <div className="flex gap-4 mb-6 mt-2">
        {slots.map(slot => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            className={`px-4 py-2 rounded font-medium ${selectedSlot === slot ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {slot}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-600">Loading orders...</p>}
      {!loading && selectedSlot && orders.length === 0 && (
        <p className="text-gray-600">No orders found for this time slot.</p>
      )}

      {!loading && orders.length > 0 && warehouse && (
        <div className="mb-6">
          <ClusterMap
            route={routeData?.[0]?.route || []}
            center={{ lat: warehouse.location.lat, lng: warehouse.location.lng }}
            orders={orders}
            warehouse={warehouse}
            ecoSteps={routeData?.[0]?.steps || []}
          />


          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleEcoRoute}
          >
            ♻️ Calculate Eco Route
          </button>

          {routeData && (
            <EcoRouteSummary data={routeData} />
          )}

          <h3 className="mt-6 font-semibold text-lg">📋 Orders:</h3>
          <div className="space-y-3 mt-2">
            {orders.map(o => (
              <div key={o._id} className="border p-3 rounded shadow-sm bg-white">
                <button
                  className="w-full text-left font-medium text-blue-700"
                  onClick={() => setActiveOrderId(prev => (prev === o._id ? null : o._id))}
                >
                  {o.customerName} — {o.address?.fullAddress}
                </button>
                {activeOrderId === o._id && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p><strong>Items:</strong></p>
                    <ul className="list-disc pl-5">
                      {o.items.map((item, idx) => (
                        <li key={idx}>
                          {item?.productId?.name} × {item.quantity} @ ₹{item.priceAtTime}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2"><strong>Total:</strong> ₹{o.totalAmount}</p>
                    <p><strong>Time Slot:</strong> {o.timeSlot}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
