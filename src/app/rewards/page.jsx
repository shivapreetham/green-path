'use client';

import React, { useEffect, useState } from 'react';
import { FaLeaf } from 'react-icons/fa';
import { GiTwoCoins, GiTreeGrowth } from 'react-icons/gi';

export default function Reward() {
  const [coins, setCoins] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0); // in grams
  const [animateCoins, setAnimateCoins] = useState(0);
  const [treesPlanted, setTreesPlanted] = useState('0.00');

  useEffect(() => {
    const data = localStorage.getItem('checkoutResult');
    if (data) {
      const parsed = JSON.parse(data);
      const storedCoins = parsed.totalCoins || 0;
      const savedCo2 = parsed.co2Saved || 0;

      setCoins(storedCoins);
      setCo2Saved(savedCo2);

      // Animate coin count
      let current = 0;
      const step = Math.ceil(storedCoins / 60);
      const interval = setInterval(() => {
        current += step;
        if (current >= storedCoins) {
          current = storedCoins;
          clearInterval(interval);
        }
        setAnimateCoins(current);
      }, 16); // ~60fps

      // Calculate tree equivalent
      const trees = (savedCo2 / 21000).toFixed(2);
      setTreesPlanted(trees);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-200 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <FaLeaf className="text-green-600 text-5xl mx-auto animate-bounce" />
        <h1 className="text-3xl md:text-5xl font-bold text-green-800 mt-4">
          Thank you for choosing the Green Path!
        </h1>
        <p className="text-lg text-green-700 mt-2">
          You helped reduce carbon emissions. 🌍💚
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-6 md:p-10 max-w-md w-full text-center border-2 border-emerald-300">
        <GiTwoCoins className="text-yellow-500 text-6xl mx-auto mb-4 animate-spin-slow" />
        <h2 className="text-2xl font-semibold text-gray-800">You earned</h2>
        <div className="text-5xl md:text-6xl font-bold text-yellow-600 my-4">
          {animateCoins}
        </div>
        <p className="text-gray-600 text-lg">Eco-Coins for your eco-friendly decision!</p>
      </div>

      <div className="mt-10 text-center bg-white shadow-md rounded-lg px-6 py-4 max-w-sm w-full border border-green-200">
        <div className="flex items-center justify-center gap-3">
          <GiTreeGrowth className="text-green-700 text-3xl" />
          <div>
            <p className="text-xl font-semibold text-green-800">
              {(co2Saved / 1000).toFixed(2)} kg CO₂ saved
            </p>
            <p className="text-sm text-gray-600">
              That’s like planting <span className="font-bold text-green-600">{treesPlanted}</span> trees! 🌱
            </p>
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
