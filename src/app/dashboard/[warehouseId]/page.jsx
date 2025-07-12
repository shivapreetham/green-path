'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import EcoRouteSummary from '@/components/EcoRouteSummary';
import { FaTruck, FaLeaf, FaClock } from 'react-icons/fa';

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
        setWarehouse(w);
      });
  }, [warehouseId]);

  useEffect(() => {
    if (!selectedSlot || !warehouseId) return;
    setLoading(true);
    fetch(`/api/orders?warehouseId=${warehouseId}&timeSlot=${selectedSlot}&limit=100`)
      .then(res => res.json())
      .then(data => {
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
    setRouteData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
          <FaTruck className="text-indigo-600" />
          {warehouse?.name || 'Warehouse'}
        </h1>
        <p className="text-gray-600 mb-8 text-lg">{warehouse?.location?.address}</p>

        {/* 🚗 Vehicle Selector */}
        <div className="mb-6">
          <label className="text-lg font-medium mr-2">Select Vehicle Type:</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-indigo-400"
          >
            {vehicleOptions.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* 🕒 Time Slots */}
        <div className="flex flex-wrap gap-4 mb-10">
          {slots.map(slot => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition shadow ${
                selectedSlot === slot
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border text-gray-700 hover:bg-indigo-100'
              }`}
            >
              <FaClock className="inline-block mr-1" /> {slot}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-600">Loading orders...</p>}
        {!loading && selectedSlot && orders.length === 0 && (
          <p className="text-red-500 text-center font-medium">No orders found for this time slot.</p>
        )}

        {/* 🌍 Map & Route */}
        {!loading && orders.length > 0 && warehouse && (
                <div className="bg-white p-6 rounded-xl shadow-md mb-10">
                  <ClusterMap
                    route={routeData?.[0]?.route || []}
                    center={{ lat: warehouse.location.lat, lng: warehouse.location.lng }}
                    orders={orders}
                    warehouse={warehouse}
                    ecoSteps={routeData?.[0]?.steps || []}
                  />

                  <button
                    className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
                    onClick={handleEcoRoute}
                  >
                    <FaLeaf className="inline-block mr-2" />
                    Calculate Eco Route
                  </button>

                  {routeData && (
                    <div className="mt-6">
                      <EcoRouteSummary data={routeData} />
                    </div>
                  )}
                </div>
              )}

              {/* 📝 Orders List */}
              {orders.length > 0 && (
        <div className="mt-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📋 Orders Summary
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(o => (
              <div
                key={o._id}
                className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition"
              >
                <button
                  className="text-left w-full text-lg font-semibold text-indigo-700 hover:underline"
                  onClick={() =>
                    setActiveOrderId(prev => (prev === o._id ? null : o._id))
                  }
                >
                  🧍 {o.customerName}
                </button>

                <p className="text-sm text-gray-600 mt-1">
                  📍 {o.address?.fullAddress}
                </p>

                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                    ${o.timeSlot === 'morning' ? 'bg-yellow-100 text-yellow-800' : 
                      o.timeSlot === 'afternoon' ? 'bg-blue-100 text-blue-800' : 
                      'bg-purple-100 text-purple-800'}`}>
                    ⏰ {o.timeSlot}
                  </span>
                </div>

                
                  <div className="mt-4 text-sm text-gray-700 space-y-3">
                    <div>
                      <p className="font-medium text-gray-800">🛒 Items:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-1">
                        {o.items.map((item, idx) => (
                          <li key={idx}>
                            <span className="text-gray-800 font-medium">
                              {item?.productId?.name}
                            </span>{' '}
                            × {item.quantity} &nbsp;
                            <span className="text-gray-500 text-xs">₹{item.priceAtTime}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="font-medium text-green-700">
                      💰 Total Amount: ₹{o.totalAmount}
                    </p>
                  </div>
                
              </div>
            ))}
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
