import React, { useState, useEffect, useMemo } from "react";
import { ArrowUpDown, Package } from "lucide-react";
import { api } from "../api/api";

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get("/orders");
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

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );
        case "highest":
          return b.total_amount - a.total_amount;
        case "lowest":
          return a.total_amount - b.total_amount;
        default:
          return 0;
      }
    });
  }, [orders, sortBy]);

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
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <ArrowUpDown size={16} className="text-slate-400" />
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-semibold text-slate-700 bg-transparent outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
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
          {sortedOrders.map((o, index) => {
            const orderId =
              o._id ?? o.id ?? `ORDER-${index}`;

            return (
              <div
                key={orderId}
                className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm transition-all hover:shadow-md hover:border-amber-100"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    Order #{orderId.toString().slice(-6).toUpperCase()}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">
                    {new Date(o.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-amber-600 font-bold block text-lg">
                    ₹{o.total_amount}
                  </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded inline-block mt-1 ${
                        o.status === "PLACED"
                          ? "bg-blue-50 text-blue-600"
                          : o.status === "PREPARING"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {o.status}
                    </span>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
