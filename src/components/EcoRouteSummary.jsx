// components/EcoRouteSummary.js
'use client';
import React from 'react';

export default function EcoRouteSummary({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-6 space-y-8">
      {data.map((cluster, clusterIdx) => (
        <div key={clusterIdx} className="border p-4 rounded bg-gray-50 shadow">
          <h2 className="text-lg font-bold mb-2 text-green-700">
            🚚 Cluster {clusterIdx + 1}
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Total Distance:</strong> {cluster.efficiency.optimizedVsUnoptimizedKm.optimized} km</div>
            <div><strong>Time:</strong> {(cluster.efficiency.optimizedVsUnoptimizedTime.optimized / 60).toFixed(1)} mins</div>
            <div><strong>CO₂ Emitted:</strong> {cluster.impactSummary.totalCO2g} g</div>
            <div><strong>Equivalent Trees Saved:</strong> {cluster.impactSummary.equivalentTrees}</div>
            <div><strong>Average AQI:</strong> {cluster.impactSummary.avgAQI} ({cluster.impactSummary.AQIRating})</div>
            <div><strong>Zones Passed:</strong> {cluster.impactSummary.zonesPassed}</div>
            <div><strong>Vehicle Type:</strong> {cluster.meta.vehicleType}</div>
            <div><strong>Route Engine:</strong> {cluster.meta.engine}</div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-md text-blue-600 mb-2">📍 Delivery Steps:</h3>
            <ol className="space-y-3 text-sm list-decimal ml-4">
              {cluster.steps.map((step, i) => (
                <li key={i} className="border-l-4 border-blue-400 pl-3 bg-white py-2 shadow-sm rounded">
                  <div><strong>From:</strong> {step.fromOrderId || 'Warehouse'}</div>
                  <div><strong>To:</strong> {step.toOrderId}</div>
                  <div><strong>Distance:</strong> {step.distanceKm} km</div>
                  <div><strong>Duration:</strong> {(step.durationSec / 60).toFixed(1)} mins</div>
                  <div><strong>AQI:</strong> {step.aqi}</div>
                  <div><strong>Zones:</strong> {step.zoneCount}</div>
                  <div><strong>CO₂ (g):</strong> {step.co2g}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ))}
    </div>
  );
}
