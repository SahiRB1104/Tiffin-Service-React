import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

export const Offers = () => (
  <div className="max-w-7xl mx-auto py-12 px-6">
    <h2 className="text-4xl font-serif mb-12 flex items-center gap-4">
      <Sparkles className="text-amber-500" /> Exclusive Offers
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { code: 'FIRST50', title: '50% Off First Order', desc: 'Welcome to the family! Get half off on your very first tiffin.', color: 'bg-amber-500' },
        { code: 'MONTHLY20', title: '20% Monthly Pass', desc: 'Subscribe for a month and save big on every meal.', color: 'bg-indigo-600' },
        { code: 'REF100', title: 'Refer & Earn ₹100', desc: 'Share with friends and get credits instantly.', color: 'bg-green-600' }
      ].map((offer, i) => (
        <div key={i} className={`${offer.color} p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group`}>
          <Tag className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
          <p className="text-white/80 text-sm mb-6">{offer.desc}</p>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="font-mono font-bold tracking-widest">{offer.code}</span>
            <button className="text-xs font-bold bg-white text-slate-900 px-3 py-1 rounded-full">COPY</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);