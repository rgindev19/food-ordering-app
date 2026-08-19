// server/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [{
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    name: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 }
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    street: String,
    city: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Delivered'],
    default: 'Confirmed'
  }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);