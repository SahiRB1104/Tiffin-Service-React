import React from "react";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export const CartSidebar = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateQty, total } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="text-amber-500" /> Your Cart
            </h2>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <p className="text-slate-500">Your cart is empty.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div
                    key={item._id ?? `${item.name}-${index}`}
                    className="flex gap-4 items-start"
                  >
                  <img
                    src={
                      item.image_url
                        ? item.image_url.startsWith("/static")
                          ? `http://localhost:8000${item.image_url}`
                          : `http://localhost:8000/static/${item.image_url}`
                        : "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
                    }
                    className="w-20 h-20 rounded-xl object-cover"
                    alt={item.name}
                  />


                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">
                        {item.name}
                      </h4>

                      <p className="text-sm text-amber-600 font-bold mb-2">
                        ₹{item.price}
                      </p>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQty(item.__cartKey, -1)}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="font-bold text-sm">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQty(item.__cartKey, 1)}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => updateQty(item.__cartKey, -item.quantity)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span className="text-amber-500">₹{total}</span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold hover:bg-amber-600 shadow-xl shadow-amber-200"
              >
                Checkout Now
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
