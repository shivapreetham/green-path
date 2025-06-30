'use client';

import { useState } from 'react';

export default function AddProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    carbonFootprint: '',
    imageUrl: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
        carbonFootprint: parseFloat(formData.carbonFootprint),
      }),
    });
    if (res.ok) {
      alert('Product added successfully!');
      setFormData({ name: '', description: '', price: '', category: '', carbonFootprint: '', imageUrl: '' });
    } else {
      alert('Failed to add product.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block">Price ($)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          step="0.01"
          required
        />
      </div>
      <div>
        <label className="block">Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block">Carbon Footprint (kg CO2e)</label>
        <input
          type="number"
          name="carbonFootprint"
          value={formData.carbonFootprint}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          step="0.01"
          required
        />
      </div>
      <div>
        <label className="block">Image URL</label>
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Add Product
      </button>
    </form>
  );
}