import React, { useState } from "react";
import { CreditCard, Wallet, Landmark } from "lucide-react";
import { useCart } from "../context/CartContext";

export const Payment = ({ onComplete }) => {
  const { total } = useCart();
  const [method, setMethod] = useState("card");

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-3xl font-bold mb-6">Payment</h2>

      <div className="space-y-4 mb-8">
        {[
          { id: "card", label: "Card", icon: <CreditCard /> },
          { id: "upi", label: "UPI", icon: <Wallet /> },
          { id: "net", label: "Net Banking", icon: <Landmark /> },
        ].map((m) => (
          <label
            key={m.id}
            className={`flex gap-4 p-4 border rounded-xl cursor-pointer ${
              method === m.id
                ? "border-amber-500 bg-amber-50"
                : ""
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
          onClick={onComplete}
          className="w-full bg-slate-900 text-white py-3 rounded-xl"
        >
          Pay & Place Order
        </button>
      </div>
    </div>
  );
};
