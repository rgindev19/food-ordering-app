// server/models/FoodItem.js
import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    calories: { type: String, default: '450 kcal' },
    image: { type: String, required: true },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const FoodItem = mongoose.model('FoodItem', foodItemSchema);