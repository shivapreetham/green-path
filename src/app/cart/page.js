'use client';

import { useEffect, useState } from 'react';
import useCartStore from '../../store/cartStore';
import CartItem from '../../components/CartItem';

export default function CartPage() {
  const { cartItems, clearCart } = useCartStore();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchCartProducts() {
      const fetchedProducts = await Promise.all(
        cartItems.map(async (item) => {
          const res = await fetch(`/api/products/${item.productId}`);
          return res.json();
        })
      );
      setProducts(fetchedProducts);
    }
    if (cartItems.length > 0) fetchCartProducts();
  }, [cartItems]);

  const totalPrice = products.reduce(
    (sum, p) => sum + (cartItems.find((i) => i.productId === p._id)?.quantity || 0) * p.price,
    0
  );
  const totalCarbonFootprint = products.reduce(
    (sum, p) =>
      sum + (cartItems.find((i) => i.productId === p._id)?.quantity || 0) * p.carbonFootprint,
    0
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {products.map((product) => (
              <CartItem
                key={product._id}
                product={product}
                quantity={cartItems.find((i) => i.productId === product._id)?.quantity || 0}
              />
            ))}
          </div>
          <div className="mt-4">
            <p>Total Price: ${totalPrice.toFixed(2)}</p>
            <p>Total Carbon Footprint: {totalCarbonFootprint.toFixed(2)} kg CO2e</p>
            <button
              onClick={clearCart}
              className="bg-red-500 text-white px-4 py-2 rounded mt-2"
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}