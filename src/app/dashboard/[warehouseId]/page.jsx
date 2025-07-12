'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import CountUp from 'react-countup';
import {
  FaTruck, FaLeaf, FaClock, FaToggleOn, FaToggleOff, FaRoute
} from 'react-icons/fa';
import EcoRouteSummary from '@/components/EcoRouteSummary';

const ClusterMap = dynamic(() => import('@/components/ClusterMap'), { ssr: false });

export default function WarehouseDetailPage() {
  const { warehouseId } = useParams();
  const [warehouse, setWarehouse] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [orders, setOrders] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState('Petrol');
  const [showEco, setShowEco] = useState(true);

  const slots = ['morning', 'afternoon', 'evening'];
  const vehicleOptions = ['EV', 'Petrol', 'Diesel'];

  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => setWarehouse(data.find(w => w._id === warehouseId)));
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
    if (!warehouse || !orders.length) return;
    setLoading(true);
    const res = await fetch('/api/findEcoRoute', {
      method: 'POST',
      body: JSON.stringify({
        warehouse: warehouse.location,
        orders: orders.map(o => ({ lat: o.address.lat, lng: o.address.lng, orderId: o._id })),
        vehicle: vehicleType
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    setRouteData(data[0]);
    setShowEco(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-indigo-700 mb-2 flex items-center gap-2">
          <FaTruck /> {warehouse?.name || 'Warehouse'}
        </h1>
        <p className="text-gray-600 mb-6">{warehouse?.location?.address}</p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative">
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="border border-gray-300 bg-white text-gray-800 rounded-lg px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none pr-10"
            >
              {vehicleOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>

          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`px-4 py-2 rounded ${selectedSlot === slot ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700'} transition`}
            >
              <FaClock className="inline-block mr-1" /> {slot}
            </button>
          ))}
        </div>

        {/* Message Prompts */}
        {!selectedSlot && !loading && (
          <p className="text-gray-500 font-medium mb-4 italic">
            Please select a time slot to view orders.
          </p>
        )}

        {!loading && selectedSlot && !orders.length && (
          <p className="text-red-500 font-semibold">No orders found for {selectedSlot} slot.</p>
        )}

        {/* Map & Route Section */}
        {orders.length > 0 && warehouse && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-12 relative">
            {/* Summary Cards */}
            {routeData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* CO2 */}
                <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg shadow flex items-center gap-4">
                  <FaLeaf className="text-green-600 text-3xl" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">CO₂ Saved (%)</p>
                    <h3 className="text-xl font-bold text-green-800">
                      <CountUp
                        end={
                          100 * (
                            (routeData.impactSummary.naiveCO2g - routeData.impactSummary.ecoCO2g) /
                            Math.max(routeData.impactSummary.naiveCO2g, 1)
                          )
                        }
                        duration={2}
                        decimals={1}
                        suffix="%"
                      />
                    </h3>
                  </div>
                </div>

                {/* Zones */}
                <div className="bg-pink-100 border-l-4 border-pink-500 p-4 rounded-lg shadow flex items-center gap-4">
                  <FaRoute className="text-pink-600 text-3xl" />
                  <div>
                    <p className="text-sm font-semibold text-pink-700">Zones Avoided</p>
                    <h3 className="text-xl font-bold text-pink-800">
                      <CountUp
                        end={(routeData.impactSummary.naiveZones || 0) - (routeData.impactSummary.ecoZones || 0)}
                        duration={2}
                      />
                    </h3>
                  </div>
                </div>

                {/* Distance */}
                <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg shadow flex items-center gap-4">
                  <FaRoute className="text-blue-600 text-3xl" />
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Distance Saved</p>
                    <h3 className="text-xl font-bold text-blue-800">
                      <CountUp
                        end={routeData?.efficiency?.optimizedVsUnoptimizedKm?.savedKm || 0}
                        duration={2}
                        decimals={2}
                        suffix=" km"
                      />
                    </h3>
                  </div>
                </div>

                {/* Time */}
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow flex items-center gap-4">
                  <FaClock className="text-yellow-600 text-3xl" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-700">Time Saved</p>
                    <h3 className="text-xl font-bold text-yellow-800">
                      <CountUp
                        end={routeData?.efficiency?.optimizedVsUnoptimizedTime?.savedMin || 0}
                        duration={2}
                        decimals={2}
                        suffix=" min"
                      />
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Toggle + Calculate Button */}
            <div className="flex justify-between items-center mb-4">
              {routeData && (
                <button
                  onClick={() => setShowEco(!showEco)}
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  {showEco ? <FaToggleOn className="text-green-400 text-4xl" /> : <FaToggleOff className='text-red-300 text-4xl' />}
                  {showEco ? 'Showing Eco Route' : 'Showing Naive Route'}
                </button>
              )}

              <button
                onClick={handleEcoRoute}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold px-6 py-2 rounded-full shadow hover:from-green-500 hover:to-green-700 transition-all duration-300 flex items-center gap-2"
              >
                <FaLeaf />
                Calculate Eco Route
              </button>
            </div>

            {/* Map Section */}
            <div className="relative min-h-[400px] rounded-md overflow-hidden border">
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <div className="w-16 h-16 border-4 border-green-500 border-dashed rounded-full animate-spin mb-4"></div>
                  <p className="text-green-800 font-semibold text-lg">Calculating Eco Route...</p>
                </div>
              )}
              <ClusterMap
                warehouse={warehouse}
                orders={orders}
                ecoSteps={routeData?.eco?.steps || []}
                naiveSteps={routeData?.naive?.steps || []}
                showEco={showEco}
              />
            </div>

            {/* Route Summary */}
            {routeData && (
              <div className="mt-8">
                <EcoRouteSummary data={routeData} />
              </div>
            )}
          </div>
        )}

        {/* Order Cards */}
        {orders.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Order Details</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                    🧍 {o.customerName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">📍 {o.address?.fullAddress}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3
                    ${o.timeSlot === 'morning' ? 'bg-yellow-100 text-yellow-800' :
                      o.timeSlot === 'afternoon' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'}`}>
                    ⏰ {o.timeSlot}
                  </span>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p className="font-medium">🛒 Items:</p>
                    <ul className="list-disc pl-5">
                      {o.items.map((item, idx) => (
                        <li key={idx}>
                          <span className="text-gray-800 font-medium">
                            {item?.productId?.name}
                          </span> × {item.quantity} &nbsp;
                          <span className="text-gray-500 text-xs">₹{item.priceAtTime}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="font-medium text-green-700 mt-2">
                      💰 Total: ₹{o.totalAmount}
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
