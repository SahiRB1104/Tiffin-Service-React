import React, { useState } from "react";
import { CreditCard, Wallet, Landmark, AlertCircle, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

export const Payment = () => {
  const { total, cart, clearCart } = useCart();
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handlePayment = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/payment/checkout", {
        items: cart,
        total_amount: total,
        payment_method: method,
        payment_status: "SUCCESS", // 🔑 simulate payment gateway
      });

      clearCart();
      navigate("/orders/success", { replace: true });
    } catch (err) {
      setError(err.message || "Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-serif mb-8 text-slate-900">Payment Methods</h2>
          <div className="space-y-4">
            {[
              { id: "card", label: "Credit / Debit Card", icon: <CreditCard /> },
              { id: "upi", label: "UPI / Google Pay", icon: <Wallet /> },
              { id: "net", label: "Net Banking", icon: <Landmark /> },
            ].map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  method === m.id
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="pay"
                  className="hidden"
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                />
                <div
                  className={`p-2 rounded-lg ${
                    method === m.id
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {m.icon}
                </div>
                <span className="font-bold text-slate-700">{m.label}</span>
                {method === m.id && (
                  <CheckCircle className="ml-auto text-amber-500" size={20} />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl h-fit">
          <h3 className="text-xl font-bold mb-6 text-slate-800">Order Summary</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-slate-500">
              <span>Item Total</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-between text-xl font-bold text-slate-900">
              <span>Total Pay</span>
              <span className="text-amber-500">₹{total}</span>
            </div>
          </div>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Pay & Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};
