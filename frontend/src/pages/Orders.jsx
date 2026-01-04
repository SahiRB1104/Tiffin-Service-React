import React, { useState, useEffect, useMemo, useRef } from "react";
import { ArrowUpDown, Package, Check } from "lucide-react";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const RECENT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window to flag recent orders

  const navigate = useNavigate();
  const sortRef = useRef(null);

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: "Newest First" },
      { value: "oldest", label: "Oldest First" },
      { value: "highest", label: "Highest Amount" },
      { value: "lowest", label: "Lowest Amount" },
    ],
    []
  );

  /* ----------------------------------------
     Fetch orders from backend
     ---------------------------------------- */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get("/orders/");
        const list = Array.isArray(data) ? data : data.orders || [];
        setOrders(list);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  /* ----------------------------------------
     Assign order numbers (oldest = #1)
     ---------------------------------------- */
  const ordersWithNumbers = useMemo(() => {
    const now = Date.now();
    const sorted = [...orders].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return sorted.map((order, index) => ({
      ...order,
      orderNumber: index + 1,
      isRecent:
        now - new Date((order.created_at || "") + "Z").getTime() <=
        RECENT_WINDOW_MS,
    }));
  }, [orders]);

  /* ----------------------------------------
     Sorting logic
     ---------------------------------------- */
  const sortedOrders = useMemo(() => {
    const list = [...ordersWithNumbers];

    switch (sortBy) {
      case "newest":
        return list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
      case "oldest":
        return list.sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );
      case "highest":
        return list.sort(
          (a, b) => b.total_amount - a.total_amount
        );
      case "lowest":
        return list.sort(
          (a, b) => a.total_amount - b.total_amount
        );
      default:
        return list;
    }
  }, [ordersWithNumbers, sortBy]);

  /* ----------------------------------------
     Close sort drawer on outside click or ESC
     ---------------------------------------- */
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

  /* ----------------------------------------
     Loading skeleton (unchanged)
     ---------------------------------------- */
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-serif text-slate-900 flex items-center gap-3">
          <Package className="text-amber-500" /> My Orders
        </h2>

        {orders.length > 0 && (
          <div
            ref={sortRef}
            className="relative md:self-end"
            onMouseEnter={() => setSortOpen(true)}
            onMouseLeave={() => setSortOpen(false)}
          >
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              aria-expanded={sortOpen}
              className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <ArrowUpDown size={16} className="text-slate-400" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Sort By
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {sortOptions.find((o) => o.value === sortBy)?.label}
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
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-10">
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
                    const active = option.value === sortBy;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setSortOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                          active
                            ? "bg-amber-50 text-amber-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-xl grid place-items-center border ${
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
                          <Check size={16} className="ml-auto text-amber-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center p-20 bg-white rounded-[2rem] border border-dashed border-slate-300 shadow-inner">
          <Package size={32} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">
            No orders found yet. Time to place your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((o) => {
            /* 🛡 SAFETY: prevent /orders/undefined */
            if (!o.order_id) return null;

            return (
              <div
                key={o.order_id}
                onClick={() =>
                  navigate(`/dashboard/orders/${o.order_id}`)
                }
                className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm transition-all hover:shadow-md hover:border-amber-100 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800 leading-none">
                      Order No. {o.orderNumber}
                    </p>
                    {o.isRecent && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-200">
                        Recent
                      </span>
                    )}
                    
                  </div>

                  <p className="text-sm text-slate-500 font-medium">
                    {new Date(o.created_at + "Z").toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-amber-600 font-bold block text-lg">
                    ₹{o.total_amount}
                  </span>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded inline-block ${
                        o.status === "PLACED"
                          ? "bg-blue-50 text-blue-600"
                          : o.status === "PREPARING"
                          ? "bg-yellow-50 text-yellow-700"
                          : o.status === "CANCELLED"
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
