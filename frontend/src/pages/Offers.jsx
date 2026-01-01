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
    { code: 'FIRST50', title: '50% Off First Order', desc: 'Welcome to the family! Get half off on your very first tiffin.', color: 'bg-amber-500' },
    { code: 'MONTHLY20', title: '20% Monthly Pass', desc: 'Subscribe for a month and save big on every meal.', color: 'bg-indigo-600' },
    { code: 'REF100', title: 'Refer & Earn ₹100', desc: 'Share with friends and get credits instantly.', color: 'bg-green-600' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer, i) => {
              const isCopied = copiedCode === offer.code;
              return (
                <div key={i} className={`${offer.color} p-6 rounded-[2rem] text-white shadow-lg relative overflow-hidden group transition-all hover:scale-[1.02]`}>
                  <Tag className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                    <p className="text-white/80 text-xs mb-6 leading-relaxed font-medium">{offer.desc}</p>
                    
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-1.5 flex justify-between items-center">
                      <span className="font-mono font-bold tracking-widest pl-3 text-sm">{offer.code}</span>
                      <button 
                        onClick={() => handleCopy(offer.code)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                          isCopied 
                            ? 'bg-white text-green-600 scale-105' 
                            : 'bg-white text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={12} strokeWidth={4} />
                            COPIED!
                          </>
                        ) : (
                          <>
                            <Copy size={12} strokeWidth={3} />
                            COPY
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