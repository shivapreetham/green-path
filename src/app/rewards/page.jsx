'use client';

import React, { useEffect, useState } from 'react';
import { FaLeaf, FaCarSide, FaChargingStation } from 'react-icons/fa';
import { GiTwoCoins, GiTreeGrowth } from 'react-icons/gi';

export default function Reward() {
  const [coins, setCoins] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0); // in grams
  const [animateCoins, setAnimateCoins] = useState(0);
  const [animateCO2, setAnimateCO2] = useState(0);
  const [animateTrees, setAnimateTrees] = useState(0);
  const [animateKm, setAnimateKm] = useState(0);
  const [animateCharges, setAnimateCharges] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem('checkoutResult');
    if (data) {
      const parsed = JSON.parse(data);
      const storedCoins = parsed.totalCoins || 0;
      const savedCo2 = parsed.co2Saved || 0;

      setCoins(storedCoins);
      setCo2Saved(savedCo2);

      // Animate everything
      animateValue(storedCoins, setAnimateCoins);
      animateValue(savedCo2 / 1000, setAnimateCO2); // CO2 in kg
      animateValue(savedCo2 / 21000, setAnimateTrees, 2); // Trees
      animateValue(savedCo2 / 192, setAnimateKm, 1); // Km (car)
      animateValue(savedCo2 / 8, setAnimateCharges, 0); // Phone charges
    }
  }, []);

  const animateValue = (target, setter, precision = 0) => {
    let current = 0;
    const fps = 60;
    const duration = 1000;
    const steps = duration / (1000 / fps);
    const increment = target / steps;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setter(parseFloat(current.toFixed(precision)));
    }, 1000 / fps);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-200 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <FaLeaf className="text-green-600 text-5xl mx-auto animate-bounce" />
        <h1 className="text-3xl md:text-5xl font-bold text-green-800 mt-4">
          Thank you for choosing the Green Path!
        </h1>
        <p className="text-lg text-green-700 mt-2">
          You helped reduce carbon emissions. 🌍💚
        </p>
      </div>

      {/* Coin Card */}
      <div className="bg-white shadow-xl rounded-xl p-6 md:p-10 max-w-md w-full text-center border-2 border-emerald-300">
        <GiTwoCoins className="text-yellow-500 text-6xl mx-auto mb-4 animate-spin-slow" />
        <h2 className="text-2xl font-semibold text-gray-800">You earned</h2>
        <div className="text-5xl md:text-6xl font-bold text-yellow-600 my-4">
          {animateCoins}
        </div>
        <p className="text-gray-600 text-lg">Eco-Coins for your eco-friendly decision!</p>
      </div>

      {/* Environmental Impact Cards */}
      <div className="mt-10 grid gap-6 grid-cols-1 md:grid-cols-2 max-w-3xl w-full">
        {/* CO2 Saved + Trees */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4 border border-green-200">
          <GiTreeGrowth className="text-green-700 text-4xl" />
          <div>
            <p className="text-xl font-semibold text-green-800">
              {animateCO2} kg CO₂ saved
            </p>
            <p className="text-sm text-gray-600">
              That’s like planting <span className="font-bold text-green-600">{animateTrees}</span> trees! 🌳
            </p>
          </div>
        </div>

        {/* Car Km Saved */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4 border border-blue-200">
          <FaCarSide className="text-blue-700 text-4xl" />
          <div>
            <p className="text-xl font-semibold text-blue-800">
              {animateKm} km car travel avoided
            </p>
            <p className="text-sm text-gray-600">By not delivering alone 🚗</p>
          </div>
        </div>

        {/* Phone Charges Saved */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4 border border-indigo-200 md:col-span-2">
          <FaChargingStation className="text-indigo-700 text-4xl" />
          <div>
            <p className="text-xl font-semibold text-indigo-800">
              {animateCharges.toLocaleString()} phone charges saved 🔋
            </p>
            <p className="text-sm text-gray-600">By reducing CO₂ emissions 🌍</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Keep shopping sustainably and earn more rewards.
        </p>
      </div>
    </div>
  );
}
