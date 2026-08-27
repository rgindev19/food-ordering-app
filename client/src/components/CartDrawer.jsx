import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import axios from 'axios';

export default function CartDrawer() {
  const { cart, isCartOpen, toggleCart, updateQuantity, getTotals, clearCart } = useCartStore();
  const totals = typeof getTotals === 'function' ? getTotals() : {
    subtotal: cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    delivery: cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) > 35 || cart.length === 0 ? 0 : 3.99,
    total: cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) + (cart.length === 0 ? 0 : 3.99)
  };
  const { subtotal, delivery, total } = totals;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        items: cart.map((i) => ({
          foodItem: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        subtotal,
        deliveryFee: delivery,
        totalAmount: total,
        deliveryAddress: { street: '123 Market St', city: 'Metro Core' }
      };
      
      const response = await axios.post('http://localhost:5000/api/orders', payload);
      setOrderSuccess(response.data.order || { _id: 'ORD' + Date.now().toString().slice(-6) });
      clearCart();
    } catch (err) {
      alert('Order failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden backdrop-blur-xs bg-black/60 flex justify-end">
      <div className="w-full max-w-md bg-[#FFFDF5] border-l-[4px] border-black h-full flex flex-col p-6 shadow-[-8px_0px_0px_#000]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-[3px] border-black">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            <h2 className="text-xl font-black text-black neo-font-display tracking-tight uppercase">Your Order</h2>
          </div>
          <button 
            onClick={toggleCart} 
            className="p-1.5 bg-white hover:bg-zinc-100 border-2 border-black rounded-lg shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {orderSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 bg-white border-[3px] border-black rounded-2xl neo-shadow my-auto">
            <div className="w-16 h-16 bg-[#22C55E] text-black border-[3px] border-black rounded-2xl flex items-center justify-center neo-shadow">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h3 className="text-2xl font-black neo-font-display text-black">Order Confirmed!</h3>
            <p className="text-xs font-bold text-zinc-600">Order ID: #{orderSuccess._id ? orderSuccess._id.slice(-6).toUpperCase() : 'ORD778'}</p>
            <button
              onClick={() => { setOrderSuccess(null); toggleCart(); }}
              className="mt-4 px-6 py-3 bg-[#FFE600] text-black border-[2.5px] border-black rounded-xl font-black text-xs uppercase neo-btn"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-2">
                  <span className="text-4xl">🛍️</span>
                  <p className="text-sm font-bold text-black">Your bag is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-white p-3.5 rounded-xl border-[2.5px] border-black shadow-[2px_2px_0_#000]">
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className="text-sm font-black text-black truncate">{item.name}</h4>
                      <p className="text-xs font-bold text-[#FF5722] mt-0.5">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#FAF6EF] border-2 border-black p-1 rounded-xl">
                      <button onClick={() => updateQuantity(item._id, -1)} className="p-1 bg-white hover:bg-red-100 border border-black rounded-lg text-black">
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-600" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-xs font-black text-black w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="p-1 bg-white hover:bg-green-100 border border-black rounded-lg text-black">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t-[3px] border-black bg-white -mx-6 -mb-6 p-6 space-y-3 shadow-[0_-4px_0_#000]">
                <div className="space-y-1.5 text-xs font-bold text-zinc-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-black font-black">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-black font-black">{delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-black pt-2 border-t-2 border-dashed border-black">
                    <span>Total Amount</span>
                    <span className="text-[#FF5722] bg-[#FFE600] px-2 py-0.5 border-2 border-black rounded-lg shadow-[2px_2px_0_#000]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-50 text-white font-black text-base uppercase rounded-xl border-[3px] border-black neo-shadow hover:shadow-[6px_6px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition active:translate-x-0.5 active:translate-y-0.5"
                >
                  {isSubmitting ? 'Placing Order...' : (
                    <>
                      <span>Checkout Now</span>
                      <ArrowRight className="w-5 h-5 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}