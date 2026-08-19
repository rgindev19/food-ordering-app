import React from 'react';
import { ShoppingBag, Flame, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function Navbar() {
  const { cart, toggleCart } = useCartStore();
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              CRAVE<span className="text-orange-500">STUDIO</span>
            </span>
            <span className="text-xs text-zinc-400 block -mt-1 font-medium">Artisanal Fast-Casual</span>
          </div>
        </div>

        <button
          onClick={toggleCart}
          className="relative flex items-center gap-3 px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-700/60 hover:border-orange-500/50 hover:bg-zinc-800 transition duration-200"
        >
          <ShoppingBag className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-semibold text-zinc-200">Bag</span>
          {totalCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full">
              {totalCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}