'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddressPicker from '@/components/AddressPicker';

export default function AddWarehousePage() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.address || !formData.lat || !formData.lng) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
      setError('Invalid latitude or longitude values.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          location: {
            address: formData.address,
            lat,
            lng,
          },
        }),
      });

      if (response.ok) {
        alert('✅ Warehouse added successfully!');
      } else {
        try {
          const data = await response.json();
          setError(data.error || 'Failed to add warehouse.');
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          setError('Failed to add warehouse: Unable to parse server response.');
        }
      }
    } catch (err) {
      setError('An error occurred while adding the warehouse.');
      console.error('Add warehouse error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Warehouse</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Warehouse Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="e.g., Central Warehouse"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warehouse Location *
            </label>
            <AddressPicker onSelect={handleAddressSelect} />
            {formData.address && (
              <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
                <p><strong>Selected:</strong> {formData.address}</p>
                <p>Lat: {formData.lat}, Lng: {formData.lng}</p>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Adding Warehouse...' : 'Add Warehouse'}
          </button>
        </form>
      </div>
    </div>
  );
}