import React from 'react';
import { ShoppingBag, Flame } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function Navbar() {
  const { cart, toggleCart } = useCartStore();
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EF]/95 backdrop-blur border-b-[3px] border-black shadow-[0_4px_0_#000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FFE600] border-2 border-black rounded-xl shadow-[2px_2px_0_#000] rotate-[-2deg]">
            <Flame className="w-6 h-6 text-black" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-black flex items-center gap-1.5 neo-font-display">
              SAVOR<span className="bg-[#FF5722] text-white px-2 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] text-lg">MERN</span>
            </span>
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider block -mt-1">Artisanal Fast-Casual</span>
          </div>
        </div>

        <button
          onClick={toggleCart}
          className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#FFE600] hover:bg-[#FFD500] text-black font-black text-sm border-[2.5px] border-black neo-btn"
        >
          <ShoppingBag className="w-5 h-5 text-black stroke-[2.5]" />
          <span className="font-black neo-font-display">Bag</span>
          {totalCount > 0 && (
            <span className="flex items-center justify-center px-2 py-0.5 bg-[#FF5722] text-white text-xs font-black rounded-full border-2 border-black shadow-[1px_1px_0_#000]">
              {totalCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}