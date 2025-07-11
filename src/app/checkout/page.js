'use client';

import { useEffect, useState } from 'react';
import AddressPicker from '@/components/AddressPicker';
import useCartStore from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [address, setAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cart, fetchCart, clearCart } = useCartStore();
  const router = useRouter();

  // Fetch cart data when the component mounts
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleSubmit = async () => {
    // Validate address and cart
    if (!address || cart.items.length === 0) {
      alert("Please select an address and ensure your cart isn't empty.");
      return;
    }

    setIsSubmitting(true); // Disable button during submission

    try {
      const orderData = {
        customerName: 'Abhinav Dev', // TODO: Replace with authenticated user data
        address: {
          fullAddress: address.address,
          lat: address.lat,
          lng: address.lng,
        },
        items: cart.items.map(item => ({
          productId: item.productId._id || item.productId, // Handle populated or raw ID
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
        clearCart(); // Clear cart after successful order
        router.push('/orders'); // Redirect to orders page
      } else {
        const errorData = await res.json();
        alert(`❌ Failed to place order: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('❌ An error occurred while placing the order');
      console.error('Order submission error:', error);
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>

      {/* Address Picker */}
      <AddressPicker onSelect={(addr) => setAddress(addr)} />

      {/* Display selected address */}
      {address && (
        <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
          <p><strong>Selected:</strong> {address.address}</p>
        </div>
      )}

      {/* Cart Summary */}
      <div className="mt-4 bg-white p-3 border rounded">
        <h2 className="font-semibold mb-2">🛒 Your Cart</h2>
        {cart.items.length === 0 ? (
          <p className="text-sm text-gray-500">Your cart is empty.</p>
        ) : (
          cart.items.map((item, idx) => (
            <div key={idx} className="text-sm mb-1">
              <p>
                {item.productId.name} × {item.quantity} = ₹{item.priceAtTime * item.quantity}
              </p>
            </div>
          ))
        )}
        <p className="mt-2 font-medium">Total: ₹{cart.totalAmount}</p>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || cart.items.length === 0}
        className="bg-blue-500 text-white p-2 rounded mt-4 w-full disabled:opacity-50"
      >
        {isSubmitting ? 'Placing Order...' : '🧾 Place Order'}
      </button>
    </div>
  );
}