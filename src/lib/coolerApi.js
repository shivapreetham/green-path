export async function calculateCarbonFootprint(productData) {
  try {
    // Construct enhanced product description
    const getEnhancedProductDescription = (product) => {
      const { name, description, category, brand, tags = [], specifications = {} } = product;
      const specEntries = Object.entries(specifications)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      const tagsString = tags.length ? `Tags: ${tags.join(', ')}.` : '';
      return [
        `${name}.`,
        description || '',
        `Category: ${category || 'General'}.`,
        `Brand: ${brand || 'Unbranded'}.`,
        specEntries ? `Specifications: ${specEntries}.` : '',
        tagsString
      ].filter(Boolean).join(' ');
    };

    // Prepare payload for Cooler API
    const payload = {
      items: [
        {
          productName: productData.name,
          productDescription: getEnhancedProductDescription(productData),
          productPrice: productData.price,
          postalCode: '560001', // Default postal code (modify as needed)
          newProduct: true,
          externalId: productData._id || 'new-product'
        }
      ]
    };

    // Call Cooler API
    const response = await fetch('https://api.cooler.dev/v2/footprint/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cooler-Api-Key': process.env.COOLER_API_KEY || 'your-cooler-api-key' // Replace with actual key in environment
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Cooler API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data?.items?.length > 0) {
      return data.items[0].footprint.carbonFootprint; // Return carbon footprint in kg CO2
    }

    throw new Error('Invalid API response');
  } catch (error) {
    console.error('Carbon footprint calculation failed:', error);
    // Fallback to mock calculation based on category
    const baseFootprints = {
      'Electronics': 100,
      'Clothing': 20,
      'Home & Garden': 50,
      'Books': 5,
      'Sports': 30,
      'Food & Beverages': 10,
      'Beauty': 15,
      'Automotive': 200,
      'Other': 50
    };
    const base = baseFootprints[productData.category] || 50;
    const variation = Math.random() * 20 - 10;
    return Math.max(0, base + variation);
  }
}