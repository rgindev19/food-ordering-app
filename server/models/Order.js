// server/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [{
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    name: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 }
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  total: { type: Number, required: true },
  totalAmount: { type: Number },
  customerName: { type: String, default: 'Guest Foodie' },
  phone: { type: String, default: '' },
  deliveryAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    apt: { type: String, default: '' },
    zip: { type: String, default: '' }
  },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  notes: { type: String, default: '' },
  promoCode: { type: String, default: '' },
  discount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);