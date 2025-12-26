import React from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { User, Mail, Phone, Shield } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-32 bg-amber-500"></div>
        <div className="relative pt-12">
          <div className="w-32 h-32 bg-white rounded-full p-2 mx-auto border-4 border-white shadow-lg">
            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <User size={48} />
            </div>
          </div>
          <div className="text-center mt-6">
            <h2 className="text-2xl font-bold text-slate-900">{user?.name || user?.email?.split('@')[0] || 'User'}</h2>
            <p className="text-slate-500 font-medium">Verified Account</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl flex items-center gap-4">
              <Mail className="text-amber-500" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                <p className="font-medium text-slate-800">{user?.email || 'Not available'}</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl flex items-center gap-4">
              <Phone className="text-amber-500" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Phone Number</p>
                <p className="font-medium text-slate-800">{user?.phone || 'Not linked'}</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl flex items-center gap-4 col-span-1 md:col-span-2">
              <Shield className="text-amber-500" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Security</p>
                <p className="font-medium text-slate-800">Password-protected Account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};