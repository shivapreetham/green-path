import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/db'
import { Product, Inventory } from '@/models'

/**
 * Utility: Recommend 2 random products from the same category (excluding self)
 */
async function getRecommendations(currentProductId, category) {
  return await Product.aggregate([
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(currentProductId) },
        category,
        isActive: true
      }
    },
    { $sample: { size: 2 } }, 
    {
      $lookup: {
        from: 'inventories',
        localField: '_id',
        foreignField: 'productId',
        as: 'inventoryDocs'
      }
    },
    {
      $addFields: {
        totalStock: { $sum: '$inventoryDocs.stock' }
      }
    },
    {
      $project: {
        inventoryDocs: 0,
        __v: 0
      }
    }
  ])
}

/**
 * GET /api/products/[id]
 */
export async function GET(request, { params }) {
  try {
    await connectDB()
    const productId = await params.id

    const [product] = await Product.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(productId),
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'productId',
          as: 'inventoryDocs'
        }
      },
      {
        $addFields: {
          totalStock: { $sum: '$inventoryDocs.stock' }
        }
      },
      {
        $project: {
          inventoryDocs: 0,
          __v: 0
        }
      }
    ])

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      )
    }

    const recommendations = await getRecommendations(productId, product.category)

    return NextResponse.json({ product, recommendations })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/products/[id]
 */
export async function PUT(request, { params }) {
  try {
    await connectDB()
    const { id } = await params
    const updates = await request.json()

    delete updates.stock // Inventory is managed separately

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id]
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const { id } = await params

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    await Inventory.updateMany(
      { productId: id },
      { stock: 0 }
    )

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
