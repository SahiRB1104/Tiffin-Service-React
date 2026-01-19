import React, { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

export const Toast = ({ message, itemName, quantity, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 p-4 min-w-[300px] max-w-[400px]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 mb-1">
              Added to Cart!
            </h4>
            <p className="text-sm text-slate-600">
              <span className="font-semibold">{itemName}</span>
              {quantity > 1 && (
                <span> (Qty: {quantity})</span>
              )}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
