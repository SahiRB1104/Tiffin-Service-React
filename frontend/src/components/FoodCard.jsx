import React from "react";
import { Plus } from "lucide-react";
import { useCart } from "../context/CartContext";

export const FoodCard = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <div className="group bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 transition-all hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
      <img
        src={`http://localhost:8000${item.image_url}`}
        className="w-full h-full object-cover"
        alt={item.name}
      />



        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
          {item.category}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-800">
            {item.name}
          </h3>
          <span className="text-amber-600 font-bold">
            ₹{item.price}
          </span>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 mb-6">
          {item.description}
        </p>

        <button
          onClick={() => addToCart(item)}
          className="w-full bg-white text-slate-800 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add to Cart
        </button>
      </div>
    </div>
  );
};
