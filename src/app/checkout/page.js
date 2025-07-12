'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import AddressPicker from '@/components/PickAddress';
import useCartStore from '@/store/cartStore';
import {
  Loader2,
  MapPin,
  ShoppingCart,
  Timer,
  Coins,
  ArrowRightCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const [address, setAddress] = useState(null);
  const [timeSlot, setTimeSlot] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [bestSlot, setBestSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [result, setResult] = useState(null);

  const { sessionId, fetchCart, cart } = useCartStore();
  console.log(cart);
  

  useEffect(() => {
    if (!sessionId) return;
    fetchCart().catch(console.error);
  }, [sessionId]);

  useEffect(() => {
    if (!result) return;
    const rewardCoins = result?.rewardCoins || 0;
    const parsed = JSON.parse(localStorage.getItem('checkoutResult'))
    const alreadyCoins = parsed?parsed.totalCoins:0;
    const totalCoins = alreadyCoins + rewardCoins;
    const co2Saved = result?.co2Saved || 0;
    localStorage.setItem('checkoutResult', JSON.stringify({ totalCoins, co2Saved }));
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#34d399', '#10b981', '#22c55e', '#a7f3d0'],
    });
  }, [result]);

  const handleCheckout = async () => {
    if (!address || !timeSlot) {
      alert('Please select your delivery location and a time slot.');
      return;
    }

    setLoadingCheckout(true);
    setResult(null);

    const payload = {
      sessionId,
      address: {
        fullAddress: address.fullAddress,
        lat: address.lat,
        lng: address.lng,
      },
      timeSlot,
    };

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
    setLoadingCheckout(false);
  };

  const onSelectAddress = async (pos) => {
    setAddress(pos);
    setLoadingSlots(true);
    setTimeSlot(null);
    setAllSlots([]);
    setBestSlot(null);

    const res = await fetch('/api/checkout/suggest-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pos),
    });
    const data = await res.json();
    setBestSlot(data.best);
    setAllSlots(data.all);
    setTimeSlot(data.best.timeSlot);
    setLoadingSlots(false);
  };

  if (!cart) {
    return (
      <div className="max-w-xl mx-auto mt-20">
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

    return (
  <motion.div
    className="max-w-5xl mx-auto p-6 space-y-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {/* Side-by-side layout for Order Summary + Address */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Order Summary */}
      <Card className="shadow-lg">
        <CardHeader className="flex items-center gap-2">
          <ShoppingCart className="text-orange-600" />
          <CardTitle className="text-xl font-bold text-gray-800">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-base text-gray-700">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex justify-between font-semibold">
              <span>{item.productId.name} × {item.quantity}</span>
              <span className="font-medium">₹{item.priceAtTime.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total</span>
            <span className="text-lg font-bold text-gray-900">₹{cart.totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Address Picker + Selected */}
      <Card className="shadow-lg">
        <CardHeader className="flex items-center gap-2">
          <MapPin className="text-blue-600" />
          <CardTitle className="text-xl font-bold text-gray-800">Select Delivery Location</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressPicker onSelect={onSelectAddress} />
          {address?.fullAddress && (
            <motion.div
              className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-900 flex gap-2 items-start border border-blue-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MapPin className="w-5 h-5 mt-0.5 text-blue-500" />
              <div>
                <strong className="block mb-1">Selected Address:</strong>
                <span className="text-[15px]">{address.fullAddress}</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>

    {/* Loader */}
    {loadingSlots && (
      <motion.div
        className="flex flex-col items-center gap-3 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        <p className="text-center text-gray-700 font-medium">
          🌍 Finding the most eco-friendly delivery route…
        </p>
        <div className="w-56 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </div>
      </motion.div>
    )}

    {/* Time Slots Block View */}
    {!loadingSlots && allSlots.length > 0 && (
      <Card className="shadow-md border">
  <CardHeader className="flex items-center gap-2">
    <Timer className="text-purple-600" />
    <CardTitle className="text-xl font-bold text-gray-800">Choose Delivery Time Slot</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {allSlots.map((slot) => {
      const isSelected = slot.timeSlot === timeSlot;
      const isBest = slot.timeSlot === bestSlot.timeSlot;
      return (
        <motion.div
          key={slot.timeSlot}
          onClick={() => setTimeSlot(slot.timeSlot)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`
            card-slot-base w-full flex gap-4 items-start
            ${isSelected ? 'border-green-600 bg-green-50 shadow-lg' : ''}
            ${isBest ? 'card-slot-highlight' : ''}
          `}
        >
          {/* Radio Circle */}
          <div className="mt-1 w-5 h-5 flex-shrink-0 rounded-full border-2 border-gray-400 flex items-center justify-center">
            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {isBest && (
              <motion.div
                className="absolute top-2 right-2 text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full shadow-md animate-pulse"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ repeat: Infinity, duration: 1.6, repeatType: 'mirror' }}
              >
                ⭐ Best Option
              </motion.div>
            )}
            <div className="text-lg font-semibold text-gray-800 capitalize">
              ⏰ {slot.timeSlot}
            </div>
            <p className="text-[15px] text-gray-700 mt-2 leading-relaxed">
              🌿 <strong>Peers Nearby:</strong> {slot.peers}<br />
              💨 <strong className="text-green-700 text-base whitespace-nowrap">
                CO₂ Saved: {slot.savings.toFixed(2)} kg
              </strong>
            </p>
          </div>
        </motion.div>
      );
    })}
  </CardContent>
</Card>

    )}

    {/* Actions */}
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center pt-4">
      <Button
        disabled={loadingCheckout || !timeSlot}
        onClick={handleCheckout}
        className="btn-fancy w-full md:w-auto text-base cursor-pointer"
      >
        {loadingCheckout ? (
          <>
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
            Placing Order…
          </>
        ) : (
          <>
            🌱 Place Order & Earn <Coins className="w-4 h-4 ml-1" />
          </>
        )}
      </Button>
      <Button
        variant="secondary"
        onClick={() => (window.location.href = '/rewards')}
        className="btn-secondary-fancy flex items-center gap-2 text-base cursor-pointer"
      >
        See GreenCoins <ArrowRightCircle className="w-4 h-4" />
      </Button>
    </div>

    {/* Confirmation */}
    {result && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-green-500 shadow-md mt-6">
          <CardHeader className="flex items-center gap-2">
            🎉 <CardTitle className="text-xl font-bold text-green-800">
              Order Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-base text-green-900 space-y-2">
            <p>
              💨 CO₂ Saved: <strong>{(result.co2Saved / 1000).toFixed(2)} kg</strong>
            </p>
            <p>
              🪙 GreenCoins Earned: <strong>{result.rewardCoins}</strong>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )}
  </motion.div>
);

}
