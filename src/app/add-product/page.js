'use client';

import AddProductForm from '../../components/AddProductForm';

export default function AddProductPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      <AddProductForm />
    </div>
  );
}