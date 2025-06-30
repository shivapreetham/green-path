import { connectToDatabase, Product } from '../../../lib/db';
import ProductDetails from '../../../components/ProductDetails';
import RecommendationList from '../../../components/RecommendationList';

export default async function ProductPage({ params }) {
  await connectToDatabase();
  const product = await Product.findById(params.id).lean();
  if (!product) return <div>Product not found</div>;

  const recommendations = await Product.find({
    category: product.category,
    carbonFootprint: { $lt: product.carbonFootprint },
  })
    .limit(3)
    .lean();

  const plainProduct = { ...product, _id: product._id.toString() };
  const plainRecommendations = recommendations.map((r) => ({ ...r, _id: r._id.toString() }));

  return (
    <div className="container mx-auto p-4">
      <ProductDetails product={plainProduct} />
      <RecommendationList recommendations={plainRecommendations} />
    </div>
  );
}