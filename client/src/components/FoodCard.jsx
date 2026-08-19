import React from 'react';
import { Plus, Star, Clock } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function FoodCard({ food }) {
  const { addToCart } = useCartStore();

  return (
    <div className="group relative bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition duration-300 flex flex-col justify-between">
      <div className="relative aspect-4/3 overflow-hidden bg-zinc-950">
        <img
          src={food.imageUrl}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-800 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-zinc-200">{food.rating}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-orange-400 mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{food.prepTime}</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">{food.name}</h3>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">{food.description}</p>
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-800/60">
          <span className="text-xl font-black text-white">${food.price.toFixed(2)}</span>
          <button
            onClick={() => addToCart(food)}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-xl transition duration-150 shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}