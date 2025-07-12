'use client';

import React, { useEffect, useState } from 'react';
import { FaLeaf } from 'react-icons/fa';
import { GiTwoCoins } from 'react-icons/gi';

export default function Reward() {
  const [coins, setCoins] = useState(0);
  const [animateCoins, setAnimateCoins] = useState(0);

  useEffect(() => {
    const storedCoins = localStorage.getItem('checkoutResult');
    if (storedCoins) {
      const value = JSON.parse(storedCoins);
      setCoins(value);

      // Animate coin count
      let current = 0;
      const step = Math.ceil(value / 60);
      const interval = setInterval(() => {
        current += step;
        if (current >= value) {
          current = value;
          clearInterval(interval);
        }
        setAnimateCoins(current);
      }, 16); // ~60fps
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

      <div className="bg-white shadow-lg rounded-xl p-6 md:p-10 max-w-md w-full text-center border-2 border-emerald-300">
        <GiTwoCoins className="text-yellow-500 text-6xl mx-auto mb-4 animate-spin-slow" />
        <h2 className="text-2xl font-semibold text-gray-800">You earned</h2>
        <div className="text-5xl md:text-6xl font-bold text-yellow-600 my-4">
          {animateCoins}
        </div>
        <p className="text-gray-600 text-lg">Eco-Coins for your eco-friendly decision!</p>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-500">
          Keep shopping sustainably and earn more rewards.
        </p>
      </div>
    </div>
  );
}
