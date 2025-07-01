import { connectToDatabase, Product } from '@/lib/db';
import ProductCard from '@/components/ProductCard';

export default async function ProductsPage() {
  await connectToDatabase();
  const products = await Product.find().lean();
  console.log('Products fetched:', products); // Add this
  const plainProducts = products.map((p) => ({ ...p, _id: p._id.toString() }));
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {plainProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}