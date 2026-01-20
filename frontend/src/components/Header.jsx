import React from "react";
import { ShoppingBag, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../context/CartContext";

export const Header = ({ onOpenCart }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { isAuthenticated, logout, user } = useAuth();
  const { cart, clearCart } = useCart();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = async () => {
    clearCart();
    await logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-200">
            SB
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">
            Tiffin Service
          </span>
        </div>

        {/* NAV LINKS (DESKTOP) */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => navigate("/")}
            className={`text-sm font-medium ${
              pathname === "/"
                ? "text-amber-600"
                : "text-slate-600 hover:text-amber-500"
            }`}
          >
            Home
          </button>

          <button
            onClick={() => navigate("/menu")}
            className={`text-sm font-medium ${
              pathname === "/menu"
                ? "text-amber-600"
                : "text-slate-600 hover:text-amber-500"
            }`}
          >
            Our Menu
          </button>

          {isAuthenticated && (
            <button
              onClick={() => navigate("/dashboard/orders")}
              className={`text-sm font-medium ${
                pathname.startsWith("/dashboard/orders")
                  ? "text-amber-600"
                  : "text-slate-600 hover:text-amber-500"
              }`}
            >
              My Orders
            </button>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          {/* CART */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-600 hover:text-amber-600 transition-colors"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* AUTH */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
              <span className="text-sm font-medium text-slate-700 hidden lg:block">
                Hi, {user?.email?.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
