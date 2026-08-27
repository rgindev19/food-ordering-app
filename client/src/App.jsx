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
  Sparkles,
  Star,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';
import { useCartStore } from './store/useCartStore';
import logoImg from './assets/logo (2).png';

const CATEGORIES = ['All', 'Signature Bowls', 'Burgers', 'Pasta', 'Drinks', 'Desserts'];

const CATEGORY_COLORS = {
  'All': 'bg-[#FFE600] text-black',
  'Signature Bowls': 'bg-[#FF70A6] text-black',
  'Burgers': 'bg-[#FF5722] text-white',
  'Pasta': 'bg-[#A855F7] text-white',
  'Drinks': 'bg-[#38BDF8] text-black',
  'Desserts': 'bg-[#22C55E] text-black'
};

export default function App() {
  const [foods, setFoods] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Automatic Slide Interval
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
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
        setOrderSuccess(res.data.order || { _id: 'NEW' + Date.now().toString().slice(-6), total });
        clearCart();
      }
    } catch (err) {
      alert('Order failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = foods.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalItems = cart.reduce((a, c) => a + c.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF6EF] text-[#121212] flex flex-col font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* NEOBRUTALIST TOP BANNER TICKER */}
      <div className="bg-[#FFE600] border-b-[3px] border-black py-1.5 px-4 overflow-hidden select-none">
        <div className="flex items-center justify-center gap-6 text-xs font-black uppercase tracking-wider text-black">
          <span className="flex items-center gap-1.5">⚡ FAST 25-MIN DISPATCH</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1.5">🔥 100% ARTISANAL FLAVORS</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:flex items-center gap-1.5">🎉 FREE DELIVERY ON ORDERS OVER $35</span>
        </div>
      </div>

      {/* NAVIGATION HEADER */}
      <header className="sticky top-0 z-30 bg-[#FAF6EF]/95 backdrop-blur border-b-[3px] border-black px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_4px_0_#000]">
        <div className="flex items-center gap-3">
          <div className="bg-[#FFE600] border-[2.5px] border-black p-1.5 rounded-xl neo-shadow-xs flex items-center justify-center rotate-[-2deg]">
            <img 
              src={logoImg} 
              alt="SavorMERN" 
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <Flame className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black neo-font-display flex items-center gap-1">
              SAVOR<span className="bg-[#FF5722] text-white px-2 py-0.5 rounded-lg border-2 border-black neo-shadow-xs rotate-[1deg] text-base sm:text-lg">MERN</span>
            </h1>
            <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block -mt-0.5">
              Bold Neo-Brutalist Eats
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-72 lg:w-96 hidden md:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black font-bold" />
          <input
            type="text"
            placeholder="Search burgers, bowls, sweets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-[2.5px] border-black text-sm font-semibold rounded-xl pl-10 pr-9 py-2.5 neo-shadow-xs focus:outline-none focus:shadow-[4px_4px_0px_#000] focus:-translate-y-0.5 transition placeholder:text-zinc-400 placeholder:font-medium"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:bg-zinc-100 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bag / Cart Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 bg-[#FFE600] hover:bg-[#FFD500] text-black font-black text-sm rounded-xl neo-btn"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline neo-font-display">BAG</span>
            {cartTotalItems > 0 && (
              <span className="bg-[#FF5722] text-white text-xs font-black px-2 py-0.5 rounded-full border-[2px] border-black shadow-[1px_1px_0_#000]">
                {cartTotalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MOBILE SEARCH BAR */}
      <div className="p-4 md:hidden bg-[#FAF6EF] border-b-2 border-black">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black" />
          <input
            type="text"
            placeholder="Search delicious cravings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-[2.5px] border-black text-sm font-semibold rounded-xl pl-9 pr-4 py-2 neo-shadow-xs focus:outline-none focus:shadow-[3px_3px_0px_#000]"
          />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
        
        {/* PROMOTIONAL BANNER / VIDEO SLIDER */}
        {banners.length > 0 && (
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border-[3.5px] border-black neo-shadow-lg bg-[#121212]">
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {banner.mediaType === 'video' ? (
                  <video
                    src={banner.mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-85"
                  />
                ) : (
                  <img
                    src={banner.mediaUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                )}

                {/* High-Contrast Neobrutalist Banner Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-10">
                  <div className="max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase bg-[#FFE600] text-black border-2 border-black neo-shadow-xs rotate-[-1deg]">
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      SPECIAL PROMOTION
                    </div>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white neo-font-display tracking-tight leading-none drop-shadow-[2px_2px_0px_#000]">
                      {banner.title}
                    </h2>
                    {banner.subtitle && (
                      <p className="text-zinc-200 text-sm sm:text-base font-bold bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 inline-block">
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-xl bg-white hover:bg-[#FFE600] text-black border-[2.5px] border-black neo-shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-xl bg-white hover:bg-[#FFE600] text-black border-[2.5px] border-black neo-shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Navigation Dots */}
                <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-3 rounded-full border-2 border-black transition-all ${
                        currentSlide === i 
                          ? 'w-8 bg-[#FFE600] shadow-[2px_2px_0_#000]' 
                          : 'w-3 bg-white hover:bg-zinc-200'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* VALUE PROPOSITION BADGES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-white border-[2.5px] border-black rounded-xl p-3 neo-shadow-xs flex items-center gap-3">
            <div className="p-2 bg-[#FFE600] border-2 border-black rounded-lg neo-shadow-xs text-black">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-black uppercase">Ultra Fast</p>
              <p className="text-[11px] font-semibold text-zinc-600">25 Min Express</p>
            </div>
          </div>
          <div className="bg-white border-[2.5px] border-black rounded-xl p-3 neo-shadow-xs flex items-center gap-3">
            <div className="p-2 bg-[#FF70A6] border-2 border-black rounded-lg neo-shadow-xs text-black">
              <Star className="w-4 h-4 fill-black" />
            </div>
            <div>
              <p className="text-xs font-black text-black uppercase">Chef Crafted</p>
              <p className="text-[11px] font-semibold text-zinc-600">Fresh Daily Prep</p>
            </div>
          </div>
          <div className="bg-white border-[2.5px] border-black rounded-xl p-3 neo-shadow-xs flex items-center gap-3">
            <div className="p-2 bg-[#22C55E] border-2 border-black rounded-lg neo-shadow-xs text-black">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-black uppercase">Top Quality</p>
              <p className="text-[11px] font-semibold text-zinc-600">100% Organic</p>
            </div>
          </div>
          <div className="bg-white border-[2.5px] border-black rounded-xl p-3 neo-shadow-xs flex items-center gap-3">
            <div className="p-2 bg-[#A855F7] border-2 border-black rounded-lg neo-shadow-xs text-white">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-black uppercase">Best Value</p>
              <p className="text-[11px] font-semibold text-zinc-600">Free Over $35</p>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-3 h-3 bg-[#FF5722] border border-black inline-block rounded-sm"></span>
              Explore Menu Categories
            </h3>
            <span className="text-xs font-bold text-zinc-500">{filteredItems.length} items available</span>
          </div>

          <div className="flex gap-2.5 pb-2 overflow-x-auto no-scrollbar pt-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const activeBg = CATEGORY_COLORS[cat] || 'bg-[#FFE600] text-black';

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wide border-[2.5px] border-black transition whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? `${activeBg} shadow-[4px_4px_0px_#000] -translate-y-1`
                      : 'bg-white hover:bg-zinc-100 text-black hover:shadow-[3px_3px_0px_#000]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* FOOD CATALOG GRID */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-white border-[3px] border-black rounded-2xl neo-shadow font-black text-base animate-pulse">
              🍳 Loading delicious kitchen dishes...
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white border-[3px] border-black rounded-2xl neo-shadow p-8 max-w-md mx-auto">
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="font-black text-xl neo-font-display">No Dishes Found</h3>
            <p className="text-xs font-semibold text-zinc-600 mt-1 mb-4">
              Try choosing another category or clearing your search query.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearch(''); }}
              className="px-4 py-2 bg-[#FFE600] font-black text-xs uppercase border-2 border-black rounded-xl neo-btn"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white border-[3px] border-black rounded-2xl overflow-hidden neo-card flex flex-col justify-between group"
              >
                {/* Image Section */}
                <div className="h-52 w-full overflow-hidden relative bg-zinc-100 border-b-[3px] border-black">
                  <img
                    src={getImageUrl(item.image || item.imageUrl)}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 bg-white border-2 border-black px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                    {item.category}
                  </span>

                  {/* Calories Tag */}
                  {item.calories && (
                    <span className="absolute bottom-3 left-3 bg-[#FFE600] border-2 border-black px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                      {item.calories}
                    </span>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-black text-lg text-black leading-snug tracking-tight neo-font-display">
                      {item.name}
                    </h3>
                  </div>

                  {/* Price & Add Button */}
                  <div className="flex items-center justify-between pt-3 border-t-2 border-zinc-200">
                    <div className="bg-[#FFE600] border-2 border-black px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_#000]">
                      <span className="text-base font-black text-black">
                        ${item.price?.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FF5722] hover:bg-[#E64A19] text-white font-black text-xs uppercase rounded-xl neo-btn"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>ADD</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t-[3.5px] border-black mt-16 py-8 px-6 text-center shadow-[0_-4px_0_#000]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-black text-lg neo-font-display">
            <span className="bg-[#FFE600] p-1 border-2 border-black rounded-lg">🍔</span>
            SAVOR<span className="text-[#FF5722]">MERN</span>
          </div>
          <p className="text-xs font-bold text-zinc-600">
            © {new Date().getFullYear()} SavorMERN Inc. Handcrafted with bold Neobrutalism vibes.
          </p>
          <div className="flex items-center gap-3">
            <span className="bg-[#22C55E] text-black text-[10px] font-black uppercase px-2.5 py-1 rounded border-2 border-black neo-shadow-xs">
              Kitchen Online
            </span>
          </div>
        </div>
      </footer>

      {/* CART DRAWER / SIDE OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFDF5] border-l-[4px] border-black h-full flex flex-col shadow-[-8px_0px_0px_#000] animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-5 border-b-[3px] border-black bg-[#FFE600] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                <h2 className="text-lg font-black uppercase tracking-tight neo-font-display">Your Craving Bag</h2>
              </div>
              <button 
                onClick={toggleCart} 
                className="p-1.5 bg-white hover:bg-zinc-100 border-2 border-black rounded-lg neo-shadow-xs cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {orderSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 bg-white border-[3px] border-black rounded-2xl neo-shadow my-auto">
                  <div className="w-16 h-16 bg-[#22C55E] text-black border-[3px] border-black rounded-2xl flex items-center justify-center neo-shadow">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <h3 className="text-2xl font-black neo-font-display text-black">Order Placed!</h3>
                  <p className="text-xs font-bold text-zinc-600">
                    The kitchen is firing up your order now.
                  </p>
                  <div className="bg-[#FAF6EF] border-2 border-black p-3 rounded-xl w-full text-xs font-mono font-bold text-black">
                    Receipt ID: #{orderSuccess._id ? orderSuccess._id.slice(-6).toUpperCase() : 'REC778'}
                  </div>
                  <button
                    onClick={() => { setOrderSuccess(null); toggleCart(); }}
                    className="w-full py-3 bg-[#FFE600] text-black border-[2.5px] border-black rounded-xl font-black text-xs uppercase neo-btn"
                  >
                    Order More Dishes
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500 space-y-3">
                  <div className="text-5xl">🛍️</div>
                  <h4 className="font-black text-lg text-black neo-font-display">Your bag is empty!</h4>
                  <p className="text-xs font-semibold text-zinc-500 max-w-xs">
                    Add some delicious artisanal burgers, bowls, or drinks to get started.
                  </p>
                  <button
                    onClick={toggleCart}
                    className="mt-2 px-5 py-2.5 bg-[#FFE600] text-black border-2 border-black rounded-xl font-black text-xs uppercase neo-btn"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-white p-3.5 rounded-xl border-[2.5px] border-black neo-shadow-xs"
                  >
                    <div className="flex items-center gap-3 pr-2 flex-1 min-w-0">
                      <img
                        src={getImageUrl(item.image || item.imageUrl)}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover bg-zinc-100 border-2 border-black shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="truncate">
                        <h4 className="font-black text-sm text-black truncate">{item.name}</h4>
                        <span className="text-xs font-black text-[#FF5722] bg-[#FAF6EF] px-2 py-0.5 border border-black rounded inline-block mt-0.5">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-[#FAF6EF] border-2 border-black p-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="p-1 bg-white hover:bg-red-100 border border-black rounded-lg text-black active:scale-90 transition"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-600" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="p-1 bg-white hover:bg-green-100 border border-black rounded-lg text-black active:scale-90 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Receipt Summary */}
            {cart.length > 0 && !orderSuccess && (
              <div className="p-5 border-t-[3px] border-black bg-white space-y-3 shadow-[0_-4px_0_#000]">
                <div className="space-y-1.5 text-xs font-bold text-zinc-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-black font-black">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Fee</span>
                    <span>
                      {delivery === 0 ? (
                        <span className="bg-[#22C55E] text-black px-2 py-0.5 rounded border border-black text-[10px] font-black">
                          FREE
                        </span>
                      ) : (
                        `$${delivery.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-black pt-2 border-t-2 border-dashed border-black">
                    <span>Total Amount</span>
                    <span className="text-lg text-[#FF5722] bg-[#FFE600] px-2 py-0.5 border-2 border-black rounded-lg neo-shadow-xs">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full mt-3 py-4 bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-50 text-white font-black text-base uppercase rounded-xl border-[3px] border-black neo-shadow hover:shadow-[6px_6px_0px_#000] active:shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    'Processing Order...'
                  ) : (
                    <>
                      <span>Place Order Now</span>
                      <ArrowRight className="w-5 h-5 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}