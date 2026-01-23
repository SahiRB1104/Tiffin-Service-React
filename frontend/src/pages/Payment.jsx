import React, { useState, useEffect } from "react";
import { CreditCard, Wallet, Landmark, AlertCircle, CheckCircle, Banknote, MapPin, ChevronRight, Tag, Copy, X, Gift, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

export const Payment = () => {
  const { total, cart, clearCart, appliedCoupon, discount, finalTotal, applyCoupon, removeCoupon } = useCart();
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [offers, setOffers] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [offersExpanded, setOffersExpanded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [addressData, offersData] = await Promise.all([
          api.get("/addresses/default"),
          api.get("/coupons/list"),
        ]);
        setDefaultAddress(addressData);
        setOffers(offersData.coupons || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const response = await api.post("/coupons/validate", {
        coupon_code: couponCode.trim(),
        order_amount: total,
      });

      applyCoupon(response);
      setCouponSuccess(`Coupon applied! You saved ₹${response.discount_amount}`);
      setCouponCode("");
    } catch (err) {
      setCouponError(err.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess("");
    setCouponError("");
  };

  const copyCoupon = (code) => {
    setCouponCode(code);
    navigator.clipboard.writeText(code);
  };

  const handlePayment = async () => {
    if (cart.length === 0) return;

    setError("");

    if (!defaultAddress) {
      setError("Delivery address is required to place the order.");
      setShowAddressModal(true);
      return;
    }

    setLoading(true);

    try {
      await api.post("/payment/checkout", {
        items: cart,
        total_amount: total,
        discount_amount: discount,
        final_amount: finalTotal,
        coupon_code: appliedCoupon,
        payment_method: method,
        delivery_address: defaultAddress,  // ✅ Send delivery address
        payment_status: "SUCCESS", // 🔑 simulate payment gateway
      });

      clearCart();
      navigate("/orders/success", { replace: true });
    } catch (err) {
      setError(err.message || "Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeAddressModal = () => setShowAddressModal(false);

  const goToAddressPage = () => {
    closeAddressModal();
    navigate("/dashboard/address");
  };

  return (
    <div className="max-w-7.5xl mx-auto py-5 px-5 min-h-screen">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* LEFT COLUMN: Deliver to + Payment Methods */}
        <div className="order-2 lg:order-1">
          {/* DELIVERY ADDRESS SECTION */}
          <section className="mb-5">
            <div className="flex justify-between items-end mb-3.5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Deliver to</h2>
              <button 
                onClick={() => navigate("/dashboard/address")}
                className="text-amber-500 font-bold text-base hover:underline flex items-center gap-1.5"
              >
                Change <ChevronRight size={16} className="md:w-4 md:h-4" />
              </button>
            </div>
            
            {loading ? (
              <div className="h-24 bg-slate-100 animate-pulse rounded-xl"></div>
            ) : defaultAddress ? (
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 group transition-all hover:border-amber-100">
                <div className="w-14 h-14 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
                  <MapPin size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded shrink-0">DEFAULT</span>
                    <h3 className="font-bold text-slate-900 text-lg truncate">{defaultAddress.label}</h3>
                  </div>
                  <p className="text-base text-slate-600 leading-snug font-medium">
                    {defaultAddress.addressLine}<br />
                    {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex items-center gap-3 text-amber-800">
                <AlertCircle size={20} />
                <p className="font-bold text-base">No delivery address found. Please add one in your profile.</p>
              </div>
            )}
          </section>

          {/* PAYMENT METHODS SECTION */}
          <h2 className="text-2xl font-serif mb-3.5 text-slate-900">Payment Methods</h2>
          <div className="space-y-3">
            {[
              { id: "card", label: "Credit / Debit Card", icon: <CreditCard /> },
              { id: "upi", label: "UPI / Google Pay", icon: <Wallet /> },
              { id: "net", label: "Net Banking", icon: <Landmark /> },
              { id: "cod", label: "Cash on Delivery", icon: <Banknote size={20} /> },
            ].map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  method === m.id
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="pay"
                  className="hidden"
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                />
                <div
                  className={`p-2.5 rounded-md shrink-0 ${
                    method === m.id
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {React.cloneElement(m.icon, { size: 20 })}
                </div>
                <span className="font-bold text-base text-slate-700">{m.label}</span>
                {method === m.id && (
                  <CheckCircle className="ml-auto text-amber-500 shrink-0" size={18} />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Offers + Order Summary (shown at top on mobile) */}
        <div className="order-1 lg:order-2 space-y-5">
          {/* OFFERS AND COUPON SECTION */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100">
            {/* COLLAPSIBLE OFFERS HEADER */}
            <button
              onClick={() => setOffersExpanded(!offersExpanded)}
              className="w-full flex items-center justify-between p-4 mb-3.5 bg-white rounded-xl border border-amber-200 hover:bg-amber-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <Gift className="text-amber-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    Available Offers
                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                      {offers.length}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500">Click to view</p>
                </div>
              </div>
              <div className="shrink-0">
                {offersExpanded ? (
                  <ChevronUp className="text-amber-600" size={20} />
                ) : (
                  <ChevronDown className="text-amber-600" size={20} />
                )}
              </div>
            </button>
            
            {/* COLLAPSIBLE OFFERS DRAWER */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                offersExpanded ? "max-h-[400px] opacity-100 mb-4" : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-3 overflow-y-auto max-h-[330px] pr-3 custom-scrollbar">
                {offers.map((offer) => (
                  <div
                    key={offer.name}
                    className="bg-white p-3 rounded-lg border border-amber-200 flex justify-between items-center hover:shadow-md transition-all gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono font-bold text-amber-600 text-[12px] bg-amber-100 px-2.5 py-0.5 rounded">
                          {offer.name}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[12px] line-clamp-1">{offer.description}</p>
                    </div>
                    <button
                      onClick={() => copyCoupon(offer.name)}
                      className="px-3 py-1.5 bg-amber-500 text-white rounded-md font-semibold hover:bg-amber-600 transition-all flex items-center gap-1.5 text-[11px] shrink-0"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* COUPON INPUT */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Coupon
              </label>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-2.5 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-green-100 rounded-md flex items-center justify-center shrink-0">
                      <CheckCircle className="text-green-600" size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-green-800 text-sm">{appliedCoupon} Applied!</p>
                      <p className="text-[11px] text-green-600">Saved ₹{discount.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500 font-mono font-bold text-sm"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-3 py-1.5 bg-amber-500 text-white rounded-md font-bold hover:bg-amber-600 transition-all disabled:opacity-50 text-sm shrink-0"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  
                  {couponError && (
                    <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {couponError}
                    </div>
                  )}
                  
                  {couponSuccess && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} />
                      {couponSuccess}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ORDER SUMMARY SECTION */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Order Summary</h3>
            <div className="space-y-3.5 mb-5">
              <div className="flex justify-between text-base text-slate-600">
                <span>Item Total</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-base text-slate-600">
                <span>Delivery</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-semibold border-t border-slate-100 pt-2.5 text-base">
                  <div className="flex items-center gap-2">
                    <Tag size={16} />
                    <span>Discount</span>
                  </div>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-slate-100 pt-2.5 flex justify-between text-2xl font-black text-slate-900">
                <span>Total</span>
                <span className="text-amber-500">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-slate-800 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Pay & Place Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Address required modal */}
      {showAddressModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={closeAddressModal}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 fade-in duration-300">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin size={32} className="text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 text-center">Delivery address required</h2>
              </div>

              <div className="px-8 py-6 border-b border-slate-100">
                <p className="text-slate-600 text-center leading-relaxed font-medium">
                  Please add or select a default delivery address before placing your order.
                </p>
              </div>

              <div className="px-8 py-6 flex gap-4">
                <button
                  onClick={closeAddressModal}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-900 font-bold hover:bg-slate-50 transition-all"
                >
                  Maybe later
                </button>
                <button
                  onClick={goToAddressPage}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-200 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Add address
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.7);
        }
      `}</style>
    </div>
  );
};
