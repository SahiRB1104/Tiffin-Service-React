import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  BadgeCheck,
  Bell,
  Camera,
  Copy,
  Clock3,
  Edit2,
  KeyRound,
  Laptop,
  Loader,
  Mail,
  Phone,
  Save,
  Shield,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { api } from '../api/api';

const dietaryOptions = ['Vegetarian', 'Jain', 'No Onion-Garlic', 'Gluten-Free', 'Low Spice'];

const defaultNotificationPreferences = {
  orderUpdates: { sms: true, email: true },
  offersPromotions: { sms: false, email: true },
};

const getDisplayName = (profile) =>
  profile?.name || profile?.full_name || profile?.fullName || profile?.email?.split('@')[0] || 'User';

const getLastLoginText = (profile) => {
  if (!profile?.last_login) {
    return 'Apr 27, 2026 at 8:42 PM';
  }

  const date = new Date(profile.last_login);
  if (Number.isNaN(date.getTime())) {
    return String(profile.last_login);
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const Profile = () => {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(getDisplayName(user));
  const [emailAddress, setEmailAddress] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [lastLogin, setLastLogin] = useState(getLastLoginText(user));
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState(['Vegetarian']);
  const [notificationPreferences, setNotificationPreferences] = useState(defaultNotificationPreferences);
  const [totalOrders] = useState(24);
  const [activePlan] = useState('Monthly - Veg');
  const [favoriteMeal] = useState('Dal Tadka');
  const [referralCode] = useState('TIFFIN-S42');

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const resendTimerRef = useRef(null);
  const successTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    setFullName(getDisplayName(user));
    setEmailAddress(user?.email || '');
    setPhoneNumber(user?.phone || '');
    setLastLogin(getLastLoginText(user));
  }, [user]);

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const syncUserField = (field, value) => {
    setUser((previousUser) => (previousUser ? { ...previousUser, [field]: value } : previousUser));
  };

  const showTimedSuccess = (message) => {
    setSuccess(message);
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    successTimerRef.current = setTimeout(() => setSuccess(''), 3000);
  };

  const startResendTimer = () => {
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
    }

    setResendTimer(60);
    resendTimerRef.current = setInterval(() => {
      setResendTimer((previous) => {
        if (previous <= 1) {
          clearInterval(resendTimerRef.current);
          resendTimerRef.current = null;
          return 0;
        }

        return previous - 1;
      });
    }, 1000);
  };

  const handleFilePreview = (event, setter) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setter(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (event) => {
    handleFilePreview(event, setCoverPreview);
  };

  const handleAvatarUpload = (event) => {
    handleFilePreview(event, setAvatarPreview);
  };

  const handleEditName = () => {
    if (isEditingName) {
      const nextName = fullName.trim() || getDisplayName(user);
      setFullName(nextName);
      syncUserField('name', nextName);
      setIsEditingName(false);
      showTimedSuccess('Display name updated');
      return;
    }

    setIsEditingName(true);
    setIsEditingEmail(false);
  };

  const handleCancelName = () => {
    setFullName(getDisplayName(user));
    setIsEditingName(false);
  };

  const handleEditEmail = () => {
    if (isEditingEmail) {
      const nextEmail = emailAddress.trim() || user?.email || '';
      setEmailAddress(nextEmail);
      syncUserField('email', nextEmail);
      setIsEditingEmail(false);
      showTimedSuccess('Email updated locally');
      return;
    }

    setIsEditingEmail(true);
    setIsEditingName(false);
  };

  const handleCancelEmail = () => {
    setEmailAddress(user?.email || '');
    setIsEditingEmail(false);
  };

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

      await api.post('/user/send-otp', { phone: normalized });

      setPendingPhoneNumber(normalized);
      setShowOTPModal(true);
      setOtp('');
      startResendTimer();
      showTimedSuccess('OTP sent successfully. Check your phone.');
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

      await api.post('/user/verify-otp', {
        phone: pendingPhoneNumber,
        otp: otp.trim(),
      });

      await api.put('/user/update-phone', {
        phone: pendingPhoneNumber,
        verified: true,
      });

      setPhoneNumber(pendingPhoneNumber);
      syncUserField('phone', pendingPhoneNumber);
      setShowOTPModal(false);
      setIsEditingPhone(false);
      setOtp('');
      setPendingPhoneNumber('');
      showTimedSuccess('Phone number updated successfully');
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
    setResendTimer(0);
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
      resendTimerRef.current = null;
    }
  };

  const handleResendOTP = async () => {
    try {
      setOtpLoading(true);
      setOtpError('');

      await api.post('/user/send-otp', { phone: pendingPhoneNumber });
      setOtp('');
      startResendTimer();
    } catch (err) {
      setOtpError(err.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleToggleDietaryPreference = (option) => {
    setSelectedDietaryPreferences((previous) =>
      previous.includes(option)
        ? previous.filter((item) => item !== option)
        : [...previous, option]
    );
  };

  const handleToggleNotification = (section, channel) => {
    setNotificationPreferences((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [channel]: !previous[section][channel],
      },
    }));
  };

  const handleCopyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setToastMessage('Copied!');
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => setToastMessage(''), 2000);
    } catch {
      setToastMessage('Copy failed');
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => setToastMessage(''), 2000);
    }
  };

  const isPhoneLinked = Boolean(user?.phone || phoneNumber);
  const avatarInitials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      {toastMessage && (
        <div className="fixed right-5 top-5 z-50 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-orange-300" />
            {toastMessage}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm">
        <div className="relative h-28 overflow-hidden bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300">
          {coverPreview ? (
            <img src={coverPreview} alt="Profile cover" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.18),_transparent_55%)]" />
          )}
          <div className="absolute inset-0 bg-black/10" />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur transition-all duration-200 hover:bg-white/30"
          >
            <Camera className="h-4 w-4 text-orange-500" />
            Upload Cover
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        </div>

        <div className="px-4 pb-4 md:px-4">
          <div className="-mt-8 flex justify-center">
            <div className="group relative">
              <div className="h-16 w-16 rounded-full border-2 border-white bg-white p-1 shadow-sm md:h-16 md:w-16">
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-orange-50 text-slate-400">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 text-lg font-bold text-orange-500">
                      {avatarInitials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/45 group-hover:opacity-100"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                      <Camera className="h-5 w-5 text-orange-500" />
                    </div>
                  </button>
                </div>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {isEditingName ? (
                <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 shadow-sm">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-center text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Enter full name"
                  />
                  <button
                    type="button"
                    onClick={handleEditName}
                    className="rounded-full bg-orange-500 p-2 text-white transition-all duration-200 hover:bg-orange-600"
                    aria-label="Save name"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelName}
                    className="rounded-full bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:bg-slate-50"
                    aria-label="Cancel name edit"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-base font-semibold text-slate-900">{fullName}</h2>
                  <button
                    type="button"
                    onClick={handleEditName}
                    className="inline-flex items-center justify-center rounded-full p-1.5 text-orange-500 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600"
                    aria-label="Edit full name"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified Account
              </span>
            </div>
          </div>

          {success && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Email Address</p>
                  <div className="mt-1 flex items-center gap-1.5 min-w-0">
                    <p className="min-w-0 truncate text-sm font-medium text-gray-800">{emailAddress || 'Not available'}</p>
                    <button
                      type="button"
                      onClick={handleEditEmail}
                      className="inline-flex items-center justify-center rounded-full p-1 text-orange-500 transition-all duration-200 hover:bg-orange-100"
                      aria-label="Edit email address"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {isEditingEmail ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(event) => setEmailAddress(event.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                        placeholder="Enter email address"
                      />
                      <button type="button" onClick={handleEditEmail} className="rounded-lg border border-orange-200 px-2 py-2 text-orange-500 transition-all duration-200 hover:bg-orange-50" aria-label="Save email">
                        <Save className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={handleCancelEmail} className="rounded-lg border border-gray-200 px-2 py-2 text-slate-500 transition-all duration-200 hover:bg-gray-50" aria-label="Cancel email edit">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0 border-t border-gray-100 pt-3 md:border-t-0 md:border-l md:pl-3 md:pt-0">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Phone Number</p>
                  <div className="mt-1 flex items-center gap-1.5 min-w-0">
                    <p className="min-w-0 truncate text-sm font-medium text-gray-800">{phoneNumber || 'Not linked'}</p>
                    <button
                      type="button"
                      onClick={() => setIsEditingPhone(true)}
                      className="inline-flex items-center justify-center rounded-full p-1 text-orange-500 transition-all duration-200 hover:bg-orange-100"
                      aria-label="Edit phone number"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {!isPhoneLinked ? (
                      <span className="inline-flex items-center rounded-full border border-orange-300 px-2 py-0.5 text-xs font-medium text-orange-500">
                        Verify Now
                      </span>
                    ) : null}
                  </div>
                  {isEditingPhone ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, ''))}
                        className="min-w-0 flex-1 rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                        placeholder="Enter phone number"
                        disabled={loading}
                        maxLength={10}
                      />
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-lg border border-orange-200 px-2 py-2 text-orange-500 transition-all duration-200 hover:bg-orange-50 disabled:opacity-50"
                        aria-label="Send verification OTP"
                      >
                        {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className="rounded-lg border border-gray-200 px-2 py-2 text-slate-500 transition-all duration-200 hover:bg-gray-50 disabled:opacity-50"
                        aria-label="Cancel phone edit"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">Security</p>
                  <p className="mt-1 text-sm text-gray-700">Password-protected account</p>
                </div>
                <button
                  type="button"
                  className="text-sm text-orange-500 underline-offset-2 transition-all duration-200 hover:underline"
                >
                  Change Password
                </button>
              </div>

              <div className="mt-2 border-t border-gray-100 pt-2">
                <div className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Enable 2FA</p>
                    <p className="text-xs text-gray-500">Extra protection for logins</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFAEnabled((previous) => !previous)}
                    aria-pressed={twoFAEnabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-all duration-200 ${
                      twoFAEnabled ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-200 ${
                        twoFAEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2 border-t border-gray-100 py-2">
                  <Clock3 className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400">Last Login: {lastLogin}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Total Orders</p>
                    <p className="mt-1 text-lg font-bold text-gray-800">{totalOrders}</p>
                  </div>
                  <ShoppingBag className="h-4 w-4 text-orange-300" />
                </div>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Active Plan</p>
                    <p className="mt-1 text-lg font-bold text-gray-800">{activePlan}</p>
                  </div>
                  <Sparkles className="h-4 w-4 text-orange-300" />
                </div>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Favorite Meal</p>
                    <p className="mt-1 text-lg font-bold text-gray-800">{favoriteMeal}</p>
                  </div>
                  <UtensilsCrossed className="h-4 w-4 text-orange-300" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Dietary Preferences</p>
                  <p className="text-sm text-gray-500">Select the options that match your meal preferences</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {dietaryOptions.map((option) => {
                  const isSelected = selectedDietaryPreferences.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleToggleDietaryPreference(option)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                          : 'border border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Notification Preferences</p>
                  <p className="text-sm text-gray-500">Choose how you want to hear about orders and offers</p>
                </div>
              </div>

              <div className="mt-3 divide-y divide-gray-100">
                {[
                  { key: 'orderUpdates', label: 'Order Updates' },
                  { key: 'offersPromotions', label: 'Offers & Promotions' },
                ].map((row) => (
                  <div key={row.key} className="flex flex-col gap-2 py-2.5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{row.label}</p>
                      <p className="text-xs text-gray-500">Turn channels on or off for this notification type</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {['sms', 'email'].map((channel) => {
                        const isActive = notificationPreferences[row.key][channel];
                        return (
                          <button
                            key={channel}
                            type="button"
                            onClick={() => handleToggleNotification(row.key, channel)}
                            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                              isActive
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {channel.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Refer &amp; Earn 🎉</p>
                  <p className="text-sm text-gray-500">Share your code with friends and earn rewards on every successful referral</p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyReferralCode}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-400 px-3 py-1 text-xs font-medium text-orange-500 transition-all duration-200 hover:bg-orange-50"
                >
                  <Copy className="h-4 w-4" />
                  Copy Code
                </button>
              </div>

              <div className="mt-3 inline-block rounded-lg bg-gray-50 px-4 py-2 font-mono text-sm font-bold tracking-widest text-slate-900">
                {referralCode}
              </div>
              <p className="mt-2 text-xs text-gray-400">Share with friends</p>
            </div>
          </div>
        </div>
      </div>

      {showOTPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-sm md:p-4">
            <h3 className="mb-2 text-base font-semibold text-slate-900">Verify Your Phone</h3>
            <p className="mb-4 text-sm text-slate-600">Enter the 6-digit OTP sent to {pendingPhoneNumber}</p>

            {otpError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {otpError}
              </div>
            )}

            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              placeholder="000000"
              className="mb-4 w-full rounded-xl border border-slate-300 px-3 py-3 text-center text-sm font-semibold tracking-[0.35em] text-slate-900 outline-none transition-all duration-200 focus:border-orange-500"
              disabled={otpLoading}
            />

            <div className="mb-4 text-center">
              {resendTimer > 0 ? (
                <p className="text-xs text-slate-600">Resend OTP in {resendTimer}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpLoading}
                  className="text-xs font-medium text-orange-600 transition-all duration-200 hover:text-orange-700 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={otpLoading || otp.length !== 6}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 disabled:opacity-50"
              >
                {otpLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Verify'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={otpLoading}
                className="flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 disabled:opacity-50"
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