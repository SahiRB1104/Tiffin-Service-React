import React, { useState } from 'react';
import { Tag, Sparkles, Check, Copy, X } from 'lucide-react';

export const Offers = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const offers = [
    { code: 'WELCOME10', title: '10% Off', desc: 'Get 10% off on your first order. Minimum order ₹100.', color: 'bg-amber-500' },
    { code: 'FLAT50', title: 'Flat ₹50 Off', desc: 'Flat ₹50 off on orders above ₹200.', color: 'bg-indigo-600' },
    { code: 'SAVE20', title: 'Save 20%', desc: 'Save 20% on orders above ₹300. Max discount ₹100.', color: 'bg-green-600' },
    { code: 'BIGSALE', title: 'Mega Sale 25%', desc: 'Get 25% off on orders above ₹500. Max discount ₹150.', color: 'bg-rose-600' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Card */}
      <div className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif flex items-center gap-4 text-slate-900">
              <Sparkles className="text-amber-500" /> Exclusive Offers
            </h2>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((offer, i) => {
              const isCopied = copiedCode === offer.code;
              return (
                <div key={i} className={`${offer.color} p-6 rounded-[2rem] text-white shadow-lg relative overflow-hidden group transition-all hover:scale-[1.02] min-h-[220px] flex flex-col`}>
                  <Tag className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                  
                  <div className="relative z-10 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold mb-3">{offer.title}</h3>
                    <p className="text-white/90 text-sm mb-6 leading-relaxed font-medium flex-1">{offer.desc}</p>
                    
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-2 flex justify-between items-center gap-2 mt-auto">
                      <span className="font-mono font-bold tracking-wider pl-2 text-sm truncate">{offer.code}</span>
                      <button 
                        onClick={() => handleCopy(offer.code)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 ${
                          isCopied 
                            ? 'bg-white text-green-600 scale-105' 
                            : 'bg-white text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={12} strokeWidth={4} />
                            <span className="hidden sm:inline">COPIED!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} strokeWidth={3} />
                            <span className="hidden sm:inline">COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {isCopied && (
                    <div className="absolute bottom-0 left-0 h-1 bg-white/40 animate-[shrink_2s_linear_forwards]" style={{ width: '100%' }}></div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm font-medium">Terms & conditions apply. Valid for a limited time only.</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};