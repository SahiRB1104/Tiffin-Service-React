import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/api";
import { FoodCard } from "../components/FoodCard";
import { UtensilsCrossed, RefreshCw } from "lucide-react";

export const Menu = () => {
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- FETCH MENU ---------------- */
  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/menu");
      const list = Array.isArray(data) ? data : data.menu || [];
      setMenu(list);
    } catch (err) {
      setError(err.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  /* ---------------- CATEGORIES ---------------- */
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(menu.map((item) => item.category))
    );
    return ["all", ...cats];
  }, [menu]);

  /* ---------------- FILTERED ITEMS ---------------- */
  const filteredMenu = useMemo(() => {
    if (activeCategory === "all") return menu;
    return menu.filter((item) => item.category === activeCategory);
  }, [menu, activeCategory]);

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-7xl mx-auto py-16 px-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <h1 className="text-4xl font-serif text-slate-900 flex items-center gap-3">
          <UtensilsCrossed className="text-amber-500" />
          Our Menu
        </h1>

        {/* CATEGORY TABS */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                activeCategory === cat
                  ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              {cat === "all"
                ? "All"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-80 bg-slate-100 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-200 text-center">
          <p className="text-slate-600 font-medium mb-6">
            {error}
          </p>
          <button
            onClick={fetchMenu}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredMenu.length === 0 && (
        <div className="text-center py-24 bg-slate-50 rounded-[2rem] border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">
            No items available in this category.
          </p>
        </div>
      )}

      {/* MENU GRID */}
      {!loading && !error && filteredMenu.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredMenu.map((item, index) => (
            <FoodCard
              key={item._id ?? `${item.name}-${index}`}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
};
