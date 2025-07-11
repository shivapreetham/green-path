'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, isLoading } = useCartStore();
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [consumerLocation, setConsumerLocation] = useState({ lat: 36.1699, lng: -115.1398 }); // Default: Las Vegas
  const router = useRouter();

  useEffect(() => {
    if (cart?.items?.length > 0) {
      fetchRecommendations();
    }
  }, [cart]);

  const fetchRecommendations = async () => {
    try {
      const productIds = cart.items.map(item => item.productId._id);
      const response = await fetch('/api/cart/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds, consumerLocation }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const getCarbonScoreColor = (score) => {
    if (score <= 30) return 'text-green-600 bg-green-100';
    if (score <= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCarbonScoreLabel = (score) => {
    if (score <= 30) return 'Eco-Friendly';
    if (score <= 60) return 'Moderate Impact';
    return 'High Impact';
  };

  const calculatePotentialSavings = () => {
    if (!recommendations.length) return 0;
    const cartCarbonScore = cart?.totalCarbonScore || 0;
    const bestAlternativeScore = recommendations.reduce(
      (min, rec) => Math.min(min, rec.totalCarbonFootprint),
      cartCarbonScore
    );
    return Math.max(0, cartCarbonScore - bestAlternativeScore);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Start shopping for eco-friendly products!</p>
            <Link
              href="/products"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <Link
            href="/products"
            className="text-green-600 hover:text-green-700 ff-font-medium"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.productId._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.productId.image || '/placeholder-image.jpg'}
                      alt={item.productId.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.productId.name}</h3>
                    <p className="text-gray-600 text-sm">{item.productId.brand}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-green-600">
                        ${item.priceAtTime.toFixed(2)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCarbonScoreColor(item.carbonScoreAtTime)}`}>
                        {item.carbonScoreAtTime}/100
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId._id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-x">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId._id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Carbon Score:</span>
                  <span className={`font-medium ${getCarbonScoreColor(cart.totalCarbonScore)}`}>
                    {cart.totalCarbonScore}/100
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">${cart.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => router.push('/checkout')} className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors mt-6">
                Proceed to Checkout
              </button>
            </div>
          </div>
          {/* Recommendations Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">🌱 Eco Alternatives</h2>
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showRecommendations ? '−' : '+'}
                </button>
              </div>
              {showRecommendations && (
                <>
                  {calculatePotentialSavings() > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600">🌱</span>
                        <span className="text-sm font-medium text-green-800">
                          Potential Carbon Savings
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {calculatePotentialSavings()} points
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Switch to better alternatives
                      </p>
                    </div>
                  )}
                  <div className="space-y-4">
                    {recommendations.slice(0, 5).map((rec) => (
                      <div key={rec._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={rec.image || '/placeholder-image.jpg'}
                              alt={rec.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">{rec.name}</h4>
                            <p className="text-gray-600 to-text-xs">{rec.brand}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-green-600">${rec.price?.toFixed(2)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCarbonScoreColor(rec.totalCarbonFootprint)}`}>
                            {rec.totalCarbonFootprint.toFixed(1)}
                          </span>
                        </div>
                        {rec.totalCarbonFootprint < cart.totalCarbonScore && (
                          <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                            <p className="text-xs text-green-800">
                              🌱 {(cart.totalCarbonScore - rec.totalCarbonFootprint).toFixed(1)} carbon points better
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Link
                            href={`/products/${rec._id}`}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-xs font-medium hover:bg-green-700 transition-colors text-center"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => useCartStore.getState().addToCart(rec._id, 1)}
                            className="bg-green-100 text-green-600 py-2 px-3 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {recommendations.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-2">🔍</div>
                      <p className="text-gray-600 text-sm">No recommendations available</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}