import React, { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const data = await api.post("/auth/register", {
        email,
        password,
      });

      if (data && data.message) {
        // Registration successful
        setSuccess("Account sign up successful! Redirecting to login...");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      } else {
        setError(data?.detail || "Registration failed");
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
      <h2 className="text-2xl font-bold mb-2">
        Create Account
      </h2>

      <p className="text-slate-500 mb-8 text-sm">
        Join the SB Tiffin family for healthy home-cooked meals.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-xl flex items-center gap-3 text-sm border border-green-100">
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-4 rounded-xl border bg-slate-50"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border bg-slate-50"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-amber-200">
          Get Started
        </button>
      </form>

      <button
        onClick={() => navigate("/login")}
        className="mt-6 text-slate-500 w-full text-center hover:text-amber-500 transition-colors"
      >
        Already have an account?{" "}
        <span className="font-bold">Login</span>
      </button>
    </div>
  );
};
