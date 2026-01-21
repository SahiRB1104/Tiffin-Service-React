import React from 'react';

export const About = () => (
  <div className="max-w-6xl mx-auto py-12 px-6">
    <h1 className="text-4xl font-serif mb-8 text-slate-900">About SB Tiffin</h1>
    <div className="prose prose-slate lg:prose-lg">
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        SB Tiffin was founded on a simple principle: everyone deserves a hot, healthy, home-cooked meal, no matter how busy their life gets.
      </p>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        Our kitchen uses only the freshest ingredients, sourced locally. We avoid preservatives and excess oil, ensuring that your daily meal is as nutritious as it is delicious.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="bg-amber-50 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-4 text-amber-800">Our Mission</h3>
          <p className="text-amber-700">To revolutionize urban dining by bringing traditional homestyle cooking to the modern doorstep.</p>
        </div>
        <div className="bg-slate-100 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Our Vision</h3>
          <p className="text-slate-700">To be India's most trusted and sustainable tiffin service provider, one plate at a time.</p>
        </div>
      </div>
    </div>
  </div>
);