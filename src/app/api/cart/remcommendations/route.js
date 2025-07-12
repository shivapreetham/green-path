import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Product } from '@/models';

// Packaging carbon footprint values
const packagingCfDict = { "Plastic": 2, "Cardboard": 1, "Glass": 3 }; // in kg CO2
const emissionFactor = 0.1; // kg CO2 per km for transportation

// Haversine function to calculate distance between two lat-long points
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Function to calculate total carbon footprint
function calculateTotalCf(product, consumerLocation) {
  const baseCf = product.baseCarbonFootprint || product.carbonScore || 0;
  const packagingCf = packagingCfDict[product.packagingType] || 0;
  const distance = haversine(
    product.latitude,
    product.longitude,
    consumerLocation.lat,
    consumerLocation.lng
  );
  const transportationCf = emissionFactor * distance;
  return baseCf + packagingCf + transportationCf;
}

// Recommendation function
function recommendProducts(genre, consumerLocation, products, topN = 3) {
  const candidates = products.filter((p) => p.genre === genre);
  const recommendations = candidates
    .map((p) => ({
      ...p,
      totalCarbonFootprint: calculateTotalCf(p, consumerLocation),
    }))
    .sort((a, b) => a.totalCarbonFootprint - b.totalCarbonFootprint)
    .slice(0, topN);
  return recommendations;
}

export async function POST(request) {
  try {
    await connectDB();
    
    const { productIds, consumerLocation } = await request.json();
    
    if (!productIds || !consumerLocation || !consumerLocation.lat || !consumerLocation.lng) {
      return NextResponse.json(
        { error: 'Product IDs and consumer location required' },
        { status: 400 }
      );
    }

    // Fetch all products
    const products = await Product.find({}).lean();
    
    // Get cart products to determine genres
    const cartProducts = products.filter(p => productIds.includes(p._id.toString()));
    const genres = [...new Set(cartProducts.map(p => p.genre))];
    
    // Generate recommendations for each genre
    const recommendations = genres.flatMap(genre => 
      recommendProducts(genre, consumerLocation, products, 3)
    );
    
    // Remove duplicates and limit to top 5
    const uniqueRecommendations = Array.from(new Set(recommendations.map(p => p._id.toString())))
      .map(id => recommendations.find(p => p._id.toString() === id))
      .slice(0, 5);
    
    return NextResponse.json({ recommendations: uniqueRecommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}