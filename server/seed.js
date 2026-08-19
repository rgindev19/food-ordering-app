// server/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FoodItem } from './models/FoodItem.js';

dotenv.config();

const sampleFoods = [
  {
    name: 'Truffle Glazed Burger',
    category: 'Burgers',
    price: 14.50,
    calories: '680 kcal',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    name: 'Spicy Salmon Poke',
    category: 'Signature Bowls',
    price: 16.00,
    calories: '520 kcal',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    name: 'Handcrafted Rigatoni',
    category: 'Pasta',
    price: 13.50,
    calories: '590 kcal',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d62816f1?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d62816f1?w=600&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    name: 'Matcha Iced Latte',
    category: 'Drinks',
    price: 5.50,
    calories: '180 kcal',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
    isAvailable: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_delivery');
    await FoodItem.deleteMany();
    await FoodItem.insertMany(sampleFoods);
    console.log('[Seed] Database successfully cleared and seeded with fresh menu items!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDB();