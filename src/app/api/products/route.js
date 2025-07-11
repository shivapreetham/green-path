import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Product, Inventory, ProductAnalytics } from '@/models';
import { calculateCarbonFootprint } from '@/lib/coolerApi';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.aggregate([
      { $match: query },
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
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          inventory: 0 // Exclude inventory array from response
        }
      }
    ]);

    const total = await Product.countDocuments(query);
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      name, description, price, category, brand, image, tags, warehouseId, initialStock
    } = body;

    if (!name || !description || !price || !category || !brand || !image || !warehouseId || initialStock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let carbonFootprint;
    try {
      carbonFootprint = await calculateCarbonFootprint(body);
    } catch (error) {
      console.error('Carbon footprint calculation failed:', error);
      return NextResponse.json({ error: 'Failed to calculate carbon footprint' }, { status: 500 });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      brand,
      image,
      carbonFootprint,
      tags: tags || [],
    });
    await product.save();

    const inventory = new Inventory({
      productId: product._id,
      warehouseId,
      stock: parseInt(initialStock, 10) || 0
    });
    await inventory.save();

    const analytics = new ProductAnalytics({ productId: product._id });
    await analytics.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}