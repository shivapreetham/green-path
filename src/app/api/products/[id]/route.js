// app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Product, Recommendation, ProductAnalytics } from '@/models';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Get product details
    const product = await Product.findById(id).lean();
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update view count
    await ProductAnalytics.findOneAndUpdate(
      { productId: id },
      { 
        $inc: { views: 1 },
        lastViewed: new Date()
      },
      { upsert: true }
    );

    // Get recommendations (better alternatives with lower carbon score)
    const recommendations = await getRecommendations(id, product.category, product.carbonScore);

    return NextResponse.json({
      product,
      recommendations
    });
  } catch (error) {
    console.error('Product detail API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

async function getRecommendations(productId, category, carbonScore) {
  try {
    // First, check if we have ML-based recommendations
    const mlRecommendations = await Recommendation.find({
      sourceProductId: productId,
      recommendationType: 'alternative'
    })
    .populate('recommendedProductId')
    .sort({ carbonSavings: -1 })
    .limit(6)
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
    const similarProducts = await Product.find({
      _id: { $ne: productId },
      category: category,
      carbonScore: { $lt: carbonScore }, // Better carbon score
      isActive: true
    })
    .sort({ carbonScore: 1 }) // Best carbon score first
    .limit(6)
    .lean();

    return similarProducts.map(product => ({
      ...product,
      carbonSavings: Math.round(carbonScore - product.carbonScore),
      similarity: 0.8, // Default similarity
      recommendationType: 'alternative'
    }));
  } catch (error) {
    console.error('Recommendations error:', error);
    return [];
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const updates = await request.json();
    
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}