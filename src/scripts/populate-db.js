// scripts/populate-db.js
import mongoose from 'mongoose';
import { Product, Recommendation } from '../models/index.js';

// Sample products data
const sampleProducts = [
  {
    name: "Eco-Friendly Bamboo Toothbrush",
    description: "Sustainable bamboo toothbrush with soft bristles. Biodegradable and plastic-free.",
    price: 12.99,
    category: "Beauty",
    brand: "GreenBrush",
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400",
    stock: 150,
    carbonScore: 15,
    tags: ["bamboo", "sustainable", "biodegradable"],
    specifications: {
      material: "Bamboo",
      bristleType: "Soft",
      biodegradable: "Yes"
    }
  },
  {
    name: "Regular Plastic Toothbrush",
    description: "Standard plastic toothbrush with medium bristles.",
    price: 8.99,
    category: "Beauty",
    brand: "PlasticBrush",
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400",
    stock: 200,
    carbonScore: 75,
    tags: ["plastic", "standard"],
    specifications: {
      material: "Plastic",
      bristleType: "Medium",
      biodegradable: "No"
    }
  },
  {
    name: "Solar Power Bank 20000mAh",
    description: "Portable solar charger with 20000mAh capacity. Perfect for outdoor adventures.",
    price: 89.99,
    category: "Electronics",
    brand: "SolarTech",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
    stock: 75,
    carbonScore: 25,
    tags: ["solar", "renewable", "portable"],
    specifications: {
      capacity: "20000mAh",
      solarPanel: "Yes",
      waterproof: "IP65"
    }
  },
  {
    name: "Standard Power Bank 20000mAh",
    description: "Regular power bank with 20000mAh capacity.",
    price: 59.99,
    category: "Electronics",
    brand: "PowerTech",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
    stock: 120,
    carbonScore: 65,
    tags: ["standard", "portable"],
    specifications: {
      capacity: "20000mAh",
      solarPanel: "No",
      waterproof: "No"
    }
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "100% organic cotton t-shirt. Soft, comfortable, and sustainably made.",
    price: 34.99,
    category: "Clothing",
    brand: "EcoWear",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    stock: 200,
    carbonScore: 20,
    tags: ["organic", "cotton", "sustainable"],
    specifications: {
      material: "100% Organic Cotton",
      fit: "Regular",
      care: "Machine Washable"
    }
  },
  {
    name: "Regular Cotton T-Shirt",
    description: "Standard cotton t-shirt. Comfortable everyday wear.",
    price: 19.99,
    category: "Clothing",
    brand: "BasicWear",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    stock: 300,
    carbonScore: 60,
    tags: ["cotton", "basic"],
    specifications: {
      material: "Cotton Blend",
      fit: "Regular",
      care: "Machine Washable"
    }
  },
  {
    name: "Biodegradable Phone Case",
    description: "Eco-friendly phone case made from plant-based materials. Fully biodegradable.",
    price: 24.99,
    category: "Electronics",
    brand: "GreenCase",
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
    stock: 100,
    carbonScore: 18,
    tags: ["biodegradable", "plant-based", "eco-friendly"],
    specifications: {
      material: "Plant-based Polymer",
      compatibility: "iPhone/Android",
      biodegradable: "Yes"
    }
  },
  {
    name: "Plastic Phone Case",
    description: "Durable plastic phone case with good protection.",
    price: 15.99,
    category: "Electronics",
    brand: "PlasticCase",
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
    stock: 250,
    carbonScore: 70,
    tags: ["plastic", "durable"],
    specifications: {
      material: "ABS Plastic",
      compatibility: "iPhone/Android",
      biodegradable: "No"
    }
  },
  {
    name: "Reusable Stainless Steel Water Bottle",
    description: "Insulated stainless steel water bottle. Keeps drinks cold for 24h, hot for 12h.",
    price: 39.99,
    category: "Home & Garden",
    brand: "HydroSteel",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
    stock: 180,
    carbonScore: 22,
    tags: ["reusable", "stainless steel", "insulated"],
    specifications: {
      material: "Stainless Steel",
      capacity: "750ml",
      insulation: "Double Wall"
    }
  },
  {
    name: "Disposable Plastic Water Bottles (24 Pack)",
    description: "Pack of 24 disposable plastic water bottles.",
    price: 12.99,
    category: "Food & Beverages",
    brand: "AquaPlastic",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
    stock: 500,
    carbonScore: 85,
    tags: ["disposable", "plastic", "convenience"],
    specifications: {
      material: "PET Plastic",
      capacity: "500ml each",
      quantity: "24 bottles"
    }
  },
  {
    name: "LED Smart Bulb - Energy Efficient",
    description: "Smart LED bulb with WiFi control. 80% more energy efficient than traditional bulbs.",
    price: 29.99,
    category: "Electronics",
    brand: "SmartLight",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    stock: 150,
    carbonScore: 12,
    tags: ["LED", "energy efficient", "smart"],
    specifications: {
      wattage: "9W",
      brightness: "800 lumens",
      lifespan: "25,000 hours"
    }
  },
  {
    name: "Incandescent Light Bulb",
    description: "Traditional incandescent light bulb. Warm light output.",
    price: 3.99,
    category: "Electronics",
    brand: "OldLight",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    stock: 400,
    carbonScore: 90,
    tags: ["incandescent", "traditional"],
    specifications: {
      wattage: "60W",
      brightness: "800 lumens",
      lifespan: "1,000 hours"
    }
  }
];

// Function to create recommendations
const createRecommendations = async () => {
  const recommendations = [
    // Bamboo toothbrush as alternative to plastic toothbrush
    {
      sourceProductId: null, // Will be set after products are created
      recommendedProductId: null,
      similarity: 0.9,
      carbonSavings: 60,
      recommendationType: 'alternative',
      confidence: 0.95
    },
    // Solar power bank as alternative to regular power bank
    {
      sourceProductId: null,
      recommendedProductId: null,
      similarity: 0.95,
      carbonSavings: 40,
      recommendationType: 'alternative',
      confidence: 0.9
    },
    // Organic cotton t-shirt as alternative to regular cotton
    {
      sourceProductId: null,
      recommendedProductId: null,
      similarity: 0.85,
      carbonSavings: 40,
      recommendationType: 'alternative',
      confidence: 0.85
    },
    // Biodegradable phone case as alternative to plastic
    {
      sourceProductId: null,
      recommendedProductId: null,
      similarity: 0.9,
      carbonSavings: 52,
      recommendationType: 'alternative',
      confidence: 0.9
    },
    // Reusable water bottle as alternative to disposable
    {
      sourceProductId: null,
      recommendedProductId: null,
      similarity: 0.7,
      carbonSavings: 63,
      recommendationType: 'alternative',
      confidence: 0.95
    },
    // LED bulb as alternative to incandescent
    {
      sourceProductId: null,
      recommendedProductId: null,
      similarity: 0.95,
      carbonSavings: 78,
      recommendationType: 'alternative',
      confidence: 0.98
    }
  ];

  return recommendations;
};

// Main function to populate the database
async function populateDatabase() {
  try {
    console.log('🌱 Starting database population...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenpath');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Recommendation.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Insert products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`📦 Inserted ${insertedProducts.length} products`);

    // Create recommendations with actual product IDs
    const recommendations = await createRecommendations();
    
    // Map products for easy lookup
    const productMap = {};
    insertedProducts.forEach(product => {
      productMap[product.name] = product._id;
    });

    // Set up recommendation relationships
    const recommendationPairs = [
      ['Regular Plastic Toothbrush', 'Eco-Friendly Bamboo Toothbrush'],
      ['Standard Power Bank 20000mAh', 'Solar Power Bank 20000mAh'],
      ['Regular Cotton T-Shirt', 'Organic Cotton T-Shirt'],
      ['Plastic Phone Case', 'Biodegradable Phone Case'],
      ['Disposable Plastic Water Bottles (24 Pack)', 'Reusable Stainless Steel Water Bottle'],
      ['Incandescent Light Bulb', 'LED Smart Bulb - Energy Efficient']
    ];

    const finalRecommendations = [];
    recommendationPairs.forEach(([sourceName, recommendedName], index) => {
      if (productMap[sourceName] && productMap[recommendedName]) {
        finalRecommendations.push({
          ...recommendations[index],
          sourceProductId: productMap[sourceName],
          recommendedProductId: productMap[recommendedName]
        });
      }
    });

    // Insert recommendations
    if (finalRecommendations.length > 0) {
      await Recommendation.insertMany(finalRecommendations);
      console.log(`🎯 Created ${finalRecommendations.length} recommendations`);
    }

    console.log('🎉 Database population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Products: ${insertedProducts.length}`);
    console.log(`   Recommendations: ${finalRecommendations.length}`);
    console.log('\n🌍 Your GreenPath database is ready to help users make sustainable choices!');

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
populateDatabase();

export default populateDatabase;