import React, { useState, useEffect } from "react";

/* ---------- COMPONENTS ---------- */
import { Header } from "./components/Header";
import { CartSidebar } from "./components/CartSidebar";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";

/* ---------- PAGES ---------- */
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

/* ---------- CONTEXT ---------- */
import { useAuth } from "./auth/AuthContext";
import { useCart } from "./context/CartContext";
import { api } from "./api/api";

const App = () => {
  const [currentView, setCurrentView] = useState("home");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { isAuthenticated, loading } = useAuth();
  const { cart, total, clearCart } = useCart();

  const protectedViews = ["profile", "orders", "address", "review", "payment"];
  const isDashboard = ["profile", "address", "review"].includes(currentView);

  useEffect(() => {
    if (!loading && !isAuthenticated && protectedViews.includes(currentView)) {
      setCurrentView("login");
    }
  }, [isAuthenticated, loading, currentView]);

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!isAuthenticated) {
      setCurrentView("login");
    } else {
      setCurrentView("payment");
    }
  };

  const onPaymentComplete = async () => {
    if (!isAuthenticated || cart.length === 0) return;

    const orderData = {
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total_amount: total,
    };

    try {
      await api.post("/payment/checkout", orderData);
      clearCart();
      setCurrentView("orders");
    } catch {
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onViewChange={setCurrentView}
        currentView={currentView}
      />

      <div
        className={`flex-grow flex flex-col md:flex-row ${
          isDashboard ? "pt-16" : ""
        }`}
      >
        {isDashboard && (
          <div className="hidden md:block sticky top-16 h-[calc(100vh-64px)]">
            <Sidebar
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
        )}

        <main
          className={`flex-grow ${
            !isDashboard ? "pt-16 pb-20 md:pb-0" : "pb-20 md:pb-0"
          }`}
        >
          {currentView === "home" && (
            <Home onExplore={() => setCurrentView("menu")} />
          )}
          
          {currentView === "menu" && <Menu />}
          {currentView === "login" && (
            <div className="flex items-center justify-center min-h-[calc(100vh-128px)] px-4">
              <Login
                onSuccess={() => setCurrentView("home")}
                onToggle={() => setCurrentView("signup")}
              />
            </div>
          )}
          {currentView === "signup" && (
            <div className="flex items-center justify-center min-h-[calc(100vh-128px)] px-4">
              <Signup
                onSuccess={() => setCurrentView("home")}
                onToggle={() => setCurrentView("login")}
              />
            </div>
          )}
          {currentView === "about" && <About />}
          {currentView === "offers" && <Offers />}
          {currentView === "payment" && (
            <Payment onComplete={onPaymentComplete} />
          )}
          {currentView === "profile" && <Profile />}
          {currentView === "address" && <Address />}
          {currentView === "review" && <Review />}
          {currentView === "orders" && <Orders />}
        </main>
      </div>

      <MobileNav
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default App;
