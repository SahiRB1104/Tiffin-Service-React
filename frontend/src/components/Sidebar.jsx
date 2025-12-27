import React from "react";
import {
  User,
  MapPin,
  Package,
  Star,
  LogOut,
  Info,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      path: "/dashboard/profile",
      icon: <User size={20} />,
      label: "My Profile",
    },
    {
      path: "/dashboard/orders",
      icon: <Package size={20} />,
      label: "My Orders",
    },
    {
      path: "/dashboard/address",
      icon: <MapPin size={20} />,
      label: "Addresses",
    },
    {
      path: "/dashboard/review",
      icon: <Star size={20} />,
      label: "Reviews",
    },
    {
      path: "/about",
      icon: <Info size={20} />,
      label: "About Us",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col p-6">
      <div className="space-y-2 flex-grow">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-50 text-amber-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
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
