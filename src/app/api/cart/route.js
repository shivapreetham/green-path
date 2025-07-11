// app/api/cart/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Cart, Product, ProductAnalytics } from '@/models';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ sessionId })
      .populate('items.productId')
      .lean();

    if (!cart) {
      return NextResponse.json({
        items: [],
        totalAmount: 0,
        totalCarbonScore: 0,
        estimatedCarbonSavings: 0
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const { sessionId, productId, quantity = 1 } = await request.json();
    
    if (!sessionId || !productId) {
      return NextResponse.json(
        { error: 'Session ID and Product ID required' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      cart = new Cart({
        sessionId,
        items: []
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: productId,
        quantity: quantity,
        priceAtTime: product.price,
        carbonScoreAtTime: product.carbonFootprint
      });
    }

    // Calculate totals
    cart.calculateTotals();
    
    await cart.save();

    // Update analytics
    await ProductAnalytics.findOneAndUpdate(
      { productId: productId },
      { $inc: { cartAdds: 1 } },
      { upsert: true }
    );

    // Populate and return
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId')
      .lean();

    return NextResponse.json(populatedCart);
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const { sessionId, productId, quantity } = await request.json();
    
    if (!sessionId || !productId || quantity < 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.calculateTotals();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId')
      .lean();

    return NextResponse.json(populatedCart);
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const productId = searchParams.get('productId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    if (productId) {
      // Remove specific item
      cart.items = cart.items.filter(
        item => item.productId.toString() !== productId
      );
    } else {
      // Clear entire cart
      cart.items = [];
    }

    cart.calculateTotals();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId')
      .lean();

    return NextResponse.json(populatedCart);
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}