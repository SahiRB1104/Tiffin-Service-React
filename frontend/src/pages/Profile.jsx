import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { User, Mail, Phone, Shield, Edit2, Save, X } from 'lucide-react';
import { api } from '../api/api';

export const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdatePhone = async () => {
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    const normalized = phoneNumber.trim();
    if (!/^\d{10}$/.test(normalized)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.put('/user/update-phone', { phone: normalized });
      setSuccess('Phone number updated successfully!');
      setUser({ ...user, phone: normalized });
      setIsEditingPhone(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setPhoneNumber(user?.phone || '');
    setIsEditingPhone(false);
    setError('');
  };

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

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
              {error}
            </div>
          )}

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
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Phone Number</p>
                {isEditingPhone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter phone number"
                      disabled={loading}
                    />
                    <button
                      onClick={handleUpdatePhone}
                      disabled={loading}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800">{user?.phone || 'Not linked'}</p>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="p-1 text-amber-500 hover:bg-amber-100 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
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