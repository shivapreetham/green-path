// app/api/products/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    if (search) query.$text = { $search: search };

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.aggregate([
      { $match: query },
      { $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'productId',
          as: 'inventory'
      }},
      { $addFields: { totalStock: { $sum: '$inventory.stock' } } },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit },
      { $project: { inventory: 0 } }
    ]);

    const total = await Product.countDocuments(query);
    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Products GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      brand,
      image,
      baseCarbonFootprint,
      packagingType,
      tags,
      specifications,
      warehouseStocks
    } = body;

    if (
      !name || !description || price == null || !category || !brand || !image ||
      baseCarbonFootprint == null || !packagingType || !Array.isArray(warehouseStocks) || warehouseStocks.length === 0
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const priceNum = parseFloat(price);
    const carbonNum = parseFloat(baseCarbonFootprint);
    if (isNaN(priceNum) || priceNum < 0 || isNaN(carbonNum) || carbonNum < 0) {
      return NextResponse.json({ error: 'Invalid numeric values' }, { status: 400 });
    }

    let calculatedFootprint;
    try {
      calculatedFootprint = await calculateCarbonFootprint({
        name,
        description,
        price: priceNum,
        category,
        brand,
        image,
        baseCarbonFootprint: carbonNum,
        packagingType
      });
    } catch (err) {
      console.error('Carbon footprint calculation failed:', err);
      // If the error is unauthorized, you might choose a fallback footprint
      return NextResponse.json({ error: 'Failed to calculate carbon footprint' }, { status: 500 });
    }

    const product = await Product.create({
      name,
      description,
      price: priceNum,
      category,
      brand,
      image,
      baseCarbonFootprint: carbonNum,
      packagingType,
      carbonFootprint: calculatedFootprint,
      tags: Array.isArray(tags) ? tags : [],
      specifications: typeof specifications === 'object' ? specifications : {}
    });

    // Use `new` when creating ObjectId instances
    const inventoryDocs = warehouseStocks.map(ws => ({
      productId: product._id,
      warehouseId: new mongoose.Types.ObjectId(ws.warehouseId),
      stock: parseInt(ws.stock, 10) || 0
    }));
    await Inventory.insertMany(inventoryDocs);

    await ProductAnalytics.create({ productId: product._id });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Products POST Error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}