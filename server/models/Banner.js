// server/models/Banner.js
import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    mediaUrl: { type: String, required: true },
    link: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Banner = mongoose.model('Banner', bannerSchema);