// app/api/recommendations/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Product, Recommendation, Cart } from '@/models';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const productId = searchParams.get('productId');
    
    if (sessionId) {
      // Get cart-based recommendations
      const recommendations = await getCartRecommendations(sessionId);
      return NextResponse.json(recommendations);
    }
    
    if (productId) {
      // Get product-based recommendations
      const recommendations = await getProductRecommendations(productId);
      return NextResponse.json(recommendations);
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

async function getCartRecommendations(sessionId) {
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
      
      // Find better alternatives for each cart item
      const alternatives = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        carbonScore: { $lt: product.carbonScore },
        isActive: true
      })
      .sort({ carbonScore: 1 })
      .limit(3)
      .lean();

      alternatives.forEach(alt => {
        const carbonSavings = Math.round(
          (product.carbonScore - alt.carbonScore) * item.quantity
        );
        
        const priceDifference = Math.round(
          (alt.price - product.price) * item.quantity
        );

        recommendations.push({
          originalProduct: product,
          recommendedProduct: alt,
          carbonSavings,
          priceDifference,
          quantity: item.quantity,
          similarity: calculateSimilarity(product, alt),
          recommendationType: 'cart_alternative'
        });
      });
    }

    // Sort by carbon savings (highest first)
    return recommendations.sort((a, b) => b.carbonSavings - a.carbonSavings);
  } catch (error) {
    console.error('Cart recommendations error:', error);
    return [];
  }
}

async function getProductRecommendations(productId) {
  try {
    const product = await Product.findById(productId).lean();
    
    if (!product) {
      return [];
    }

    // Check for ML-based recommendations first
    const mlRecommendations = await Recommendation.find({
      sourceProductId: productId
    })
    .populate('recommendedProductId')
    .sort({ carbonSavings: -1 })
    .limit(8)
    .lean();

    if (mlRecommendations.length > 0) {
      return mlRecommendations.map(rec => ({
        ...rec.recommendedProductId,
        carbonSavings: rec.carbonSavings,
        similarity: rec.similarity,
        recommendationType: rec.recommendationType
      }));
    }

    // Fallback to rule-based recommendations
    const alternatives = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      carbonScore: { $lt: product.carbonScore },
      isActive: true
    })
    .sort({ carbonScore: 1 })
    .limit(8)
    .lean();

    return alternatives.map(alt => ({
      ...alt,
      carbonSavings: Math.round(product.carbonScore - alt.carbonScore),
      priceDifference: Math.round(alt.price - product.price),
      similarity: calculateSimilarity(product, alt),
      recommendationType: 'alternative'
    }));
  } catch (error) {
    console.error('Product recommendations error:', error);
    return [];
  }
}

function calculateSimilarity(product1, product2) {
  let similarity = 0;
  
  // Same category
  if (product1.category === product2.category) {
    similarity += 0.4;
  }
  
  // Same brand
  if (product1.brand === product2.brand) {
    similarity += 0.2;
  }
  
  // Similar price range (within 20%)
  const priceDiff = Math.abs(product1.price - product2.price);
  const avgPrice = (product1.price + product2.price) / 2;
  if (priceDiff / avgPrice <= 0.2) {
    similarity += 0.3;
  }
  
  // Common tags
  const commonTags = product1.tags?.filter(tag => 
    product2.tags?.includes(tag)
  ) || [];
  similarity += Math.min(commonTags.length * 0.1, 0.1);
  
  return Math.round(similarity * 100) / 100;
}

// POST endpoint for creating ML recommendations
export async function POST(request) {
  try {
    await connectDB();
    
    const { sourceProductId, recommendations } = await request.json();
    
    if (!sourceProductId || !Array.isArray(recommendations)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Clear existing recommendations
    await Recommendation.deleteMany({ sourceProductId });

    // Create new recommendations
    const newRecommendations = recommendations.map(rec => ({
      sourceProductId,
      recommendedProductId: rec.productId,
      similarity: rec.similarity || 0.5,
      carbonSavings: rec.carbonSavings || 0,
      recommendationType: rec.type || 'alternative',
      confidence: rec.confidence || 0.5
    }));

    await Recommendation.insertMany(newRecommendations);

    return NextResponse.json({ 
      message: 'Recommendations created successfully',
      count: newRecommendations.length 
    });
  } catch (error) {
    console.error('Recommendations POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create recommendations' },
      { status: 500 }
    );
  }
}