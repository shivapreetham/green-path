'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaWarehouse } from 'react-icons/fa';

export default function Dashboard() {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(setWarehouses);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-indigo-800 mb-8 text-center">
          🏢 Warehouse Dashboard
        </h1>

        {warehouses.length === 0 ? (
          <p className="text-center text-gray-500">Loading warehouses...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {warehouses.map(w => (
              <Link
                href={`/dashboard/${w._id}`}
                key={w._id}
                className="block bg-white border border-indigo-200 shadow-md hover:shadow-lg transition rounded-lg p-6 cursor-pointer hover:bg-indigo-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                    <FaWarehouse className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-indigo-700">
                      {w.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {w.location?.address || 'No address available'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
