// client/src/components/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, 
  ShoppingBag, 
  MapPin, 
  User, 
  Phone, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Sparkles, 
  Check, 
  Tag, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Clock, 
  Bike, 
  ChefHat, 
  CheckCircle2, 
  Receipt,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

const PROMO_CODES = {
  'FEAST50': { type: 'percent', value: 0.5, max: 15, label: '50% OFF (Max $15)' },
  'SAVOR20': { type: 'percent', value: 0.2, label: '20% OFF Everything' },
  'FREEDELIVERY': { type: 'delivery', value: 0, label: '100% Free Delivery' },
  'NEOBRUTAL': { type: 'flat', value: 5, label: '$5.00 Flat Discount' }
};

export default function CheckoutPage({ onBackToMenu }) {
  const { cart, updateQuantity, clearCart } = useCartStore();

  // Load Saved Form State from localStorage on Mount
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('savormern_checkout_form');
      return saved ? JSON.parse(saved) : {
        fullName: '',
        phone: '',
        street: '',
        apt: '',
        city: '',
        zip: '',
        notes: ''
      };
    } catch {
      return { fullName: '', phone: '', street: '', apt: '', city: '', zip: '', notes: '' };
    }
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem('savormern_payment_method') || 'COD';
  });

  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
  
  const [walletProvider, setWalletProvider] = useState(() => {
    return localStorage.getItem('savormern_wallet_provider') || 'GCash';
  });

  const [includeUtensils, setIncludeUtensils] = useState(() => {
    const saved = localStorage.getItem('savormern_include_utensils');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [contactless, setContactless] = useState(() => {
    const saved = localStorage.getItem('savormern_contactless');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(() => {
    try {
      const saved = localStorage.getItem('savormern_applied_promo');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [promoError, setPromoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Placed Order Persistence (so reload keeps tracking view active)
  const [placedOrder, setPlacedOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('savormern_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auto-Save Form Data to localStorage on Change
  useEffect(() => {
    localStorage.setItem('savormern_checkout_form', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('savormern_payment_method', paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    localStorage.setItem('savormern_wallet_provider', walletProvider);
  }, [walletProvider]);

  useEffect(() => {
    localStorage.setItem('savormern_include_utensils', JSON.stringify(includeUtensils));
  }, [includeUtensils]);

  useEffect(() => {
    localStorage.setItem('savormern_contactless', JSON.stringify(contactless));
  }, [contactless]);

  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem('savormern_applied_promo', JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem('savormern_applied_promo');
    }
  }, [appliedPromo]);

  useEffect(() => {
    if (placedOrder) {
      localStorage.setItem('savormern_active_order', JSON.stringify(placedOrder));
    } else {
      localStorage.removeItem('savormern_active_order');
    }
  }, [placedOrder]);

  // Calculate Subtotal & Delivery
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  
  let deliveryFee = subtotal > 35 || cart.length === 0 ? 0 : 3.99;
  if (appliedPromo?.code === 'FREEDELIVERY') {
    deliveryFee = 0;
  }

  // Calculate Discount
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discount = subtotal * appliedPromo.value;
      if (appliedPromo.max) discount = Math.min(discount, appliedPromo.max);
    } else if (appliedPromo.type === 'flat') {
      discount = Math.min(appliedPromo.value, subtotal);
    }
  }

  const finalTotal = Math.max(0, subtotal + deliveryFee - discount);

  const getImageUrl = (imageSrc) => {
    if (!imageSrc) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
    if (imageSrc.startsWith('http')) return imageSrc;
    if (imageSrc.startsWith('/uploads')) return `http://localhost:5000${imageSrc}`;
    return imageSrc;
  };

  const handleApplyPromo = (codeToApply) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      setAppliedPromo({ code, ...PROMO_CODES[code] });
      setPromoError('');
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon code. Try FEAST50 or SAVOR20!');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  const handleClearOrderAndReturn = () => {
    setPlacedOrder(null);
    localStorage.removeItem('savormern_active_order');
    onBackToMenu();
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Your cart is empty.');
    if (!formData.fullName || !formData.phone || !formData.street || !formData.city) {
      return alert('Please fill in all required delivery information.');
    }

    if (paymentMethod === 'CARD' && (!cardData.number || !cardData.expiry || !cardData.cvv)) {
      return alert('Please complete the card payment details.');
    }

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
        deliveryFee,
        total: finalTotal,
        customerName: formData.fullName,
        phone: formData.phone,
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          apt: formData.apt,
          zip: formData.zip
        },
        paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod === 'CARD' ? 'Credit Card' : walletProvider,
        notes: [
          formData.notes,
          includeUtensils ? 'Include Utensils' : 'No Utensils',
          contactless ? 'Contactless Delivery' : ''
        ].filter(Boolean).join(' • '),
        promoCode: appliedPromo?.code || '',
        discount
      };

      const res = await axios.post('http://localhost:5000/api/orders', payload);
      if (res.data.success) {
        const orderData = res.data.order || { ...payload, _id: 'ORD' + Date.now().toString().slice(-6) };
        setPlacedOrder(orderData);
        localStorage.setItem('savormern_active_order', JSON.stringify(orderData));
        clearCart();
      }
    } catch (err) {
      alert('Checkout Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ORDER SUCCESS / TRACKING SCREEN ---
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] text-[#121212] py-12 px-4 sm:px-8 font-sans">
        <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-200">
          
          {/* Top Success Badge */}
          <div className="bg-white border-[3.5px] border-black rounded-3xl p-8 neo-shadow-lg text-center space-y-4 relative overflow-hidden">
            <div className="inline-flex p-4 bg-[#22C55E] text-black border-[3px] border-black rounded-2xl neo-shadow rotate-[-2deg]">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div>
              <span className="bg-[#FFE600] text-black border-2 border-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider neo-shadow-xs">
                Order #{placedOrder._id ? placedOrder._id.slice(-6).toUpperCase() : 'ORD778'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black mt-3 neo-font-display text-black">
                Order Confirmed & Firing Up! 🍔
              </h1>
              <p className="text-sm font-bold text-zinc-600 mt-1 max-w-md mx-auto">
                Thank you, <span className="text-black font-black">{placedOrder.customerName}</span>! Our chef is preparing your meal with artisanal perfection.
              </p>
            </div>

            {/* LIVE ORDER STATUS PROGRESS STEPPER */}
            <div className="pt-6 pb-2 border-t-2 border-dashed border-black">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-6">Live Kitchen Dispatch Tracker</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#22C55E] text-black border-2 border-black flex items-center justify-center neo-shadow-xs font-black">
                    <Receipt className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-black text-black uppercase">Received</span>
                  <span className="text-[10px] font-bold text-zinc-500">Just now</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE600] text-black border-2 border-black flex items-center justify-center neo-shadow-xs font-black animate-pulse">
                    <ChefHat className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-black text-black uppercase">Cooking</span>
                  <span className="text-[10px] font-bold text-[#FF5722]">Active</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center space-y-2 opacity-60">
                  <div className="w-10 h-10 rounded-xl bg-white text-zinc-400 border-2 border-black flex items-center justify-center">
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-600 uppercase">On Route</span>
                  <span className="text-[10px] font-bold text-zinc-400">~15 mins</span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center space-y-2 opacity-60">
                  <div className="w-10 h-10 rounded-xl bg-white text-zinc-400 border-2 border-black flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-600 uppercase">Delivered</span>
                  <span className="text-[10px] font-bold text-zinc-400">~25 mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="bg-white border-[3px] border-black rounded-3xl p-6 neo-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="font-black text-base uppercase neo-font-display text-black flex items-center gap-2">
                <FileText className="w-4 h-4" /> Delivery & Payment Summary
              </h3>
              <span className="text-xs font-bold text-zinc-500">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-zinc-700">
              <div>
                <p className="text-zinc-500 font-black uppercase text-[10px]">Deliver To:</p>
                <p className="text-black font-black text-sm mt-0.5">{placedOrder.customerName} ({placedOrder.phone})</p>
                <p className="text-zinc-600">{placedOrder.deliveryAddress?.street} {placedOrder.deliveryAddress?.apt}</p>
                <p className="text-zinc-600">{placedOrder.deliveryAddress?.city} {placedOrder.deliveryAddress?.zip}</p>
              </div>
              <div>
                <p className="text-zinc-500 font-black uppercase text-[10px]">Payment Method:</p>
                <p className="text-black font-black text-sm mt-0.5">{placedOrder.paymentMethod}</p>
                <p className="text-zinc-600">Status: <span className="bg-[#FFE600] px-2 py-0.5 rounded border border-black text-black font-black">Pending Payment</span></p>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="pt-3 border-t-2 border-dashed border-black space-y-2">
              <p className="text-zinc-500 font-black uppercase text-[10px]">Ordered Dishes:</p>
              {placedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-bold text-black">
                  <span className="flex items-center gap-2">
                    <span className="bg-[#FFE600] border border-black px-1.5 py-0.5 rounded text-[10px] font-black">
                      {item.quantity}x
                    </span>
                    {item.name}
                  </span>
                  <span className="font-black">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Total Block */}
            <div className="pt-3 border-t-2 border-black flex justify-between items-center text-base font-black text-black">
              <span>Grand Total Paid:</span>
              <span className="text-lg text-[#FF5722] bg-[#FFE600] px-3 py-1 rounded-xl border-2 border-black neo-shadow-xs">
                ${placedOrder.total?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClearOrderAndReturn}
              className="flex-1 py-4 bg-[#FFE600] hover:bg-[#FFD500] text-black font-black text-sm uppercase rounded-2xl border-[3px] border-black neo-btn text-center cursor-pointer"
            >
              Order More Crave Food 🍔
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CHECKOUT FORM SCREEN ---
  return (
    <div className="min-h-screen bg-[#FAF6EF] text-[#121212] py-8 px-4 sm:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b-[3px] border-black">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase rounded-xl border-2 border-black neo-btn"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Back to Menu</span>
          </button>

          <div className="text-right">
            <h1 className="text-xl sm:text-2xl font-black text-black neo-font-display uppercase tracking-tight">
              Express Checkout 🚀
            </h1>
            <p className="text-xs font-bold text-zinc-600">Draft automatically saved on load</p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white border-[3.5px] border-black rounded-3xl neo-shadow-md max-w-md mx-auto p-8 space-y-4">
            <div className="text-5xl">🛍️</div>
            <h2 className="text-2xl font-black neo-font-display text-black">Your bag is empty</h2>
            <p className="text-xs font-bold text-zinc-600">Add some delicious dishes first before checking out.</p>
            <button
              onClick={onBackToMenu}
              className="px-6 py-3 bg-[#FFE600] text-black border-2 border-black rounded-xl font-black text-xs uppercase neo-btn"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Customer Info, Address, Payment (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* STEP 1: Delivery Information */}
              <div className="bg-white border-[3.5px] border-black rounded-2xl p-6 neo-shadow space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
                  <div className="w-7 h-7 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <h2 className="text-base font-black uppercase text-black neo-font-display">
                    Delivery Address & Contact
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-white text-sm font-semibold rounded-xl pl-9 pr-3 py-2.5 text-black neo-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white text-sm font-semibold rounded-xl pl-9 pr-3 py-2.5 text-black neo-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase text-black mb-1">Street Address *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        required
                        placeholder="742 Evergreen Terrace"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full bg-white text-sm font-semibold rounded-xl pl-9 pr-3 py-2.5 text-black neo-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">Apt / Suite</label>
                    <input
                      type="text"
                      placeholder="Apt 4B"
                      value={formData.apt}
                      onChange={(e) => setFormData({ ...formData, apt: e.target.value })}
                      className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2.5 text-black neo-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Springfield"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2.5 text-black neo-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">Postal / Zip Code</label>
                    <input
                      type="text"
                      placeholder="97477"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2.5 text-black neo-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">Delivery Notes / Gate Code</label>
                  <input
                    type="text"
                    placeholder="e.g. Ring doorbell twice, leave on the front chair"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white text-sm font-semibold rounded-xl px-3.5 py-2.5 text-black neo-input"
                  />
                </div>
              </div>

              {/* STEP 2: Payment Method */}
              <div className="bg-white border-[3.5px] border-black rounded-2xl p-6 neo-shadow space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
                  <div className="w-7 h-7 rounded-lg bg-[#38BDF8] text-black border-2 border-black flex items-center justify-center font-black text-xs">
                    2
                  </div>
                  <h2 className="text-base font-black uppercase text-black neo-font-display">
                    Select Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Option 1: COD */}
                  <label 
                    onClick={() => setPaymentMethod('COD')}
                    className={`border-[2.5px] border-black rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                      paymentMethod === 'COD'
                        ? 'bg-[#FFE600] shadow-[3px_3px_0_#000] -translate-y-1 font-black'
                        : 'bg-[#FAF6EF] hover:bg-zinc-100 font-bold'
                    }`}
                  >
                    <Banknote className="w-6 h-6 mb-1 text-black" />
                    <span className="text-xs uppercase text-black">Cash on Delivery</span>
                    <span className="text-[10px] text-zinc-600 mt-0.5">Pay on Arrival</span>
                  </label>

                  {/* Option 2: Card */}
                  <label 
                    onClick={() => setPaymentMethod('CARD')}
                    className={`border-[2.5px] border-black rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                      paymentMethod === 'CARD'
                        ? 'bg-[#FFE600] shadow-[3px_3px_0_#000] -translate-y-1 font-black'
                        : 'bg-[#FAF6EF] hover:bg-zinc-100 font-bold'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mb-1 text-black" />
                    <span className="text-xs uppercase text-black">Debit / Credit Card</span>
                    <span className="text-[10px] text-zinc-600 mt-0.5">Instant & Secure</span>
                  </label>

                  {/* Option 3: E-Wallet */}
                  <label 
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`border-[2.5px] border-black rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                      paymentMethod === 'WALLET'
                        ? 'bg-[#FFE600] shadow-[3px_3px_0_#000] -translate-y-1 font-black'
                        : 'bg-[#FAF6EF] hover:bg-zinc-100 font-bold'
                    }`}
                  >
                    <Smartphone className="w-6 h-6 mb-1 text-black" />
                    <span className="text-xs uppercase text-black">Digital Wallet</span>
                    <span className="text-[10px] text-zinc-600 mt-0.5">GCash / Apple Pay</span>
                  </label>
                </div>

                {/* Card Inputs Details */}
                {paymentMethod === 'CARD' && (
                  <div className="p-4 bg-[#FAF6EF] border-2 border-black rounded-xl space-y-3 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-black mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8892"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        className="w-full bg-white text-xs font-semibold rounded-lg px-3 py-2 text-black neo-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-black mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full bg-white text-xs font-semibold rounded-lg px-3 py-2 text-black neo-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase text-black mb-1">CVC / CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="w-full bg-white text-xs font-semibold rounded-lg px-3 py-2 text-black neo-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Digital Wallet Options */}
                {paymentMethod === 'WALLET' && (
                  <div className="p-4 bg-[#FAF6EF] border-2 border-black rounded-xl flex gap-2 animate-in fade-in">
                    {['GCash', 'Apple Pay', 'Google Pay'].map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setWalletProvider(prov)}
                        className={`flex-1 py-2 text-xs font-black uppercase rounded-lg border-2 border-black transition ${
                          walletProvider === prov
                            ? 'bg-[#22C55E] text-black shadow-[2px_2px_0_#000]'
                            : 'bg-white text-zinc-700'
                        }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                )}

                {/* Eco & Contactless Options */}
                <div className="pt-3 border-t-2 border-zinc-200 space-y-2 text-xs font-bold text-black">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeUtensils}
                      onChange={(e) => setIncludeUtensils(e.target.checked)}
                      className="w-4 h-4 accent-[#FF5722] rounded border-2 border-black"
                    />
                    <span>Include biodegradable cutlery and napkins 🍴</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={contactless}
                      onChange={(e) => setContactless(e.target.checked)}
                      className="w-4 h-4 accent-[#FF5722] rounded border-2 border-black"
                    />
                    <span>Contactless Delivery (Leave at doorstep) 🚪</span>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary, Promo Code, Place Order CTA (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white border-[3.5px] border-black rounded-2xl p-6 neo-shadow-md space-y-5 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <h2 className="text-base font-black uppercase text-black neo-font-display flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                    Order Summary ({cart.reduce((a, c) => a + c.quantity, 0)})
                  </h2>
                  <span className="text-xs font-bold text-zinc-500">Live Kitchen Receipt</span>
                </div>

                {/* Items Mini List */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {cart.map((item) => (
                    <div 
                      key={item._id} 
                      className="flex items-center justify-between bg-[#FAF6EF] p-2.5 rounded-xl border-2 border-black"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <img 
                          src={getImageUrl(item.image || item.imageUrl)} 
                          alt={item.name} 
                          className="w-11 h-11 rounded-lg object-cover bg-white border border-black shrink-0" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0 truncate">
                          <p className="text-xs font-black text-black truncate">{item.name}</p>
                          <p className="text-[11px] font-bold text-[#FF5722]">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white border border-black p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, -1)}
                          className="p-1 hover:bg-zinc-100 rounded text-black font-black"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, 1)}
                          className="p-1 hover:bg-zinc-100 rounded text-black font-black"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PROMO CODE SECTION */}
                <div className="pt-3 border-t-2 border-dashed border-black space-y-2">
                  <label className="block text-xs font-black uppercase text-black">Promo Coupon Code</label>
                  
                  {appliedPromo ? (
                    <div className="p-3 bg-[#22C55E] border-2 border-black rounded-xl flex items-center justify-between text-black font-black text-xs shadow-[2px_2px_0_#000]">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 stroke-[2.5]" />
                        <span>{appliedPromo.code}: {appliedPromo.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-black hover:text-red-700 p-1 underline text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon (e.g. FEAST50)"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-white text-xs font-bold rounded-xl px-3 py-2.5 text-black uppercase neo-input"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyPromo()}
                          className="px-4 py-2.5 bg-[#FFE600] hover:bg-[#FFD500] text-black font-black text-xs uppercase rounded-xl border-2 border-black neo-btn"
                        >
                          Apply
                        </button>
                      </div>

                      {promoError && (
                        <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {promoError}
                        </p>
                      )}

                      {/* Quick Apply Suggestions */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.keys(PROMO_CODES).map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => handleApplyPromo(code)}
                            className="text-[10px] font-black uppercase bg-[#FAF6EF] hover:bg-[#FFE600] border border-black px-2 py-0.5 rounded-md transition"
                          >
                            + {code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* PRICE BREAKDOWN */}
                <div className="pt-3 border-t-2 border-black space-y-2 text-xs font-bold text-zinc-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-black font-black">${subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-[#22C55E]">
                      <span>Promo Discount ({appliedPromo?.code})</span>
                      <span className="font-black">- ${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="bg-[#22C55E] text-black px-2 py-0.5 rounded border border-black text-[10px] font-black">
                          FREE
                        </span>
                      ) : (
                        `$${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-zinc-600 bg-[#FAF6EF] p-2 rounded-lg border border-black">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 text-black" />
                      Estimated Arrival
                    </span>
                    <span className="font-black text-black">20 - 30 Mins</span>
                  </div>

                  <div className="flex justify-between items-center text-base font-black text-black pt-3 border-t-2 border-dashed border-black">
                    <span>Grand Total:</span>
                    <span className="text-xl text-[#FF5722] bg-[#FFE600] px-3 py-1 rounded-xl border-[2.5px] border-black neo-shadow-xs">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Submit Checkout Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-50 text-white font-black text-base uppercase rounded-xl border-[3px] border-black neo-shadow hover:shadow-[6px_6px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    'Processing Order...'
                  ) : (
                    <>
                      <span>Place Order & Pay (${finalTotal.toFixed(2)})</span>
                      <Sparkles className="w-5 h-5 fill-white" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
