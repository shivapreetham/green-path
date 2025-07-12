'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FaTruck, FaRoad, FaClock, FaLeaf, FaSmog, FaRoute, FaMapMarkerAlt
} from 'react-icons/fa';
import { MdOutlineAir, MdStraighten } from 'react-icons/md';
import { GiPathDistance } from 'react-icons/gi';

export default function EcoRouteFlow({ ecoSteps, orderIdToLetter }) {
  const [selectedStep, setSelectedStep] = useState(null);
  const containerRef = useRef(null);
  const [truckLeft, setTruckLeft] = useState(0);

  useEffect(() => {
    if (selectedStep === null || !containerRef.current) return;

    const stepEls = containerRef.current.querySelectorAll('.step-box');
    const box = stepEls[selectedStep];
    const { left: boxLeft, width } = box.getBoundingClientRect();
    const { left: containerLeft } = containerRef.current.getBoundingClientRect();
    setTruckLeft(boxLeft - containerLeft + width / 2 - 16); // Center align
  }, [selectedStep]);

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
        <FaRoute className="text-green-600" /> Eco Route Flow
      </h2>

      {/* Step Flow */}
      <div className="relative">
        <div
          ref={containerRef}
          className="flex items-center gap-4 overflow-x-auto py-4 px-2"
        >
          {ecoSteps.map((step, i) => {
            const from = step.fromOrderId
              ? `Order ${orderIdToLetter[step.fromOrderId]}`
              : 'Warehouse';
            const to = step.toOrderId
              ? `Order ${orderIdToLetter[step.toOrderId]}`
              : 'Warehouse';
            const isActive = selectedStep === i;

            return (
              <div key={i} className="flex items-center">
                <div
                  onClick={() => setSelectedStep(i)}
                  className={`step-box px-4 py-2 rounded-xl border-2 cursor-pointer transition-all duration-300 
                  ${isActive ? 'bg-green-100 border-green-500 shadow-lg scale-105' : 'bg-gray-50 border-gray-300 hover:border-green-400 hover:bg-green-50'}
                  `}
                >
                  <p className="text-sm text-gray-800 font-medium">
                    {from} <span className="text-green-500 font-bold">→</span> {to}
                  </p>
                </div>
                {i < ecoSteps.length - 1 && (
                  <div className="w-8 h-1 bg-green-400 rounded-full mx-2 transition-all duration-300" />
                )}
              </div>
            );
          })}
        </div>

        {/* Truck Icon */}
        {selectedStep !== null && (
          <div
            className="absolute -bottom-2 z-10 transition-all duration-500"
            style={{ left: `${truckLeft}px` }}
          >
            <FaTruck className="text-green-600 text-3xl drop-shadow animate-bounce-slow" />
          </div>
        )}
      </div>

      {/* Step Detail Panel */}
      {selectedStep !== null && (
        <div className="mt-6 border border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-white p-6 shadow-md animate-fadeIn">
          <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
            <FaRoute /> Step {selectedStep + 1} – Route Segment Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="text-green-500 mt-0.5" />
              <p>
                <span className="font-semibold">From:</span>{' '}
                {ecoSteps[selectedStep].fromOrderId
                  ? `Order ${orderIdToLetter[ecoSteps[selectedStep].fromOrderId]} (${ecoSteps[selectedStep].fromOrderId})`
                  : 'Warehouse'}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="text-green-500 mt-0.5" />
              <p>
                <span className="font-semibold">To:</span>{' '}
                {ecoSteps[selectedStep].toOrderId
                  ? `Order ${orderIdToLetter[ecoSteps[selectedStep].toOrderId]} (${ecoSteps[selectedStep].toOrderId})`
                  : 'Warehouse'}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <GiPathDistance className="text-indigo-500 mt-0.5" />
              <p>
                <span className="font-semibold">Distance:</span>{' '}
                {ecoSteps[selectedStep].distanceKm} km
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FaClock className="text-yellow-600 mt-0.5" />
              <p>
                <span className="font-semibold">Duration:</span>{' '}
                {(ecoSteps[selectedStep].durationSec / 60).toFixed(1)} mins
              </p>
            </div>

            <div className="flex items-start gap-2">
              <MdOutlineAir className="text-blue-500 mt-0.5" />
              <p>
                <span className="font-semibold">AQI:</span>{' '}
                {ecoSteps[selectedStep].aqi}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FaSmog className="text-red-400 mt-0.5" />
              <p>
                <span className="font-semibold">Zones Crossed:</span>{' '}
                {ecoSteps[selectedStep].zoneCount}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FaLeaf className="text-green-600 mt-0.5" />
              <p>
                <span className="font-semibold">CO₂ Emission:</span>{' '}
                {ecoSteps[selectedStep].co2g} g
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
