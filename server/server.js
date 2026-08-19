// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { FoodItem } from './models/FoodItem.js';
import { Order } from './models/Order.js';
import { Banner } from './models/Banner.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. CORS Configuration
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Serve uploaded local images statically so Client & Admin can access them
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// --- Food Item Endpoints ---

// GET /api/foods - Retrieve all items
app.get('/api/foods', async (req, res) => {
  try {
    const items = await FoodItem.find({ isAvailable: true }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve food items', details: err.message });
  }
});

// POST /api/foods - Add new item with a local uploaded image file
app.post('/api/foods', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, category, price, calories } = req.body;

    let imageUrl = '';
    if (req.file) {
      // Create full accessible URL pointing to backend static file
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    if (!name || !category || !price || !imageUrl) {
      return res.status(400).json({ error: 'Name, category, price, and image are required.' });
    }

    const newFood = await FoodItem.create({
      name,
      category,
      price: Number(price),
      calories: calories || '450 kcal',
      image: imageUrl,
      imageUrl: imageUrl,
      isAvailable: true
    });

    res.status(201).json({ success: true, food: newFood });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create food item', details: err.message });
  }
});

// --- Order Endpoints ---
app.post('/api/orders', async (req, res) => {
  try {
    const { items, subtotal, deliveryFee, total } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    const order = await Order.create({ items, subtotal, deliveryFee, total, status: 'Pending' });
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`[Server] Live on http://localhost:${PORT}`));
});

// PUT /api/foods/:id - Update product details (with optional new image file)
app.put('/api/foods/:id', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, category, price, calories } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (price) updateData.price = Number(price);
    if (calories) updateData.calories = calories;

    if (req.file) {
      updateData.image = `http://localhost:5000/uploads/${req.file.filename}`;
      updateData.imageUrl = updateData.image;
    }

    const updatedFood = await FoodItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedFood) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ success: true, food: updatedFood });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// DELETE /api/foods/:id - Delete a product permanently
app.delete('/api/foods/:id', async (req, res) => {
  try {
    const deletedFood = await FoodItem.findByIdAndDelete(req.params.id);
    if (!deletedFood) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

// --- BANNER & PROMO ENDPOINTS ---

// GET /api/banners - Fetch all active promotional slides for the client slider
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners', details: err.message });
  }
});

// POST /api/banners - Admin uploads an image poster or video ad
app.post('/api/banners', upload.single('mediaFile'), async (req, res) => {
  try {
    const { title, subtitle, link } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please select a poster image or short video file.' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const mediaType = isVideo ? 'video' : 'image';
    const mediaUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const newBanner = await Banner.create({
      title,
      subtitle,
      link,
      mediaType,
      mediaUrl,
      isActive: true
    });

    res.status(201).json({ success: true, banner: newBanner });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create banner', details: err.message });
  }
});

// DELETE /api/banners/:id - Admin deletes a promotional banner
app.delete('/api/banners/:id', async (req, res) => {
  try {
    const deletedBanner = await Banner.findByIdAndDelete(req.params.id);
    if (!deletedBanner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.status(200).json({ success: true, message: 'Banner removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete banner', details: err.message });
  }
});