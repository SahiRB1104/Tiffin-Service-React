import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

/* COMPONENTS */
import { Header } from "./components/Header";
import { CartSidebar } from "./components/CartSidebar";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";

/* PAGES */
import { Home } from "./pages/Home";
import { Menu } from "./pages/Menu";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { About } from "./pages/About";
import { Address } from "./pages/Address";
import { Offers } from "./pages/Offers";
import { Payment } from "./pages/Payment";
import { Profile } from "./pages/Profile";
import { Review } from "./pages/Review";
import { Orders } from "./pages/Orders";
import { OrderSuccess } from "./pages/OrderSuccess";
import { OrderDetails } from "./pages/OrderDetails";


/* AUTH */
import { useAuth } from "./auth/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname.startsWith("/dashboard");

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/payment");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="hidden md:block">
        <Header onOpenCart={() => setIsCartOpen(true)} />
      </div>

      <div className="md:hidden">
        <MobileNav onOpenCart={() => setIsCartOpen(true)} />
      </div>

      <div className="flex-grow flex pt-16">
        {isDashboard && (
          <div className="hidden md:block sticky top-16 h-[calc(100vh-64px)]">
            <Sidebar />
          </div>
        )}

        <main className="flex-grow pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
            <Route path="/offers" element={<Offers />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/dashboard/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/orders"
              element={<ProtectedRoute><Orders /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/address"
              element={<ProtectedRoute><Address /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/review"
              element={<ProtectedRoute><Review /></ProtectedRoute>}
            />

            <Route
              path="/payment"
              element={<ProtectedRoute><Payment /></ProtectedRoute>}
            />

            <Route
              path="/orders/success"
              element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>}
            />
            
            <Route
              path="/dashboard/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default App;
