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
import { useCart } from "./context/CartContext";
import { api } from "./api/api";
import { Utensils } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { cart, total, clearCart } = useCart();

  const isDashboard = location.pathname.startsWith("/dashboard");

  const handleCheckout = () => {
    if (!token) {
      setIsCartOpen(false);
      navigate("/login");
    } else {
      setIsCartOpen(false);
      navigate("/payment");
    }
  };

  const handleViewOrderDetails = (id) => {
    setSelectedOrderId(id);
    setIsOrderDetailsOpen(true);
  };

  const onPaymentComplete = async () => {
    const orderData = {
      items: cart.map(i => ({ 
        name: i.name, 
        price: i.price, 
        quantity: i.quantity, 
        image_url: i.image_url 
      })),
      total_amount: total
    };
    try {
      const res = await api.post('/payment/checkout', orderData);
      if (res.status === 'success' || res.message) {
        clearCart();
        navigate("/orders/success");
      }
    } catch (err) {
      console.error("Order failed:", err);
    }
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
            <Sidebar onOffersOpen={() => setIsOffersOpen(true)} />
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

      {/* MODALS */}
      <Offers isOpen={isOffersOpen} onClose={() => setIsOffersOpen(false)} />
      
      {isOrderDetailsOpen && selectedOrderId && (
        <OrderDetails 
          orderId={selectedOrderId} 
          isOpen={isOrderDetailsOpen}
          onClose={() => setIsOrderDetailsOpen(false)}
        />
      )}

      {/* FOOTER */}
      {!isDashboard && (
        <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm hidden md:block">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">SB</div>
              <span className="text-white font-bold">SB Tiffin</span>
            </div>
            <div className="flex gap-8">
              <button onClick={() => navigate('/about')} className="hover:text-amber-400 transition-colors">About Us</button>
              <button onClick={() => setIsOffersOpen(true)} className="hover:text-amber-400 transition-colors">Offers</button>
              <button onClick={() => navigate('/dashboard/review')} className="hover:text-amber-400 transition-colors">Feedback</button>
            </div>
            <p>© {new Date().getFullYear()} SB Tiffin Service.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
