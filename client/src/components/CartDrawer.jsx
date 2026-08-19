import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import axios from 'axios';

export default function CartDrawer() {
  const { cart, isCartOpen, toggleCart, updateQuantity, getTotal, clearCart } = useCartStore();
  const { subtotal, deliveryFee, total } = getTotal();
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
        deliveryFee,
        totalAmount: total,
        deliveryAddress: { street: '123 Market St', city: 'Metro Core' }
      };
      
      const response = await axios.post('http://localhost:5000/api/orders', payload);
      setOrderSuccess(response.data.order);
      clearCart();
    } catch (err) {
      alert('Order failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden backdrop-blur-sm bg-zinc-950/60 flex justify-end">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white tracking-tight">Your Order</h2>
          <button onClick={toggleCart} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">Order Confirmed!</h3>
            <p className="text-sm text-zinc-400">Order ID: #{orderSuccess._id.slice(-6)}</p>
            <button
              onClick={() => { setOrderSuccess(null); toggleCart(); }}
              className="mt-4 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                  Your bag is empty.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/80">
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                      <p className="text-xs text-zinc-400">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item._id, -1)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg">
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <div className="space-y-1.5 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-zinc-200">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-zinc-200">{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800/60">
                    <span>Total</span>
                    <span className="text-orange-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  {isSubmitting ? 'Placing Order...' : 'Checkout Now'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}