"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AddressPicker from "@/components/PickAddress";
import useCartStore from "@/store/cartStore";

export default function CheckoutPage() {
  const [address, setAddress] = useState(null);
  const [timeSlot, setTimeSlot] = useState("morning");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const { sessionId, fetchCart, cart } = useCartStore();

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    fetchCart()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (!result) return;
    const rewardCoins = result?.rewardCoins || 0;
    const alreadyCoins = JSON.parse(
      localStorage.getItem("checkoutResult") || 0
    );
    localStorage.setItem(
      "checkoutResult",
      JSON.stringify(alreadyCoins + rewardCoins)
    );
  }, [result]);

  const handleCheckout = async () => {
    if (!address) {
      alert("Please select your delivery location.");
      return;
    }
    setLoading(true);
    setResult(null);
    const payload = {
      sessionId,
      address: {
        fullAddress: address.fullAddress, // 👈 now coming from picker
        lat: address.lat,
        lng: address.lng,
      },
      timeSlot,
    };

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };
  const onSelectAddress = async (pos) => {
    setAddress(pos);
    
    const res = await fetch("/api/checkout/suggest-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pos),
    });
    const data = await res.json();
    setSuggestion(data.best);
    setTimeSlot(data.best.timeSlot);
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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🛒 Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>₹{item.priceAtTime.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total</span>
            <span>₹{cart.totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📅 Select Delivery Time Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={timeSlot}
            onValueChange={setTimeSlot}
            className="flex gap-4"
          >
            {["morning", "afternoon", "evening"].map((slot) => (
              <div key={slot} className="flex items-center space-x-2">
                <RadioGroupItem value={slot} id={slot} />
                <Label htmlFor={slot} className="capitalize">
                  {slot}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📍 Select Delivery Location</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressPicker onSelect={onSelectAddress} />
          {address?.fullAddress && (
      <p className="mt-3 text-muted-foreground text-sm">
        📌 <strong>Selected:</strong> {address.fullAddress}
      </p>
    )}
          {address && suggestion && (
            <div className="bg-green-100 text-green-800 p-4 mt-4 rounded-md text-sm">
              ✅ Best slot: <strong>{suggestion.timeSlot}</strong>
              <br />
              Nearby orders: {suggestion.peers}
              <br />
              Estimated CO₂ saved:{" "}
              <strong>{suggestion.savings.toFixed(2)} kg</strong>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <Button disabled={loading} onClick={handleCheckout}>
          {loading ? "Placing Order…" : "Place Order & Earn GreenCoins"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/rewards")}
        >
          See GreenCoins
        </Button>
      </div>

      {result && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle>🎉 Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-900">
            <p>
              CO₂ Saved:{" "}
              <strong>{(result.co2Saved / 1000).toFixed(2)} kg</strong>
            </p>
            <p>
              GreenCoins Earned: <strong>{result.rewardCoins}</strong>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
