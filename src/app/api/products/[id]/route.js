import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Product, Recommendation, ProductAnalytics } from '@/models';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const product = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), isActive: true } },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'productId',
          as: 'inventory'
        }
      },
      {
        $addFields: {
          totalStock: { $sum: '$inventory.stock' }
        }
      },
      {
        $project: {
          inventory: 0
        }
      }
    ]);

    if (!product || product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await ProductAnalytics.findOneAndUpdate(
      { productId: id },
      { 
        $inc: { views: 1 },
        lastViewed: new Date()
      },
      { upsert: true }
    );

    const recommendations = await getRecommendations(id, product[0].category, product[0].carbonFootprint);

    return NextResponse.json({
      product: product[0],
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

async function getRecommendations(productId, category, carbonFootprint) {
  try {
    const mlRecommendations = await Recommendation.find({
      sourceProductId: productId,
      recommendationType: 'alternative'
    })
      .populate({
        path: 'recommendedProductId',
        select: 'name brand price image carbonFootprint'
      })
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

    const similarProducts = await Product.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(productId) },
          category,
          carbonFootprint: { $lt: carbonFootprint },
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'productId',
          as: 'inventory'
        }
      },
      {
        $addFields: {
          totalStock: { $sum: '$inventory.stock' }
        }
      },
      {
        $project: {
          inventory: 0,
          name: 1,
          brand: 1,
          price: 1,
          image: 1,
          carbonFootprint: 1,
          carbonSavings: { $subtract: [carbonFootprint, '$carbonFootprint'] },
          similarity: 0.8,
          recommendationType: 'alternative'
        }
      },
      { $sort: { carbonFootprint: 1 } },
      { $limit: 6 }
    ]);

    return similarProducts;
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

    // Remove stock from updates since it's managed in Inventory
    delete updates.stock;

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

    // Optionally, update inventory to set stock to 0
    await Inventory.updateMany(
      { productId: id },
      { stock: 0 }
    );

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}