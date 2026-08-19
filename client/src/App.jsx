// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { useCartStore } from './store/useCartStore';
import logoImg from './assets/logo (2).png'; // or logo.svg

const CATEGORIES = ['All', 'Signature Bowls', 'Burgers', 'Pasta', 'Drinks', 'Desserts'];

export default function App() {
  const [foods, setFoods] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const { cart, isCartOpen, toggleCart, addToCart, updateQuantity, clearCart, getTotals } = useCartStore();

  const totals = typeof getTotals === 'function' ? getTotals() : {
    subtotal: cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    delivery: cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) > 35 || cart.length === 0 ? 0 : 3.99,
    total: cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) + (cart.length === 0 ? 0 : 3.99)
  };
  const { subtotal, delivery, total } = totals;

  const getImageUrl = (imageSrc) => {
    if (!imageSrc) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
    if (imageSrc.startsWith('http')) return imageSrc;
    if (imageSrc.startsWith('/uploads')) return `http://localhost:5000${imageSrc}`;
    return imageSrc;
  };

  // Fetch Foods and Banners
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [foodsRes, bannersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/foods'),
          axios.get('http://localhost:5000/api/banners')
        ]);
        setFoods(foodsRes.data);
        setBanners(bannersRes.data);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Automatic Slide Interval (Advances every 6 seconds)
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleCheckout = async () => {
    try {
      const payload = {
        items: cart.map((item) => ({
          foodItem: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal,
        deliveryFee: delivery,
        total
      };

      const res = await axios.post('http://localhost:5000/api/orders', payload);
      if (res.data.success) {
        alert('Order placed successfully! The kitchen is preparing your meal.');
        clearCart();
        toggleCart();
      }
    } catch (err) {
      alert('Order failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredItems = foods.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
    src={logoImg} 
    alt="Union Hardware Far East Corp." 
    className="h-11 w-auto object-contain"
  />
          <h1 className="text-xl font-bold tracking-tight">
            Savor<span className="text-orange-500">MERN</span>
          </h1>
        </div>

        <div className="relative w-72 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search cravings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800/80 border border-zinc-700 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-zinc-500"
          />
        </div>

        <button
          onClick={toggleCart}
          className="relative p-2.5 bg-zinc-800 border border-zinc-700 rounded-full hover:bg-zinc-700 transition"
        >
          <ShoppingBag className="w-5 h-5 text-zinc-200" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* PROMOTIONAL BANNER / VIDEO SLIDER */}
        {banners.length > 0 && (
          <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Poster or Video */}
                {banner.mediaType === 'video' ? (
                  <video
                    src={banner.mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={banner.mediaUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Dark Gradient Overlay & Text Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                  <div className="max-w-xl space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/90 backdrop-blur-md text-white">
                      <Sparkles className="w-3.5 h-3.5" /> Special Promotion
                    </span>
                    <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                      {banner.title}
                    </h2>
                    {banner.subtitle && (
                      <p className="text-zinc-300 text-sm md:text-base drop-shadow">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Next / Prev Arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-zinc-950/60 hover:bg-zinc-900 text-white backdrop-blur border border-zinc-700 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-zinc-950/60 hover:bg-zinc-900 text-white backdrop-blur border border-zinc-700 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Navigation Dots */}
                <div className="absolute bottom-4 right-8 z-20 flex gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === i ? 'w-8 bg-orange-500' : 'w-2 bg-zinc-600/80 hover:bg-zinc-400'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500">Loading dishes...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">No dishes available in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition flex flex-col group"
              >
                <div className="h-48 w-full overflow-hidden relative bg-zinc-800">
                  <img
                    src={getImageUrl(item.image || item.imageUrl)}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {item.calories && (
                    <span className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs text-zinc-300 font-medium">
                      {item.calories}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-zinc-100">{item.name}</h3>
                    <p className="text-zinc-400 text-xs mt-1">{item.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-lg font-bold text-orange-400">${item.price?.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-white transition active:scale-95 shadow-md shadow-orange-500/10"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold">Your Order</h2>
              <button onClick={toggleCart} className="p-2 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">Your cart is empty.</div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-zinc-800/40 p-4 rounded-xl border border-zinc-800"
                  >
                    <div className="flex items-center gap-3 pr-2 flex-1 min-w-0">
                      <img
                        src={getImageUrl(item.image || item.imageUrl)}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-800 shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="truncate">
                        <h4 className="font-medium text-sm text-zinc-100 truncate">{item.name}</h4>
                        <span className="text-xs text-orange-400">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-300"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-800 space-y-3 bg-zinc-900/50">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? 'Free' : `$${delivery.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-zinc-100 pt-2 border-t border-zinc-800">
                  <span>Total</span>
                  <span className="text-orange-400">${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full mt-4 py-3.5 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-white transition active:scale-[0.98] shadow-lg shadow-orange-500/25 cursor-pointer"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}