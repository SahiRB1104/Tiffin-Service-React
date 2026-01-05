import React, { useEffect, useMemo, useState, useRef } from "react";
import { api } from "../api/api";
import { FoodCard } from "../components/FoodCard";
import {
  Search,
  ArrowUpDown,
  UtensilsCrossed,
  RefreshCw,
  Check,
} from "lucide-react";

export const Menu = () => {
  /* ---------------- STATE ---------------- */
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const sortOptions = useMemo(
    () => [
      { value: "default", label: "Default" },
      { value: "low", label: "Price: Low → High" },
      { value: "high", label: "Price: High → Low" },
    ],
    []
  );

  /* ---------------- FETCH MENU ---------------- */
  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/menu/");
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

  /* ---------------- CLOSE SORT DROPDOWN ON OUTSIDE CLICK OR ESC ---------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setSortOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* ---------------- CATEGORIES ---------------- */
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(menu.map((item) => item.category))
    );
    return ["all", ...unique];
  }, [menu]);

  /* ---------------- FILTER + SORT ---------------- */
  const filteredMenu = useMemo(() => {
    let items = [...menu];

    // Category filter
    if (activeCategory !== "all") {
      items = items.filter(
        (item) => item.category === activeCategory
      );
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // Price sort
    if (sort === "low") {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      items.sort((a, b) => b.price - a.price);
    }

    return items;
  }, [menu, activeCategory, search, sort]);

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <h1 className="text-4xl font-serif flex items-center gap-3">
          <UtensilsCrossed className="text-amber-500" />
          Our Menu
        </h1>

        {/* SEARCH + SORT */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white w-full sm:w-64 focus:border-amber-500 outline-none"
            />
          </div>

          {/* SORT DROPDOWN */}
          <div
            ref={sortRef}
            className="relative"
            onMouseEnter={() => setSortOpen(true)}
            onMouseLeave={() => setSortOpen(false)}
          >
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              aria-expanded={sortOpen}
              className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 whitespace-nowrap"
            >
              <ArrowUpDown size={16} className="text-slate-400" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Sort By
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {sortOptions.find((o) => o.value === sort)?.label}
                </span>
              </div>
              <span
                className={`ml-auto text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  sortOpen
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                {sortOpen ? "Hide" : "Show"}
              </span>
            </button>

            {sortOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Choose priority
                  </p>
                  <p className="text-xs text-slate-600">
                    Reorder your list in one tap.
                  </p>
                </div>
                <div className="py-2">
                  {sortOptions.map((option) => {
                    const active = option.value === sort;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSort(option.value);
                          setSortOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                          active
                            ? "bg-amber-50 text-amber-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-xl grid place-items-center border flex-shrink-0 ${
                            active
                              ? "bg-white border-amber-200 text-amber-700"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          <ArrowUpDown size={16} />
                        </div>
                        <span className="text-sm font-semibold">
                          {option.label}
                        </span>
                        {active && (
                          <Check size={16} className="ml-auto text-amber-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STICKY CATEGORY TABS */}
      <div className="sticky top-16 z-40 bg-slate-50 py-4 mb-10">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? "bg-amber-500 text-white border-amber-500 shadow"
                  : "bg-white text-slate-600 border-slate-200 hover:text-amber-600"
              }`}
            >
              {cat === "all"
                ? "All"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* SKELETON */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-slate-100 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="text-center py-24 bg-white rounded-[2rem] border">
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchMenu}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && filteredMenu.length === 0 && (
        <div className="text-center py-24 text-slate-500 bg-slate-50 rounded-3xl border border-dashed">
          No matching items found.
        </div>
      )}

      {/* GRID */}
      {!loading && !error && filteredMenu.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredMenu.map((item, i) => (
            <FoodCard
              key={item._id ?? `${item.name}-${i}`}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
};
