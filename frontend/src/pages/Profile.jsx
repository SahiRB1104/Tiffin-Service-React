import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { User, Mail, Phone, Shield, Edit2, Save, X, Loader } from 'lucide-react';
import { api } from '../api/api';

export const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const handleSendOTP = async () => {
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
      setOtpError('');
      
      // Send OTP to phone number
      await api.post('/user/send-otp', { phone: normalized });
      
      setPendingPhoneNumber(normalized);
      setShowOTPModal(true);
      setOtpSent(true);
      setOtp('');
      setResendTimer(60);
      setSuccess('OTP sent successfully! Check your phone.');
      
      // Resend timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to send OTP');
      setShowOTPModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setOtpError('OTP is required');
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError('OTP must be exactly 6 digits');
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError('');

      // Verify OTP
      await api.post('/user/verify-otp', {
        phone: pendingPhoneNumber,
        otp: otp.trim(),
      });

      // OTP verified, now save phone number
      await api.put('/user/update-phone', {
        phone: pendingPhoneNumber,
        verified: true,
      });

      setSuccess('Phone number updated successfully!');
      setUser({ ...user, phone: pendingPhoneNumber });
      setShowOTPModal(false);
      setIsEditingPhone(false);
      setOtp('');
      setPendingPhoneNumber('');
      setOtpSent(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setOtpError(err.response?.data?.detail || err.message || 'Failed to verify OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setPhoneNumber(user?.phone || '');
    setIsEditingPhone(false);
    setShowOTPModal(false);
    setOtp('');
    setError('');
    setOtpError('');
    setPendingPhoneNumber('');
    setOtpSent(false);
    setResendTimer(0);
  };

  const handleResendOTP = async () => {
    try {
      setOtpLoading(true);
      setOtpError('');
      
      await api.post('/user/send-otp', { phone: pendingPhoneNumber });
      
      setOtp('');
      setResendTimer(60);
      setOtpError('');
      
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setOtpError(err.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 md:px-6">
      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-24 md:h-32 bg-amber-500"></div>
        <div className="relative pt-8 md:pt-12">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-2 mx-auto border-4 border-white shadow-lg">
            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <User size={40} className="md:w-12 md:h-12" />
            </div>
          </div>
          <div className="text-center mt-4 md:mt-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">{user?.name || user?.email?.split('@')[0] || 'User'}</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium">Verified Account</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-green-50 border border-green-200 rounded-xl text-sm md:text-base text-green-700 text-center">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl text-sm md:text-base text-red-700 text-center">
              {error}
            </div>
          )}

          <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="p-5 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4">
              <Mail className="text-amber-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Email Address</p>
                <p className="font-medium text-sm md:text-base text-slate-800 truncate">{user?.email || 'Not available'}</p>
              </div>
            </div>
            <div className="p-5 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4">
              <Phone className="text-amber-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Phone Number</p>
                {isEditingPhone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 min-w-0 px-2 md:px-3 py-1 text-sm md:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter phone number"
                      disabled={loading}
                      maxLength="10"
                    />
                    <button
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="p-1.5 md:p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2 shrink-0"
                    >
                      {loading ? <Loader size={16} className="md:w-4.5 md:h-4.5 animate-spin" /> : <Save size={16} className="md:w-4.5 md:h-4.5" />}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="p-1.5 md:p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 shrink-0"
                    >
                      <X size={16} className="md:w-4.5 md:h-4.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm md:text-base text-slate-800 truncate">{user?.phone || 'Not linked'}</p>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="p-1 text-amber-500 hover:bg-amber-100 rounded shrink-0"
                    >
                      <Edit2 size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 col-span-1 md:col-span-2">
              <Shield className="text-amber-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
              <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Security</p>
                <p className="font-medium text-sm md:text-base text-slate-800">Password-protected Account</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-1 md:mb-2">Verify Your Phone</h3>
            <p className="text-sm md:text-base text-slate-600 mb-5 md:mb-6">Enter the 6-digit OTP sent to {pendingPhoneNumber}</p>

            {/* OTP Error */}
            {otpError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {otpError}
              </div>
            )}

            {/* OTP Input */}
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              placeholder="000000"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-slate-300 rounded-lg text-center text-xl md:text-2xl font-bold focus:outline-none focus:border-amber-500 mb-3 md:mb-4 tracking-widest"
              disabled={otpLoading}
            />

            {/* Resend Timer */}
            <div className="text-center mb-3 md:mb-4">
              {resendTimer > 0 ? (
                <p className="text-xs md:text-sm text-slate-600">Resend OTP in {resendTimer}s</p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={otpLoading}
                  className="text-xs md:text-sm text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleVerifyOTP}
                disabled={otpLoading || otp.length !== 6}
                className="flex-1 bg-amber-500 text-white py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {otpLoading ? <Loader size={16} className="md:w-4.5 md:h-4.5 animate-spin" /> : 'Verify'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={otpLoading}
                className="flex-1 border-2 border-slate-300 text-slate-700 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};