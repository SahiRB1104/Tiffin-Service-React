import React from "react";
import { User, MapPin, Package, Star, LogOut, Info } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const Sidebar = ({ currentView, onViewChange }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: "profile", icon: <User size={20} />, label: "My Profile" },
    { id: "orders", icon: <Package size={20} />, label: "My Orders" },
    { id: "address", icon: <MapPin size={20} />, label: "Addresses" },
    { id: "review", icon: <Star size={20} />, label: "Reviews" },
    { id: "about", icon: <Info size={20} />, label: "About Us" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col p-6">
      <div className="space-y-2 flex-grow">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              currentView === item.id
                ? "bg-amber-50 text-amber-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
};
