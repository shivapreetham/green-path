import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'MONGODB_URI = mongodb+srv://2005shadowme:S5quug2t2WfmiabD@shatterbox.qksgz.mongodb.net/green-path?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  carbonFootprint: { type: Number, required: true }, // in kg CO2e
  imageUrl: { type: String, required: true },
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);