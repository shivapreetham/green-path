'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  'Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Food & Beverages', 'Beauty', 'Automotive', 'Other'
];

const packagingTypes = ['Plastic', 'Cardboard', 'Glass'];

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    image: '',
    baseCarbonFootprint: '',
    packagingType: 'Plastic',
    tags: '',
    specifications: '',
    warehouseStocks: [], // Array of { warehouseId, stock }
  });

  // Fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await fetch('/api/warehouses');
        if (response.ok) {
          
          const data = await response.json();
          // console.log(data);
          setWarehouses(data|| []);
        } else {
          setError('Failed to fetch warehouses.');
        }
      } catch (error) {
        setError('Error fetching warehouses.');
        console.error('Error fetching warehouses:', error);
      }
    };
    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWarehouseChange = (index, field, value) => {
    setFormData((prev) => {
      const newWarehouseStocks = [...prev.warehouseStocks];
      newWarehouseStocks[index] = { ...newWarehouseStocks[index], [field]: value };
      return { ...prev, warehouseStocks: newWarehouseStocks };
    });
  };

  const addWarehouse = () => {
    setFormData((prev) => ({
      ...prev,
      warehouseStocks: [...prev.warehouseStocks, { warehouseId: '', stock: '' }],
    }));
  };

  const removeWarehouse = (index) => {
    setFormData((prev) => ({
      ...prev,
      warehouseStocks: prev.warehouseStocks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    const requiredFields = ['name', 'description', 'price', 'category', 'brand', 'image', 'baseCarbonFootprint', 'packagingType'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError('All required fields must be filled.');
        setLoading(false);
        return;
      }
    }

    if (formData.warehouseStocks.length === 0) {
      setError('At least one warehouse with stock is required.');
      setLoading(false);
      return;
    }

    const price = parseFloat(formData.price);
    const baseCarbonFootprint = parseFloat(formData.baseCarbonFootprint);
    if (isNaN(price) || price < 0 || isNaN(baseCarbonFootprint) || baseCarbonFootprint < 0) {
      setError('Price and base carbon footprint must be valid non-negative numbers.');
      setLoading(false);
      return;
    }

    for (const { warehouseId, stock } of formData.warehouseStocks) {
      if (!warehouseId || !stock || parseInt(stock, 10) < 0 || isNaN(parseInt(stock, 10))) {
        setError('All warehouse selections and stock values must be valid.');
        setLoading(false);
        return;
      }
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price,
        category: formData.category,
        brand: formData.brand,
        image: formData.image,
        baseCarbonFootprint,
        packagingType: formData.packagingType,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        specifications: formData.specifications
          .split(',')
          .map(spec => spec.trim())
          .filter(spec => spec)
          .reduce((acc, spec) => {
            const [key, value] = spec.split(':').map(s => s.trim());
            if (key && value) acc[key] = value;
            return acc;
          }, {}),
        warehouseStocks: formData.warehouseStocks.map(({ warehouseId, stock }) => ({
          warehouseId,
          stock: parseInt(stock, 10),
        })),
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert('✅ Product added successfully!');
        router.push('/products');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create product.');
      }
    } catch (error) {
      setError('An error occurred while adding the product.');
      console.error('Add product error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Eco-Friendly T-Shirt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="e.g., Sustainable cotton T-shirt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 29.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., GreenLiving"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Carbon Footprint (kg CO2) *</label>
              <input
                type="number"
                name="baseCarbonFootprint"
                value={formData.baseCarbonFootprint}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 5.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Packaging Type *</label>
              <select
                name="packagingType"
                value={formData.packagingType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {packagingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., eco-friendly, sustainable"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specifications (key:value, comma-separated)</label>
              <input
                type="text"
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., material:cotton, size:medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warehouses & Stock *</label>
              {formData.warehouseStocks.map((ws, index) => (
                <div key={index} className="flex gap-4 mb-2">
                  <select
                    value={ws.warehouseId}
                    onChange={(e) => handleWarehouseChange(index, 'warehouseId', e.target.value)}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={ws.stock}
                    onChange={(e) => handleWarehouseChange(index, 'stock', e.target.value)}
                    required
                    min="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Stock"
                  />
                  <button
                    type="button"
                    onClick={() => removeWarehouse(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addWarehouse}
                className="mt-2 text-sm text-green-600 hover:underline"
              >
                + Add Another Warehouse
              </button>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}