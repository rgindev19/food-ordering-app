import React from 'react';
import { Plus, Star, Clock } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function FoodCard({ food }) {
  const { addToCart } = useCartStore();

  return (
    <div className="group relative bg-white border-[3px] border-black rounded-2xl overflow-hidden neo-card flex flex-col justify-between">
      <div className="relative aspect-4/3 overflow-hidden bg-zinc-100 border-b-[3px] border-black">
        <img
          src={food.imageUrl || food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {food.rating && (
          <div className="absolute top-3 right-3 bg-[#FFE600] border-2 border-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-[2px_2px_0_#000]">
            <Star className="w-3.5 h-3.5 text-black fill-black" />
            <span className="text-xs font-black text-black">{food.rating}</span>
          </div>
        )}
        {food.category && (
          <div className="absolute top-3 left-3 bg-white border-2 border-black px-2.5 py-0.5 rounded-lg shadow-[2px_2px_0_#000]">
            <span className="text-[10px] font-black uppercase text-black">{food.category}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {food.prepTime && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 mb-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{food.prepTime}</span>
            </div>
          )}
          <h3 className="text-lg font-black text-black neo-font-display tracking-tight leading-snug">{food.name}</h3>
          {food.description && (
            <p className="text-xs font-semibold text-zinc-600 line-clamp-2 mt-1 leading-relaxed">{food.description}</p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t-2 border-zinc-200">
          <div className="bg-[#FFE600] border-2 border-black px-2.5 py-1 rounded-lg shadow-[2px_2px_0_#000]">
            <span className="text-lg font-black text-black">${food.price?.toFixed(2)}</span>
          </div>
          <button
            onClick={() => addToCart(food)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-black uppercase rounded-xl neo-btn"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}