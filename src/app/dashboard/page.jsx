'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(setWarehouses);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Warehouses</h1>
      <ul className="space-y-2">
        {warehouses.map(w => (
          <li key={w._id}>
            <Link href={`/dashboard/${w._id}`}>
              <span className="text-blue-600 hover:underline">
                {w.name} — {w.location?.address}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
