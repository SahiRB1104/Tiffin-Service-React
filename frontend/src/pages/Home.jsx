import React, { useEffect, useState, useCallback } from "react";
import {
  Clock,
  ChevronRight,
  Utensils,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { FoodCard } from "../components/FoodCard";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/menu");
      const menuList = Array.isArray(data) ? data : data.menu || [];
      
      // Group items by category
      const categorized = {};
      menuList.forEach(item => {
        const category = item.category || 'other';
        if (!categorized[category]) {
          categorized[category] = [];
        }
        categorized[category].push(item);
      });
      
      // Pick 2 items from each category to get variety
      const featured = [];
      Object.values(categorized).forEach(categoryItems => {
        featured.push(...categoryItems.slice(0, 2));
      });
      
      setItems(featured.slice(0, 8));
    } catch (err) {
      console.error("Failed to fetch menu:", err);
      setError(err.message || "Unable to load menu at this time.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
    // Auto-refresh featured dishes every 5 minutes
    const interval = setInterval(() => {
      loadMenu();
    },  4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadMenu]);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mb-6">
              <Clock size={14} /> Freshly Cooked Every Day
            </div>

            <h1 className="text-5xl lg:text-7xl font-serif text-slate-900 mb-6 leading-[1.1]">
              Healthy Tiffin for{" "}
              <span className="text-amber-500">Busy Souls.</span>
            </h1>

            <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0">
              Experience the warmth of home-cooked meals delivered right to your
              doorstep.
            </p>

            <div className="flex gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/menu")}
                className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-2 transition-all hover:bg-amber-600 active:scale-95"
              >
                Order Now <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
              className="rounded-[2.5rem] shadow-2xl object-cover w-full h-[500px]"
              alt="Tiffin food"
            />

            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl hidden sm:flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <Utensils size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">100% Organic</p>
                <p className="text-sm text-slate-500">Locally sourced</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED DISHES */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-serif">Featured Dishes</h2>

            {error && (
              <button
                onClick={loadMenu}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-bold transition-colors"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                Retry
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-slate-100 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-slate-100 px-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={32} />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Connection Issue
              </h3>

              <p className="text-slate-500 max-w-md mb-8">{error}</p>

              <button
                onClick={loadMenu}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
              >
                <RefreshCw size={18} /> Try Again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-3xl text-slate-500">
              Check back soon for our daily specials!
            </div>
          ) : (
            <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-50">
              <div className="flex gap-8 min-w-min">
                {items.map((item, index) => (
                  <div key={item._id ?? `${item.name}-${index}`} className="flex-shrink-0 w-72">
                    <FoodCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
