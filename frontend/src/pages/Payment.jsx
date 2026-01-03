import React, { useState, useEffect } from "react";
import { CreditCard, Wallet, Landmark, AlertCircle, CheckCircle, Banknote, MapPin, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

export const Payment = () => {
  const { total, cart, clearCart } = useCart();
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        const data = await api.get("/addresses/default");
        setDefaultAddress(data);
      } catch (err) {
        console.error("Failed to fetch address:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultAddress();
  }, []);

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
    <div className="max-w-7xl mx-auto py-12 px-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {/* DELIVERY ADDRESS SECTION */}
          <section className="mb-10">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Deliver to</h2>
              <button 
                onClick={() => navigate("/dashboard/address")}
                className="text-amber-500 font-bold text-sm hover:underline flex items-center gap-1"
              >
                Change <ChevronRight size={14} />
              </button>
            </div>
            
            {loading ? (
              <div className="h-32 bg-slate-100 animate-pulse rounded-[2rem]"></div>
            ) : defaultAddress ? (
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-5 group transition-all hover:border-amber-100">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
                  <MapPin size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900 text-xl">{defaultAddress.label}</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded">DEFAULT</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {defaultAddress.addressLine}<br />
                    {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2rem] flex items-center gap-4 text-amber-800">
                <AlertCircle />
                <p className="font-bold">No delivery address found. Please add one in your profile.</p>
              </div>
            )}
          </section>

          <h2 className="text-3xl font-serif mb-8 text-slate-900">Payment Methods</h2>
          <div className="space-y-4">
            {[
              { id: "card", label: "Credit / Debit Card", icon: <CreditCard /> },
              { id: "upi", label: "UPI / Google Pay", icon: <Wallet /> },
              { id: "net", label: "Net Banking", icon: <Landmark /> },
              { id: "cod", label: "Cash on Delivery", icon: <Banknote size={20} /> },
            ].map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
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
                  className={`p-2 rounded-lg ${
                    method === m.id
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {m.icon}
                </div>
                <span className="font-bold text-slate-700">{m.label}</span>
                {method === m.id && (
                  <CheckCircle className="ml-auto text-amber-500" size={20} />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl h-fit">
          <h3 className="text-xl font-bold mb-6 text-slate-800">Order Summary</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-slate-500">
              <span>Item Total</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-between text-xl font-bold text-slate-900">
              <span>Total Pay</span>
              <span className="text-amber-500">₹{total}</span>
            </div>
          </div>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Pay & Place Order"}
          </button>
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
    </div>
  );
};
