import React from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl text-center max-w-md w-full">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />

        <h2 className="text-3xl font-bold mb-3">
          Order Placed Successfully!
        </h2>

        <p className="text-slate-500 mb-8">
          Your delicious tiffin is on the way 🍱
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/dashboard/orders")}
            className="bg-amber-500 text-white py-3 rounded-xl font-bold"
          >
            View My Orders
          </button>

          <button
            onClick={() => navigate("/menu")}
            className="border border-slate-200 py-3 rounded-xl font-bold text-slate-700"
          >
            Order More
          </button>
        </div>
      </div>
    </div>
  );
};
