// app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EcoWalmartian - Walmart\'s Greenverse',
  description: 'Discover eco-friendly alternatives and make sustainable choices',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`}
          async
          defer
        ></script>
      </head>
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-green-600">EcoWalmartian</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-green-600 transition-colors">
              Products
            </Link>
            <Link href="/add-product" className="text-gray-600 hover:text-green-600 transition-colors">
              Add Product
            </Link>
            <Link href="/orders" className="text-gray-600 hover:text-green-600 transition-colors">
              Orders
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/cart"
              className="relative bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🛒 Cart
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold">GreenPath</span>
            </div>
            <p className="text-gray-400">
              Making sustainable shopping easy and accessible for everyone.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white">Products</Link></li>
              <li><Link href="/cart" className="text-gray-400 hover:text-white">Cart</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400">Electronics</span></li>
              <li><span className="text-gray-400">Clothing</span></li>
              <li><span className="text-gray-400">Home & Garden</span></li>
              <li><span className="text-gray-400">Food & Beverages</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <p className="text-gray-400 text-sm">
              GreenPath helps you make environmentally conscious choices by providing 
              eco-friendly alternatives to everyday products.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 GreenPath. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}