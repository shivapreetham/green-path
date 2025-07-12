// app/checkout/page.jsx  (or pages/checkout.jsx)
'use client';

import React, { useState, useEffect } from 'react';
import AddressPicker from '@/components/PickAddress';
import useCartStore from '@/store/cartStore';

export default function CheckoutPage() {
  const [address, setAddress] = useState(null);
  const [timeSlot, setTimeSlot] = useState('morning');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const {sessionId, fetchCart, cart} = useCartStore();

  useEffect(() => {
      if (!sessionId) return;           // wait until sessionId is non-null
      setLoading(true);
      console.log(`Fetching cart for session ID: ${sessionId}`);

      fetchCart()                        // your store’s fetchCart should set `cart`
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [sessionId, fetchCart]);

  useEffect(()=>{
      if(!result) return;
      const rewardCoins = result?.rewardCoins || 0;
      const alreadyCoins = JSON.parse(localStorage.getItem('checkoutResult') || 0);
      localStorage.setItem('checkoutResult', JSON.stringify(alreadyCoins + rewardCoins));
  },[result])

  const handleCheckout = async () => {
    if (!address) {
      alert('Please select your delivery location on the map.');
      return;
    }
    setLoading(true);
    setResult(null);

    const payload = {
      sessionId,
      address: {
        fullAddress: '', // optionally reverse-geocode
        lat: address.lat,
        lng: address.lng
      },
      timeSlot
    };

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

   // When user selects location:
  const onSelectAddress = async (pos) => {
    setAddress(pos);
    // 1) Ask the server for best slot
    const res = await fetch('/api/suggest-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pos)
    });
    const data = await res.json();
    setSuggestion(data.best);
    // optionally pre‑select that slot:
    setTimeSlot(data.best.timeSlot);
  };

  if (!cart) return <p>Loading cart…</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Checkout</h1>

      <h2>Order Summary</h2>
      <ul>
        {cart.items.map((item) => (
          <li key={item.productId}>
            {item.name} × {item.quantity} — ₹{item.priceAtTime.toFixed(2)}
          </li>
        ))}
      </ul>
      <p><strong>Total: ₹{cart.totalAmount.toFixed(2)}</strong></p>

      <h2>Select Delivery Time Slot</h2>
      {['morning','afternoon','evening'].map((slot) => (
        <label key={slot} style={{ marginRight: '1rem' }}>
          <input
            type="radio"
            name="timeslot"
            value={slot}
            checked={timeSlot === slot}
            onChange={() => setTimeSlot(slot)}
          /> {slot.charAt(0).toUpperCase()+slot.slice(1)}
        </label>
      ))}

      <h2>Select Delivery Location</h2>
      <AddressPicker onSelect={setAddress}/>
      {address && (
        <p>
          Selected coords: {address.lat.toFixed(5)}, {address.lng.toFixed(5)}
        </p>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Placing Order…' : 'Place Order & Earn GreenCoins'}
      </button>
      <button onClick={() => window.location.href = '/rewards'}>See Coins</button>
      {result && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #4caf50' }}>
          <h3>🎉 Order Confirmed!</h3>
          <p>CO₂ Saved: <strong>{(result.co2Saved/1000).toFixed(2)} kg</strong></p>
          <p>GreenCoins Earned: <strong>{result.rewardCoins}</strong></p>
        </div>
      )}
    </div>
  );
}
