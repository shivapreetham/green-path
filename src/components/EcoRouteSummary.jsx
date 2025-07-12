'use client';
import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import EcoRouteFlow from '@/components/EcoRouteFlow';

export default function EcoRouteSummary({ data }) {
  const [selectedStep, setSelectedStep] = useState(null);
  if (!data) return null;

  const {
    eco: { steps: ecoSteps },
    naive,
    impactSummary,
    efficiency,
    meta
  } = data;

  // Build a simple A→Z mapping for your order IDs:
  const orderIdToLetter = {};
  let counter = 0;
  naive.steps.forEach(step => {
    const id = step.toOrderId;
    if (id && !orderIdToLetter[id]) {
      orderIdToLetter[id] = String.fromCharCode(65 + counter++);
    }
  });

  // Compute saved metrics
  const co2Saved = impactSummary.naiveCO2g - impactSummary.ecoCO2g;
  const zoneDiff = impactSummary.naiveZones - impactSummary.ecoZones;

  // Pie/bar chart data
  const chartData = [
    { name: 'Eco Route CO₂ (g)',   value: impactSummary.ecoCO2g,   fill: '#22c55e' },
    { name: 'Naive Route CO₂ (g)', value: impactSummary.naiveCO2g, fill: '#f97316' }
  ];

  // Summary cards data
  const summaryData = [
    {
      label: 'Distance Saved',
      value: efficiency.optimizedVsUnoptimizedKm.savedKm,
      unit: 'km',
      percent: efficiency.optimizedVsUnoptimizedKm.savedPercent
    },
    {
      label: 'Time Saved',
      value: efficiency.optimizedVsUnoptimizedTime.savedMin,
      unit: 'min',
      percent: 100 * efficiency.optimizedVsUnoptimizedTime.savedMin /
               (efficiency.optimizedVsUnoptimizedTime.naive / 60)
    },
    {
      label: 'CO₂ Saved',
      value: co2Saved.toFixed(2),
      unit: 'g',
      percent: 100 * co2Saved / (impactSummary.naiveCO2g || 1)
    },
    {
      label: 'Zones Avoided',
      value: zoneDiff,
      unit: 'zones',
      percent: 100 * zoneDiff / (impactSummary.naiveZones || 1)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-fadeIn">

      {/* Eco Route Impact */}
      <Card className="shadow-lg border-green-500">
        <CardHeader>
          <CardTitle className="text-green-700 text-xl">
            🌿 Eco Route Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Distance:</strong> {efficiency.optimizedVsUnoptimizedKm.optimized} km</div>
            <div><strong>Time:</strong> {(efficiency.optimizedVsUnoptimizedTime.optimized/60).toFixed(1)} mins</div>
            <div><strong>CO₂:</strong> {impactSummary.ecoCO2g} g</div>
            <div>
              <strong>Avg AQI:</strong> {impactSummary.avgAQI}{" "}
              <Badge>{impactSummary.AQIRating}</Badge>
            </div>
            <div><strong>Zones Passed:</strong> {impactSummary.ecoZones}</div>
            <div><strong>Vehicle:</strong> {meta.vehicleType}</div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-600">📊 Route Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summaryData.map((item, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm">{item.value} {item.unit}</span>
              </div>
              <Progress value={Math.min(item.percent,100)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emissions Chart */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-purple-600">📈 Emission Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 🔗 Fancy Eco Route Flow */}
      <Card className="col-span-1 md:col-span-2">
      
    
          <EcoRouteFlow
            ecoSteps={ecoSteps}
            orderIdToLetter={orderIdToLetter}
          />

      </Card>

    </div>
  );
}
