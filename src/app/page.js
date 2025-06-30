import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to GreenPath</h1>
      <p className="mb-4">Discover eco-friendly products with low carbon footprints.</p>
      <Link href="/products" className="bg-green-500 text-white px-4 py-2 rounded">
        Shop Now
      </Link>
    </div>
  );
}