'use client';

import useCartStore from '@/store/cartStore';

export default function ProductDetails({ product }) {
  const { addItem } = useCartStore();

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <img src={product.imageUrl} alt={product.name} className="w-full md:w-1/2 h-64 object-cover" />
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-lg font-semibold">${product.price}</p>
        <p>Carbon Footprint: {product.carbonFootprint} kg CO2e</p>
        <button
          onClick={() => addItem(product)}
          className="bg-green-500 text-white px-4 py-2 rounded mt-2"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}