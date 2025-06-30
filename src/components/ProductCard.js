import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <div className="border rounded p-4">
      <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover mb-2" />
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-gray-600">${product.price}</p>
      <p className="text-sm">Carbon Footprint: {product.carbonFootprint} kg CO2e</p>
      <Link href={`/products/${product._id}`} className="text-green-500">
        View Details
      </Link>
    </div>
  );
}