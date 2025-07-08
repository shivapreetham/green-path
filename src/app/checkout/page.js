'use client';

import { useEffect, useState } from 'react';
import AddressPicker from '@/components/AddressPicker';
import useCartStore from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [address, setAddress] = useState(null);
  const { cart, fetchCart, clearCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    fetchCart(); // load cart when component mounts
  }, []);

  const handleSubmit = async () => {
    if (!address || cart.items.length === 0) {
      alert("Please select address and ensure your cart isn't empty.");
      return;
    }

    const orderData = {
      customerName: 'Abhinav Dev', // demo only
      address: {
        fullAddress: address.address,
        lat: address.lat,
        lng: address.lng,
      },
      items: cart.items.map(item => ({
        productId: item.productId._id || item.productId,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
      })),
      totalAmount: cart.totalAmount,
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (res.ok) {
      alert('✅ Order placed successfully!');
      clearCart(); // optional: clear after order
      router.push('/orders'); // redirect to orders list
    } else {
      alert('❌ Failed to place order');
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>

      <AddressPicker onSelect={(addr) => setAddress(addr)} />

      {address && (
        <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
          <p><strong>Selected:</strong> {address.address}</p>
        </div>
      )}

      <div className="mt-4 bg-white p-3 border rounded">
        <h2 className="font-semibold mb-2">🛒 Your Cart</h2>
        {cart.items.map((item, idx) => (
          <div key={idx} className="text-sm mb-1">
            <p>{item.productId.name} × {item.quantity} = ₹{item.priceAtTime * item.quantity}</p>
          </div>
        ))}
        <p className="mt-2 font-medium">Total: ₹{cart.totalAmount}</p>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded mt-4 w-full"
      >
        🧾 Place Order
      </button>
    </div>
  );
}
