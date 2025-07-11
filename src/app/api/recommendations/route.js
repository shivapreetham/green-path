import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Product, Recommendation, Cart } from '@/models';

// Packaging carbon footprint dictionary and emission factor
const packagingCfDict = { "Plastic": 2, "Cardboard": 1, "Glass": 3 };
const emissionFactor = 0.1; // kg CO2 per km

// Haversine formula to calculate distance between two points (in km)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate total carbon footprint for a product
function calculateTotalCarbonFootprint(product, consumerLat, consumerLng) {
  const baseCf = product.baseCarbonFootprint || 0;
  const packagingCf = packagingCfDict[product.packagingType] || 0;
  const distance = haversine(product.latitude, product.longitude, consumerLat, consumerLng);
  const transportationCf = emissionFactor * distance;
  return baseCf + packagingCf + transportationCf;
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const productId = searchParams.get('productId');
    const consumerLat = parseFloat(searchParams.get('consumerLat')) || 36.1699; // Default: Las Vegas
    const consumerLng = parseFloat(searchParams.get('consumerLng')) || -115.1398;

    if (sessionId) {
      const recommendations = await getCartRecommendations(sessionId, consumerLat, consumerLng);
      return NextResponse.json({ recommendations });
    }

    if (productId) {
      const recommendations = await getProductRecommendations(productId, consumerLat, consumerLng);
      return NextResponse.json({ recommendations });
    }

    return NextResponse.json(
      { error: 'Either sessionId or productId required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Recommendations API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

async function getCartRecommendations(sessionId, consumerLat, consumerLng) {
  try {
    const cart = await Cart.findOne({ sessionId })
      .populate('items.productId')
      .lean();

    if (!cart || cart.items.length === 0) {
      return [];
    }

    const recommendations = [];

    for (const item of cart.items) {
      const product = item.productId;
      const productTotalCf = calculateTotalCarbonFootprint(product, consumerLat, consumerLng);

      // Find alternatives with lower totalCarbonFootprint
      const alternatives = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        isActive: true,
        stock: { $gt: 0 },
      }).lean();

      const alternativesWithCf = alternatives
        .map(alt => ({
          ...alt,
          totalCarbonFootprint: calculateTotalCarbonFootprint(alt, consumerLat, consumerLng),
        }))
        .filter(alt => alt.totalCarbonFootprint < productTotalCf)
        .sort((a, b) => a.totalCarbonFootprint - b.totalCarbonFootprint)
        .slice(0, 3);

      alternativesWithCf.forEach(alt => {
        const carbonSavings = Math.round(
          (productTotalCf - alt.totalCarbonFootprint) * item.quantity
        );
        const priceDifference = Math.round(
          (alt.price - product.price) * item.quantity
        );

        recommendations.push({
          originalProduct: {
            _id: product._id,
            name: product.name,
            totalCarbonFootprint: productTotalCf,
            price: product.price,
          },
          recommendedProduct: {
            _id: alt._id,
            name: alt.name,
            totalCarbonFootprint: alt.totalCarbonFootprint,
            price: alt.price,
          },
          carbonSavings,
          priceDifference,
          quantity: item.quantity,
          similarity: calculateSimilarity(product, alt),
          recommendationType: 'cart_alternative',
        });
      });
    }

    // Sort by carbon savings and limit to top 5
    return recommendations.sort((a, b) => b.carbonSavings - a.carbonSavings).slice(0, 5);
  } catch (error) {
    console.error('Cart recommendations error:', error);
    return [];
  }
}

async function getProductRecommendations(productId, consumerLat, consumerLng) {
  try {
    const product = await Product.findById(productId).lean();

    if (!product) {
      return [];
    }

    const productTotalCf = calculateTotalCarbonFootprint(product, consumerLat, consumerLng);

    // Try ML-based recommendations first
    const mlRecommendations = await Recommendation.find({
      sourceProductId: productId,
    })
      .populate('recommendedProductId')
      .lean();

    if (mlRecommendations.length > 0) {
      const recommendationsWithCf = mlRecommendations
        .map(rec => {
          const alt = rec.recommendedProductId;
          const altTotalCf = calculateTotalCarbonFootprint(alt, consumerLat, consumerLng);
          return {
            _id: alt._id,
            name: alt.name,
            totalCarbonFootprint: altTotalCf,
            price: alt.price,
            carbonSavings: Math.round(productTotalCf - altTotalCf),
            similarity: rec.similarity,
            recommendationType: rec.recommendationType,
          };
        })
        .filter(rec => rec.carbonSavings > 0)
        .sort((a, b) => b.carbonSavings - a.carbonSavings)
        .slice(0, 8);

      if (recommendationsWithCf.length > 0) {
        return recommendationsWithCf;
      }
    }

    // Fallback to rule-based recommendations
    const alternatives = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      isActive: true,
      stock: { $gt: 0 },
    }).lean();

    const alternativesWithCf = alternatives
      .map(alt => ({
        ...alt,
        totalCarbonFootprint: calculateTotalCarbonFootprint(alt, consumerLat, consumerLng),
      }))
      .filter(alt => alt.totalCarbonFootprint < productTotalCf)
      .sort((a, b) => a.totalCarbonFootprint - b.totalCarbonFootprint)
      .slice(0, 8);

    return alternativesWithCf.map(alt => ({
      _id: alt._id,
      name: alt.name,
      totalCarbonFootprint: alt.totalCarbonFootprint,
      price: alt.price,
      carbonSavings: Math.round(productTotalCf - alt.totalCarbonFootprint),
      priceDifference: Math.round(alt.price - product.price),
      similarity: calculateSimilarity(product, alt),
      recommendationType: 'alternative',
    }));
  } catch (error) {
    console.error('Product recommendations error:', error);
    return [];
  }
}

function calculateSimilarity(product1, product2) {
  let similarity = 0;

  if (product1.category === product2.category) similarity += 0.4;
  if (product1.brand === product2.brand) similarity += 0.2;

  const priceDiff = Math.abs(product1.price - product2.price);
  const avgPrice = (product1.price + product2.price) / 2;
  if (priceDiff / avgPrice <= 0.2) similarity += 0.3;

  const commonTags = product1.tags?.filter(tag => product2.tags?.includes(tag)) || [];
  similarity += Math.min(commonTags.length * 0.1, 0.1);

  return Math.round(similarity * 100) / 100;
}

export async function POST(request) {
  try {
    await connectDB();
    const { sourceProductId, recommendations } = await request.json();

    if (!sourceProductId || !Array.isArray(recommendations)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    await Recommendation.deleteMany({ sourceProductId });

    const newRecommendations = recommendations.map(rec => ({
      sourceProductId,
      recommendedProductId: rec.productId,
      similarity: rec.similarity || 0.5,
      carbonSavings: rec.carbonSavings || 0,
      recommendationType: rec.type || 'alternative',
      confidence: rec.confidence || 0.5,
    }));

    await Recommendation.insertMany(newRecommendations);

    return NextResponse.json({
      message: 'Recommendations created successfully',
      count: newRecommendations.length,
    });
  } catch (error) {
    console.error('Recommendations POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create recommendations' },
      { status: 500 }
    );
  }
}