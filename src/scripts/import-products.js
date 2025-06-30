import { parse } from 'csv-parse';
import fs from 'fs';
import mongoose from 'mongoose';
import { Product } from '../lib/db';

async function importProducts() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');

  const parser = fs.createReadStream('products.csv').pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );

  for await (const record of parser) {
    const product = {
      name: record.name,
      description: record.description,
      price: parseFloat(record.price),
      category: record.category,
      carbonFootprint: parseFloat(record.carbonFootprint),
      imageUrl: record.imageUrl,
    };
    await Product.findOneAndUpdate({ name: product.name }, product, { upsert: true });
  }

  console.log('Products imported successfully!');
  await mongoose.connection.close();
}

importProducts().catch(console.error);