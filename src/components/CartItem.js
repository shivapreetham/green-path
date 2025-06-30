'use client';

import useCartStore from '../../store/cartStore';

export default function CartItem({ product, quantity }) {
  const { removeItem } = useCartStore();

  return (
    <div className="flex items-center border-b py-2">
      <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover mr-4" />
      <div className="flex-1">
        <h3 className="font-semibold">{product.name}</h3>
        <p>Quantity: {quantity}</p>
        <p>${(product.price * quantity).toFixed(2)}</p>
      </div>
      <button onClick={() => removeItem(product._id)} className="text-red-500">
        Remove
      </button>
    </div>
  );
}