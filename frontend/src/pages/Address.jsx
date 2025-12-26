import React from 'react';
import { MapPin, Plus } from 'lucide-react';

export const Address = () => (
  <div className="max-w-4xl mx-auto py-12 px-6">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-serif">Saved Addresses</h2>
      <button className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-200">
        <Plus size={18} /> Add New
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border-2 border-amber-500 shadow-sm relative">
        <div className="absolute top-4 right-4 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">DEFAULT</div>
        <div className="flex items-start gap-4">
          <MapPin className="text-amber-500 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-800">Home</h4>
            <p className="text-sm text-slate-500 mt-2">123 Green Valley, Sector 45, Gurgaon, Haryana - 122003</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-200 transition-colors shadow-sm cursor-pointer">
        <div className="flex items-start gap-4">
          <MapPin className="text-slate-400 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-800">Work</h4>
            <p className="text-sm text-slate-500 mt-2">Global Tech Park, Tower B, 4th Floor, Bangalore, Karnataka - 560103</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);