// admin/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, 
  Clock, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  RefreshCw, 
  PlusCircle, 
  UtensilsCrossed, 
  Image as ImageIcon,
  Check,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Film
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const STATUS_CONFIG = {
  Pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Clock },
  Preparing: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: ChefHat },
  'Out for Delivery': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: Bike },
  Delivered: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle2 }
};

const CATEGORIES = ['Signature Bowls', 'Burgers', 'Pasta', 'Drinks', 'Desserts'];

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'catalog' | 'promos'

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  // Food Catalog State
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add Product Form State
  const [formData, setFormData] = useState({ name: '', category: 'Burgers', price: '', calories: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', category: '', price: '', calories: '' });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');

  // Promo Banners State
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [bannerData, setBannerData] = useState({ title: '', subtitle: '' });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('image');

  const getImageUrl = (imageSrc) => {
    if (!imageSrc) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
    if (imageSrc.startsWith('http')) return imageSrc;
    if (imageSrc.startsWith('/uploads')) return `${API_BASE}${imageSrc}`;
    return imageSrc;
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await axios.get(`${API_BASE}/api/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchFoods = async () => {
    try {
      setLoadingFoods(true);
      const res = await axios.get(`${API_BASE}/api/foods`);
      setFoods(res.data);
    } catch (err) {
      console.error('Failed to load food items:', err);
    } finally {
      setLoadingFoods(false);
    }
  };

  const fetchBanners = async () => {
    try {
      setLoadingBanners(true);
      const res = await axios.get(`${API_BASE}/api/banners`);
      setBanners(res.data);
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchFoods();
    fetchBanners();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  // Media Handlers
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return alert('File size must be under 50MB');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return alert('File size must be under 50MB');
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return alert('File size must be under 50MB');
    setMediaFile(file);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  // Orders Status Updater
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.patch(`${API_BASE}/api/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrders((prev) => prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord)));
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  // Food CRUD Handlers
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !imageFile) return alert('Please fill all fields and select an image.');

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('calories', formData.calories);
      data.append('imageFile', imageFile);

      const res = await axios.post(`${API_BASE}/api/foods`, data);
      if (res.data.success) {
        setFoods((prev) => [res.data.food, ...prev]);
        setFormData({ name: '', category: 'Burgers', price: '', calories: '' });
        setImageFile(null);
        setImagePreview('');
        setSuccessMessage('Dish added successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      alert('Failed to add product: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (food) => {
    setEditingProduct(food);
    setEditFormData({ name: food.name, category: food.category, price: food.price, calories: food.calories || '' });
    setEditImagePreview(getImageUrl(food.image || food.imageUrl));
    setEditImageFile(null);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append('name', editFormData.name);
      data.append('category', editFormData.category);
      data.append('price', editFormData.price);
      data.append('calories', editFormData.calories);
      if (editImageFile) data.append('imageFile', editImageFile);

      const res = await axios.put(`${API_BASE}/api/foods/${editingProduct._id}`, data);
      if (res.data.success) {
        setFoods((prev) => prev.map((f) => (f._id === editingProduct._id ? res.data.food : f)));
        setEditingProduct(null);
        setSuccessMessage('Product updated successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      alert('Failed to update product: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}" permanently?`)) return;
    try {
      const res = await axios.delete(`${API_BASE}/api/foods/${id}`);
      if (res.data.success) setFoods((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert('Failed to delete product: ' + (err.response?.data?.error || err.message));
    }
  };

  // Promo Banner CRUD
  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!bannerData.title || !mediaFile) return alert('Please enter a title and select a video or poster.');

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append('title', bannerData.title);
      data.append('subtitle', bannerData.subtitle);
      data.append('mediaFile', mediaFile);

      const res = await axios.post(`${API_BASE}/api/banners`, data);
      if (res.data.success) {
        setBanners((prev) => [res.data.banner, ...prev]);
        setBannerData({ title: '', subtitle: '' });
        setMediaFile(null);
        setMediaPreview('');
        setSuccessMessage('Promotional ad uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      alert('Failed to upload ad banner: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Remove this promotional banner?')) return;
    try {
      const res = await axios.delete(`${API_BASE}/api/banners/${id}`);
      if (res.data.success) setBanners((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert('Failed to delete banner: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredOrders = orders.filter((o) => (activeFilter === 'All' ? true : o.status === activeFilter));
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 border border-orange-500/40 rounded-xl text-orange-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin Operations</h1>
              <p className="text-xs text-zinc-400">Kitchen & Promotion Terminal</p>
            </div>
          </div>

          <div className="flex bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'orders' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Live Orders
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'catalog' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Menu & Products
            </button>
            <button
              onClick={() => setActiveTab('promos')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'promos' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Promotions & Ads
            </button>
          </div>
        </div>

        {activeTab === 'orders' && (
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-medium rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* TAB 1: LIVE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-400 font-medium">Active Kitchen Orders</p>
                <p className="text-3xl font-bold mt-2 text-orange-400">{activeOrdersCount}</p>
              </div>
              <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-400 font-medium">Total Orders Placed</p>
                <p className="text-3xl font-bold mt-2 text-zinc-100">{orders.length}</p>
              </div>
              <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-400 font-medium">Gross Revenue</p>
                <p className="text-3xl font-bold mt-2 text-emerald-400">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-2 pb-2 overflow-x-auto">
              {['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    activeFilter === filter ? 'bg-zinc-100 text-zinc-950 shadow-md' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              {loadingOrders && orders.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">Loading incoming orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">No orders match this filter.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-xs font-semibold text-zinc-400 bg-zinc-900/50">
                        <th className="py-4 px-6">Order ID & Time</th>
                        <th className="py-4 px-6">Items Breakdown</th>
                        <th className="py-4 px-6">Total Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-sm">
                      {filteredOrders.map((order) => {
                        const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                        const StatusIcon = statusInfo.icon;
                        return (
                          <tr key={order._id} className="hover:bg-zinc-800/30 transition">
                            <td className="py-4 px-6">
                              <div className="font-mono text-xs text-orange-400">#{order._id.slice(-6).toUpperCase()}</div>
                              <div className="text-xs text-zinc-500 mt-1">
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="py-4 px-6 max-w-sm">
                              <div className="space-y-1">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="text-xs text-zinc-300">
                                    <span className="font-bold text-zinc-100">{item.quantity}x</span> {item.name}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-bold text-zinc-100">${order.total?.toFixed(2)}</td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MENU CATALOG CRUD */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-fit">
              <div className="flex items-center gap-2 mb-6">
                <PlusCircle className="w-5 h-5 text-orange-400" />
                <h2 className="text-base font-bold text-zinc-100">Add New Dish</h2>
              </div>
              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" /> {successMessage}
                </div>
              )}
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Double Cheeseburger"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="12.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Calories</label>
                    <input
                      type="text"
                      placeholder="e.g. 620 kcal"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Dish Photo *</label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 h-36 flex items-center justify-center">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute top-2 right-2 bg-zinc-950/80 hover:bg-red-600 text-zinc-200 text-xs px-2.5 py-1 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 hover:border-orange-500/60 rounded-xl p-5 cursor-pointer bg-zinc-800/40 hover:bg-zinc-800/70 transition">
                      <ImageIcon className="w-8 h-8 text-zinc-500 mb-2" />
                      <span className="text-xs font-medium text-zinc-300">Upload image from PC</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 bg-orange-500 hover:bg-orange-600 font-bold text-sm text-white rounded-xl transition active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading...' : 'Add Dish to Menu'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-100">Live Catalog Management ({foods.length})</h2>
                <button onClick={fetchFoods} className="text-xs text-zinc-400 hover:text-orange-400 transition">Refresh</button>
              </div>
              {loadingFoods ? (
                <div className="text-center py-20 text-zinc-500">Loading catalog...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {foods.map((food) => (
                    <div key={food._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4 items-center group justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={getImageUrl(food.image || food.imageUrl)} 
                          alt={food.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-16 h-16 rounded-lg object-cover bg-zinc-800 shrink-0" 
                        />
                        <div className="min-w-0 truncate">
                          <h4 className="font-semibold text-sm text-zinc-100 truncate">{food.name}</h4>
                          <p className="text-xs text-zinc-400">{food.category} • {food.calories}</p>
                          <p className="text-sm font-bold text-orange-400 mt-1">${food.price?.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => openEditModal(food)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(food._id, food.name)} className="p-2 bg-zinc-800 hover:bg-red-600/80 text-zinc-400 hover:text-white rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PROMOTIONS & VIDEO ADS MANAGEMENT */}
        {activeTab === 'promos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Ad Form */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-fit">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <h2 className="text-base font-bold text-zinc-100">Upload Promo Banner / Video Ad</h2>
              </div>
              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" /> {successMessage}
                </div>
              )}
              <form onSubmit={handleAddBanner} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Promotion Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50% OFF Weekend Specials"
                    value={bannerData.title}
                    onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Subtitle / Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Use Code FEAST50 on checkout"
                    value={bannerData.subtitle}
                    onChange={(e) => setBannerData({ ...bannerData, subtitle: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Poster Image or MP4 Video *</label>
                  {mediaPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 h-40 flex items-center justify-center">
                      {mediaType === 'video' ? (
                        <video src={mediaPreview} className="w-full h-full object-cover" autoPlay muted loop />
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => { setMediaFile(null); setMediaPreview(''); }}
                        className="absolute top-2 right-2 bg-zinc-950/80 hover:bg-red-600 text-zinc-200 text-xs px-2.5 py-1 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 hover:border-orange-500/60 rounded-xl p-5 cursor-pointer bg-zinc-800/40 hover:bg-zinc-800/70 transition">
                      <Film className="w-8 h-8 text-zinc-500 mb-2" />
                      <span className="text-xs font-medium text-zinc-300">Choose Image or Short MP4 from PC</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">PNG, JPG, WEBP, MP4 (Max 50MB)</span>
                      <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 bg-orange-500 hover:bg-orange-600 font-bold text-sm text-white rounded-xl transition active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading Banner...' : 'Publish to Storefront Slider'}
                </button>
              </form>
            </div>

            {/* Live Slider Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-100">Live Active Banner Slides ({banners.length})</h2>
                <button onClick={fetchBanners} className="text-xs text-zinc-400 hover:text-orange-400 transition">Refresh</button>
              </div>
              {loadingBanners ? (
                <div className="text-center py-20 text-zinc-500">Loading promotional slides...</div>
              ) : banners.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">No promo slides active yet. Upload your first poster above!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {banners.map((b) => (
                    <div key={b._id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden relative group">
                      <div className="h-36 w-full bg-zinc-800 relative">
                        {b.mediaType === 'video' ? (
                          <video src={b.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                        ) : (
                          <img src={b.mediaUrl} alt={b.title} className="w-full h-full object-cover" />
                        )}
                        <span className="absolute top-2 left-2 bg-zinc-950/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-orange-400">
                          {b.mediaType}
                        </span>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                          <h4 className="font-bold text-sm text-zinc-100 truncate">{b.title}</h4>
                          {b.subtitle && <p className="text-xs text-zinc-400 truncate">{b.subtitle}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteBanner(b._id)}
                          className="p-2 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-lg transition shrink-0"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-100">Modify Dish Details</h3>
              <button onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Calories</label>
                <input
                  type="text"
                  value={editFormData.calories}
                  onChange={(e) => setEditFormData({ ...editFormData, calories: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Replace Image (Optional)</label>
                <div className="flex items-center gap-3">
                  <img src={editImagePreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover bg-zinc-800 border border-zinc-700" />
                  <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold rounded-xl cursor-pointer text-zinc-200">
                    Change Image
                    <input type="file" accept="image/*" onChange={handleEditImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-orange-500/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}