import mongoose from 'mongoose';

// Warehouse Schema
const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    address: String,
    lat: Number,
    lng: Number
  }
}, {
  timestamps: true
});

// Inventory Schema
const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});
inventorySchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Food & Beverages', 'Beauty', 'Automotive', 'Other']
  },
  brand: { type: String, required: true },
  image: { type: String, required: true },
  carbonFootprint: { type: Number, required: true, min: 0, max: 100, default: 50 },
  tags: [{ type: String, trim: true }],
  specifications: { type: Map, of: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ category: 1, carbonFootprint: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ carbonFootprint: 1 });

// Cart Schema
const cartSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceAtTime: { type: Number, required: true },
    carbonScoreAtTime: { type: Number, required: true }
  }],
  totalAmount: { type: Number, default: 0 },
  totalCarbonScore: { type: Number, default: 0 },
  estimatedCarbonSavings: { type: Number, default: 0 }
}, { timestamps: true });

cartSchema.methods.calculateTotals = function () {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
  this.totalCarbonScore = this.items.reduce((sum, item) => sum + (item.carbonScoreAtTime * item.quantity), 0);
  return this;
};

// Recommendation Schema
const recommendationSchema = new mongoose.Schema({
  sourceProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  recommendedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  similarity: { type: Number, required: true, min: 0, max: 1 },
  carbonSavings: { type: Number, required: true },
  recommendationType: {
    type: String,
    enum: ['similar', 'alternative', 'complement'],
    default: 'alternative'
  },
  confidence: { type: Number, min: 0, max: 1, default: 0.5 }
}, { timestamps: true });

recommendationSchema.index({ sourceProductId: 1, carbonSavings: -1 });
recommendationSchema.index({ recommendedProductId: 1 });

// Product Analytics Schema
const productAnalyticsSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  views: { type: Number, default: 0 },
  cartAdds: { type: Number, default: 0 },
  swapRequests: { type: Number, default: 0 },
  swapAccepted: { type: Number, default: 0 },
  averageRating: { type: Number, min: 0, max: 5, default: 0 },
  lastViewed: { type: Date, default: Date.now }
}, { timestamps: true });

// Order Schema
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  address: {
    fullAddress: String,
    lat: Number,
    lng: Number
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    priceAtTime: Number
  }],
  totalAmount: Number,

  timeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true
  },

  // ✅ New fields
  estimatedCO2gIfAlone: {
    type: Number,
    required: true
  },
  actualCO2gInCluster: {
    type: Number,
    required: true
  },
  co2Saved: {
    type: Number,
    required: true
  }
}, { timestamps: true });


// Cluster Schema (NEW)
const clusterSchema = new mongoose.Schema({
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  timeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  }],
  route: {
    type: [[Number]], // Array of [lat, lng] points
    required: true
  },
  totalDistanceKm: {
    type: Number,
    required: true
  },
  totalDurationSec: {
    type: Number,
    required: true
  },
  totalCO2g: {
    type: Number,
    required: true
  },
  sensitiveZoneCount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Models
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema);
const ProductAnalytics = mongoose.models.ProductAnalytics || mongoose.model('ProductAnalytics', productAnalyticsSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const Warehouse = mongoose.models.Warehouse || mongoose.model('Warehouse', warehouseSchema);
const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
const Cluster = mongoose.models.Cluster || mongoose.model('Cluster', clusterSchema);

// Export
export {
  Product,
  Cart,
  Recommendation,
  ProductAnalytics,
  Order,
  Warehouse,
  Inventory,
  Cluster // New
};