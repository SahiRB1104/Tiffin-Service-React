import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Receipt,
  Truck,
} from "lucide-react";
import { api } from "../api/api";
import { useCart } from "../context/CartContext";
import { useParams, useNavigate } from "react-router-dom";

export const OrderDetails = () => {
  const { addToCart } = useCart();
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const getImageSrc = (item) => {
  if (!item.image_url) {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
  }

  // already normalized (new orders)
  if (item.image_url.startsWith("/static")) {
    return `http://localhost:8000${item.image_url}`;
  }

  // old orders (before backend assets move)
  if (item.image_url.startsWith("images/")) {
    return `http://localhost:8000/static/${item.image_url}`;
  }

  return item.image_url;
};


  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const data = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCancel = async () => {
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/orders/${orderId}/cancel`, { reason });
      const updated = await api.get(`/orders/${orderId}`);
      setOrder(updated);
      setShowCancel(false);
    } catch (err) {
      console.error("Cancellation failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (order?.items) {
      order.items.forEach((item) => addToCart(item));
      navigate("/menu"); // ✅ FIX
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 rounded mb-8"></div>
        <div className="h-48 bg-white rounded-3xl mb-6"></div>
        <div className="h-64 bg-white rounded-3xl"></div>
      </div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center">
        <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">
          Order Not Found
        </h2>
        <button
          onClick={() => navigate("/dashboard/orders")} // ✅ FIX
          className="mt-6 text-amber-500 font-bold flex items-center gap-2 mx-auto"
        >
          <ArrowLeft size={18} /> Back to My Orders
        </button>
      </div>
    );
  }

  const steps = ["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 pb-24">
      {/* HEADER */}
      <button
        onClick={() => navigate("/dashboard/orders")} // ✅ FIX
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-8 transition-colors"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Orders
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif text-slate-900">
            Order #{order.order_id}
          </h2>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <Clock size={14} />
            {new Date(order.created_at).toLocaleString(undefined, {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>

        {!isCancelled && (
          <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest border border-green-100 flex items-center gap-2">
            <CheckCircle2 size={14} />
            Current Status: {order.status.replace(/_/g, " ")}
          </div>
        )}
      </div>
  



      {/* STATUS TRACKER */}
      {!isCancelled && (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8 overflow-x-auto">
          <div className="flex justify-between items-center min-w-[500px] px-4 relative">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-8 h-1 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-1000"
              style={{
                width: `${
                  (currentStepIndex /
                    (steps.length - 1)) *
                  (100 - 100 / steps.length)
                }%`,
              }}
            ></div>

            {steps.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step}
                  className="relative z-10 flex flex-col items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                        : "bg-white text-slate-300 border-2 border-slate-100"
                    } ${
                      isCurrent
                        ? "ring-4 ring-amber-100 animate-pulse"
                        : ""
                    }`}
                  >
                    {idx === 0 && <Package size={18} />}
                    {idx === 1 && <Clock size={18} />}
                    {idx === 2 && <Truck size={18} />}
                    {idx === 3 && <CheckCircle2 size={18} />}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                      isActive
                        ? "text-amber-600"
                        : "text-slate-400"
                    }`}
                  >
                    {step.replace(/_/g, " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 mb-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
            <XCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">
              Order Cancelled
            </h3>
            <p className="text-red-600 mt-1">
              {order.cancel_reason ||
                "This order was cancelled."}
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 bg-white text-red-600 px-4 py-2 rounded-xl text-sm font-bold border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <RefreshCcw size={16} /> Reorder These Items
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Package size={18} className="text-amber-500" /> Items Ordered
            </h3>
            <div className="divide-y divide-slate-50">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="py-4 flex items-center gap-4 first:pt-0 last:pb-0"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={getImageSrc(item)}
                    className="w-full h-full object-cover"
                    alt={item.name}
                  />

                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">
                      {item.name}
                    </h4>
                    <p className="text-sm text-slate-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-slate-900">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CANCEL */}
          {order.status === "PLACED" && !showCancel && (
            <button
              onClick={() => setShowCancel(true)}
              className="w-full py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl border border-dashed border-red-200 transition-all"
            >
              Need to cancel this order?
            </button>
          )}

          {showCancel && (
            <div className="bg-white p-6 rounded-[2rem] border-2 border-red-100 shadow-xl shadow-red-50">
              <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                <AlertCircle size={18} /> Cancel Order
              </h3>
              <textarea
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4"
                placeholder="Reason for cancellation..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex gap-4">
                <button
                  disabled={submitting}
                  onClick={handleCancel}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold"
                >
                  {submitting
                    ? "Processing..."
                    : "Confirm Cancellation"}
                </button>
                <button
                  onClick={() => setShowCancel(false)}
                  className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BILL */}
        <div className="h-fit sticky top-24">
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Receipt size={20} className="text-amber-500" /> Bill Summary
            </h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{order.total_amount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery</span>
                <span className="text-green-400 font-bold">
                  FREE
                </span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="font-bold text-xl">Total</span>
                <span className="text-2xl font-bold text-amber-500">
                  ₹{order.total_amount}
                </span>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                Payment Method
              </p>
              <p className="text-sm font-medium">
                {order.payment_method || "Paid via Card"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
