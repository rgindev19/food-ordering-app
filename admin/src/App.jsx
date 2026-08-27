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
  Film,
  DollarSign,
  Flame,
  AlertCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const STATUS_CONFIG = {
  Pending: { bg: 'bg-[#FFE600]', text: 'text-black', border: 'border-black', icon: Clock },
  Preparing: { bg: 'bg-[#38BDF8]', text: 'text-black', border: 'border-black', icon: ChefHat },
  'Out for Delivery': { bg: 'bg-[#C084FC]', text: 'text-black', border: 'border-black', icon: Bike },
  Delivered: { bg: 'bg-[#22C55E]', text: 'text-black', border: 'border-black', icon: CheckCircle2 }
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
    <div className="min-h-screen bg-[#FAF6EF] text-[#121212] font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* NEOBRUTALIST TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#FAF6EF]/95 backdrop-blur border-b-[3.5px] border-black px-6 sm:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_0_#000]">
        
        {/* Brand & Terminal Identifier */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FFE600] border-2 border-black rounded-xl shadow-[3px_3px_0_#000] rotate-[-2deg]">
              <Package className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-black neo-font-display flex items-center gap-1.5">
                SAVOR<span className="bg-[#FF5722] text-white px-2 py-0.5 rounded-lg border-2 border-black text-sm rotate-[1deg]">ADMIN</span>
              </h1>
              <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                Kitchen & Operations Terminal
              </p>
            </div>
          </div>

          {activeTab === 'orders' && (
            <button
              onClick={fetchOrders}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-[#FFE600] text-black font-black text-xs uppercase rounded-xl border-2 border-black neo-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        {/* Tab Switcher Controls */}
        <div className="flex bg-white p-1.5 rounded-xl border-[2.5px] border-black shadow-[3px_3px_0_#000] overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase rounded-lg transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000]'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100 border-2 border-transparent'
            }`}
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Live Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase rounded-lg transition cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000]'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100 border-2 border-transparent'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
            <span>Menu Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase rounded-lg transition cursor-pointer ${
              activeTab === 'promos'
                ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000]'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100 border-2 border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Promotions & Ads</span>
          </button>
        </div>

        {/* Desktop Refresh Button */}
        {activeTab === 'orders' && (
          <button
            onClick={fetchOrders}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-[#FFE600] hover:bg-[#FFD500] text-black font-black text-xs uppercase rounded-xl border-[2.5px] border-black neo-btn"
          >
            <RefreshCw className={`w-4 h-4 stroke-[2.5] ${loadingOrders ? 'animate-spin' : ''}`} />
            Sync Orders
          </button>
        )}
      </header>

      {/* MAIN ADMIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* TAB 1: LIVE ORDERS DASHBOARD */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* KPI STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Active Kitchen Orders */}
              <div className="p-6 bg-[#FFE600] border-[3px] border-black rounded-2xl neo-card">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-black">Active Kitchen Orders</p>
                  <span className="p-1.5 bg-black text-[#FFE600] rounded-lg">
                    <ChefHat className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-4xl font-black mt-3 text-black neo-font-display">{activeOrdersCount}</p>
                <p className="text-[11px] font-bold text-zinc-800 mt-1">Pending & in preparation</p>
              </div>

              {/* Total Orders Placed */}
              <div className="p-6 bg-[#C084FC] border-[3px] border-black rounded-2xl neo-card">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-black">Total Orders Placed</p>
                  <span className="p-1.5 bg-black text-[#C084FC] rounded-lg">
                    <Package className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-4xl font-black mt-3 text-black neo-font-display">{orders.length}</p>
                <p className="text-[11px] font-bold text-zinc-800 mt-1">Lifetime customer orders</p>
              </div>

              {/* Gross Revenue */}
              <div className="p-6 bg-[#22C55E] border-[3px] border-black rounded-2xl neo-card">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-black">Gross Revenue</p>
                  <span className="p-1.5 bg-black text-[#22C55E] rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-4xl font-black mt-3 text-black neo-font-display">${totalRevenue.toFixed(2)}</p>
                <p className="text-[11px] font-bold text-zinc-800 mt-1">Total processed volume</p>
              </div>
            </div>

            {/* STATUS FILTER PILLS */}
            <div className="flex items-center gap-2.5 pb-2 overflow-x-auto pt-2">
              <span className="text-xs font-black uppercase text-zinc-500 mr-1 hidden sm:inline">Filter:</span>
              {['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide border-[2.5px] border-black transition whitespace-nowrap cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-black text-white shadow-[3px_3px_0_#FFE600] -translate-y-0.5'
                      : 'bg-white hover:bg-zinc-100 text-black hover:shadow-[2px_2px_0_#000]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* ORDERS TABLE */}
            <div className="bg-white border-[3.5px] border-black rounded-2xl overflow-hidden neo-shadow-md">
              {loadingOrders && orders.length === 0 ? (
                <div className="text-center py-20 font-black text-sm">Loading live orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 text-zinc-600 font-bold text-sm">
                  No orders match this status filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-[3px] border-black text-xs font-black uppercase tracking-wider text-black bg-[#FFE600]">
                        <th className="py-4 px-6">Order ID & Time</th>
                        <th className="py-4 px-6">Items Breakdown</th>
                        <th className="py-4 px-6">Total Amount</th>
                        <th className="py-4 px-6">Current Status</th>
                        <th className="py-4 px-6 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-zinc-200 text-sm">
                      {filteredOrders.map((order) => {
                        const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                        const StatusIcon = statusInfo.icon;
                        return (
                          <tr key={order._id} className="hover:bg-[#FAF6EF] transition">
                            
                            {/* ID and Time */}
                            <td className="py-4 px-6">
                              <div className="font-mono text-xs font-black bg-[#FAF6EF] border-2 border-black px-2 py-0.5 rounded-md inline-block shadow-[1px_1px_0_#000]">
                                #{order._id.slice(-6).toUpperCase()}
                              </div>
                              <div className="text-xs font-bold text-zinc-600 mt-1.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>

                            {/* Items Breakdown */}
                            <td className="py-4 px-6 max-w-sm">
                              <div className="space-y-1">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                                    <span className="bg-[#FFE600] border border-black text-black px-1.5 py-0.2 rounded font-black text-[11px]">
                                      {item.quantity}x
                                    </span>
                                    <span>{item.name}</span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* Total Amount */}
                            <td className="py-4 px-6">
                              <span className="font-black text-base text-black bg-[#22C55E]/20 border border-black px-2 py-1 rounded-lg">
                                ${order.total?.toFixed(2)}
                              </span>
                            </td>

                            {/* Status Badge */}
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase border-2 border-black ${statusInfo.bg} ${statusInfo.text} shadow-[2px_2px_0_#000]`}>
                                <StatusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                                {order.status}
                              </span>
                            </td>

                            {/* Quick Action Selector */}
                            <td className="py-4 px-6 text-right">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="bg-white border-2 border-black text-xs font-black text-black rounded-xl px-3 py-2 neo-shadow-xs focus:outline-none cursor-pointer"
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
            
            {/* Add Product Form Card */}
            <div className="bg-white border-[3.5px] border-black p-6 rounded-2xl neo-shadow-md h-fit">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b-2 border-black">
                <PlusCircle className="w-5 h-5 text-black stroke-[2.5]" />
                <h2 className="text-base font-black uppercase text-black neo-font-display">Add New Dish</h2>
              </div>

              {successMessage && (
                <div className="mb-4 p-3 bg-[#22C55E] border-2 border-black rounded-xl text-black font-black text-xs flex items-center gap-2 shadow-[2px_2px_0_#000]">
                  <Check className="w-4 h-4 shrink-0 stroke-[3]" /> {successMessage}
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Double Truffle Burger"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2.5 text-black neo-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white text-sm font-bold rounded-xl px-3.5 py-2.5 text-black neo-input cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1.5">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="12.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2.5 text-black neo-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1.5">Calories</label>
                    <input
                      type="text"
                      placeholder="620 kcal"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2.5 text-black neo-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5">Dish Photo *</label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border-[2.5px] border-black bg-zinc-100 h-40 flex items-center justify-center neo-shadow-xs">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute top-2 right-2 bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-lg border-2 border-black neo-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-black hover:bg-[#FFE600]/20 rounded-xl p-5 cursor-pointer bg-[#FAF6EF] transition">
                      <ImageIcon className="w-8 h-8 text-black mb-2" />
                      <span className="text-xs font-black text-black uppercase">Choose image from PC</span>
                      <span className="text-[10px] font-bold text-zinc-500 mt-0.5">PNG, JPG, WEBP (Max 50MB)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 bg-[#FF5722] hover:bg-[#E64A19] font-black text-sm uppercase text-white rounded-xl neo-btn disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading Dish...' : 'Add Dish to Menu'}
                </button>
              </form>
            </div>

            {/* Live Catalog List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-base font-black uppercase text-black neo-font-display">
                  Live Food Catalog ({foods.length})
                </h2>
                <button 
                  onClick={fetchFoods} 
                  className="text-xs font-black uppercase text-black bg-[#FFE600] px-3 py-1 rounded-lg border-2 border-black neo-shadow-xs"
                >
                  Refresh
                </button>
              </div>

              {loadingFoods ? (
                <div className="text-center py-20 font-black text-sm">Loading catalog...</div>
              ) : foods.length === 0 ? (
                <div className="text-center py-20 text-zinc-600 font-bold">No dishes in the catalog yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {foods.map((food) => (
                    <div 
                      key={food._id} 
                      className="bg-white border-[3px] border-black rounded-2xl p-4 flex gap-4 items-center justify-between neo-card"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={getImageUrl(food.image || food.imageUrl)} 
                          alt={food.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-16 h-16 rounded-xl object-cover bg-zinc-100 border-2 border-black shrink-0" 
                        />
                        <div className="min-w-0 truncate">
                          <h4 className="font-black text-sm text-black truncate">{food.name}</h4>
                          <p className="text-xs font-bold text-zinc-600">{food.category} • {food.calories}</p>
                          <span className="text-xs font-black text-black bg-[#FFE600] px-2 py-0.5 border border-black rounded inline-block mt-1">
                            ${food.price?.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => openEditModal(food)} 
                          className="p-2 bg-[#FFE600] hover:bg-[#FFD500] text-black border-2 border-black rounded-xl neo-btn"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(food._id, food.name)} 
                          className="p-2 bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-xl neo-btn"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.5]" />
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
            <div className="bg-white border-[3.5px] border-black p-6 rounded-2xl neo-shadow-md h-fit">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b-2 border-black">
                <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
                <h2 className="text-base font-black uppercase text-black neo-font-display">Upload Promo Billboard</h2>
              </div>

              {successMessage && (
                <div className="mb-4 p-3 bg-[#22C55E] border-2 border-black rounded-xl text-black font-black text-xs flex items-center gap-2 shadow-[2px_2px_0_#000]">
                  <Check className="w-4 h-4 shrink-0 stroke-[3]" /> {successMessage}
                </div>
              )}

              <form onSubmit={handleAddBanner} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5">Promotion Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50% OFF Weekend Madness"
                    value={bannerData.title}
                    onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
                    className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2.5 text-black neo-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5">Subtitle / Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Use Code FEAST50 on checkout"
                    value={bannerData.subtitle}
                    onChange={(e) => setBannerData({ ...bannerData, subtitle: e.target.value })}
                    className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2.5 text-black neo-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5">Poster Image or MP4 Video *</label>
                  {mediaPreview ? (
                    <div className="relative rounded-xl overflow-hidden border-[2.5px] border-black bg-zinc-100 h-40 flex items-center justify-center neo-shadow-xs">
                      {mediaType === 'video' ? (
                        <video src={mediaPreview} className="w-full h-full object-cover" autoPlay muted loop />
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => { setMediaFile(null); setMediaPreview(''); }}
                        className="absolute top-2 right-2 bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-lg border-2 border-black neo-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-black hover:bg-[#FFE600]/20 rounded-xl p-5 cursor-pointer bg-[#FAF6EF] transition">
                      <Film className="w-8 h-8 text-black mb-2" />
                      <span className="text-xs font-black text-black uppercase">Choose Image or MP4 Video</span>
                      <span className="text-[10px] font-bold text-zinc-500 mt-0.5">PNG, JPG, MP4 (Max 50MB)</span>
                      <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 bg-[#FF5722] hover:bg-[#E64A19] font-black text-sm uppercase text-white rounded-xl neo-btn disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading Banner...' : 'Publish to Storefront Slider'}
                </button>
              </form>
            </div>

            {/* Live Slider Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-base font-black uppercase text-black neo-font-display">
                  Live Banner Slides ({banners.length})
                </h2>
                <button 
                  onClick={fetchBanners} 
                  className="text-xs font-black uppercase text-black bg-[#FFE600] px-3 py-1 rounded-lg border-2 border-black neo-shadow-xs"
                >
                  Refresh
                </button>
              </div>

              {loadingBanners ? (
                <div className="text-center py-20 font-black text-sm">Loading promotional slides...</div>
              ) : banners.length === 0 ? (
                <div className="text-center py-20 text-zinc-600 font-bold">
                  No promo slides active yet. Upload your first poster on the left!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {banners.map((b) => (
                    <div 
                      key={b._id} 
                      className="bg-white border-[3px] border-black rounded-2xl overflow-hidden relative neo-card"
                    >
                      <div className="h-40 w-full bg-zinc-100 relative border-b-2 border-black">
                        {b.mediaType === 'video' ? (
                          <video src={b.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                        ) : (
                          <img src={b.mediaUrl} alt={b.title} className="w-full h-full object-cover" />
                        )}
                        <span className="absolute top-2.5 left-2.5 bg-[#FFE600] border-2 border-black px-2 py-0.5 rounded text-[10px] font-black uppercase text-black shadow-[2px_2px_0_#000]">
                          {b.mediaType}
                        </span>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                          <h4 className="font-black text-sm text-black truncate">{b.title}</h4>
                          {b.subtitle && <p className="text-xs font-bold text-zinc-600 truncate">{b.subtitle}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteBanner(b._id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-xl neo-btn shrink-0"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.5]" />
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

      {/* EDIT DISH MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF5] border-[4px] border-black rounded-2xl w-full max-w-lg overflow-hidden shadow-[8px_8px_0px_#000] animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#FFE600] border-b-[3px] border-black flex items-center justify-between">
              <h3 className="font-black text-base uppercase text-black neo-font-display">Modify Dish Details</h3>
              <button 
                onClick={() => setEditingProduct(null)} 
                className="p-1 bg-white hover:bg-zinc-100 border-2 border-black rounded-lg shadow-[2px_2px_0_#000]"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2 text-black neo-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-white text-sm font-bold rounded-xl px-3.5 py-2 text-black neo-input cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2 text-black neo-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">Calories</label>
                <input
                  type="text"
                  value={editFormData.calories}
                  onChange={(e) => setEditFormData({ ...editFormData, calories: e.target.value })}
                  className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2 text-black neo-input"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">Replace Image (Optional)</label>
                <div className="flex items-center gap-3">
                  <img 
                    src={editImagePreview} 
                    alt="Preview" 
                    className="w-14 h-14 rounded-xl object-cover bg-zinc-100 border-2 border-black shadow-[2px_2px_0_#000]" 
                  />
                  <label className="px-4 py-2 bg-[#FFE600] hover:bg-[#FFD500] border-2 border-black text-xs font-black uppercase rounded-xl cursor-pointer text-black neo-btn">
                    Change Image
                    <input type="file" accept="image/*" onChange={handleEditImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 bg-white hover:bg-zinc-100 border-2 border-black rounded-xl text-xs font-black uppercase text-black neo-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#FF5722] hover:bg-[#E64A19] border-2 border-black rounded-xl text-xs font-black uppercase text-white neo-btn"
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