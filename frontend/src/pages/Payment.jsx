import React, { useState } from "react";
import { CreditCard, Wallet, Landmark, AlertCircle } from "lucide-react";
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
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-3xl font-bold mb-6">Payment</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="space-y-4 mb-8">
        {[
          { id: "card", label: "Card", icon: <CreditCard /> },
          { id: "upi", label: "UPI", icon: <Wallet /> },
          { id: "net", label: "Net Banking", icon: <Landmark /> },
        ].map((m) => (
          <label
            key={m.id}
            className={`flex gap-4 p-4 border rounded-xl cursor-pointer ${
              method === m.id ? "border-amber-500 bg-amber-50" : ""
            }`}
          >
            <input
              type="radio"
              checked={method === m.id}
              onChange={() => setMethod(m.id)}
              hidden
            />
            {m.icon}
            {m.label}
          </label>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="flex justify-between font-bold text-lg mb-4">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? "Processing..." : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
};
