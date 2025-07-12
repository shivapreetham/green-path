"use client"
import React, { use, useEffect, useState } from 'react'

function reward() {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const storedCoins = localStorage.getItem('checkoutResult');
    if (storedCoins) {
      setCoins(JSON.parse(storedCoins));
    }
  }, []);

  return (
    <div>
      <h1>Coins: {coins}</h1>
      
    </div>
  )
}

export default reward