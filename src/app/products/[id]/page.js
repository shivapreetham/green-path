// app/products/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  const { 
    addToCart, 
    isLoading: cartLoading, 
    error: cartError,
    initializeSession,
    fetchCart,
    clearError 
  } = useCartStore();

  // Initialize cart session and fetch cart on component mount
  useEffect(() => {
    initializeSession();
    fetchCart();
  }, [initializeSession, fetchCart]);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setProduct(data.product);
        setRecommendations(data.recommendations || []);
      } else {
        setError(data.error || 'Product not found');
      }
    } catch (error) {
      console.error('Fetch product error:', error);
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      clearError();
      await addToCart(params.id, quantity);
      console.log('Product added to cart successfully');
    } catch (error) {
      console.error('Add to cart error:', error);
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

  const calculateCarbonSavings = (currentScore, altScore) => {
    return Math.max(0, currentScore - altScore);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/products"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-green-600">Home</Link></li>
            <li><span className="mx-2">›</span></li>
            <li><Link href="/products" className="hover:text-green-600">Products</Link></li>
            <li><span className="mx-2">›</span></li>
            <li className="text-gray-800 font-medium">{product?.name}</li>
          </ol>
        </nav>
        {cartError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{cartError}</p>
            <button 
              onClick={clearError}
              className="text-red-600 underline text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={product?.image || '/placeholder-image.jpg'}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product?.name}</h1>
              <p className="text-gray-600 mb-4">{product?.brand}</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-green-600">
                  ${product?.price?.toFixed(2)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCarbonScoreColor(product?.carbonScore)}`}>
                  {getCarbonScoreLabel(product?.carbonScore)} ({product?.carbonScore}/100)
                </span>
              </div>
            </div>
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-1">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product?.description}</p>
            </div>
            {product?.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-gray-800 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t pt-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || product?.stock === 0}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
                <Link
                  href="/cart"
                  className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  View Cart
                </Link>
              </div>
              {product?.stock === 0 && (
                <p className="text-red-600 text-sm mt-2">Out of stock</p>
              )}
              {product?.stock > 0 && product?.stock <= 5 && (
                <p className="text-yellow-600 text-sm mt-2">Only {product.stock} left in stock</p>
              )}
            </div>
          </div>
        </div>
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">🌱 Eco-Friendly Alternatives</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <div key={rec._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={rec.image || '/placeholder-image.jpg'}
                      alt={rec.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-800 mb-2">{rec.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{rec.brand}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xl font-bold text-green-600">${rec.price?.toFixed(2)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCarbonScoreColor(rec.carbonScore)}`}>
                        {rec.carbonScore}/100
                      </span>
                    </div>
                    {calculateCarbonSavings(product?.carbonScore, rec.carbonScore) > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">🌱</span>
                          <span className="text-sm font-medium text-green-800">
                            Save {calculateCarbonSavings(product?.carbonScore, rec.carbonScore)} carbon points
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link
                        href={`/products/${rec._id}`}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors text-center"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => addToCart(rec._id, 1)}
                        className="bg-green-100 Salternative
                        text-green-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}