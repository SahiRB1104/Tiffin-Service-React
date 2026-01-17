import React, { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await api.post("/auth/login", {
        email,
        password,
      });

      if (data.access_token) {
        setSuccess("Login successful! Redirecting...");
        login(data.access_token);
        setTimeout(() => navigate(from, { replace: true }), 1500);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
      <h2 className="text-2xl font-bold mb-2">
        Welcome Back
      </h2>
      <p className="text-slate-500 mb-8 text-sm">
        Login to your account to order your next meal.
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
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-amber-500 transition-all outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:border-amber-500 transition-all outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-amber-200 transition-all hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>

      <button
        onClick={() => navigate("/signup")}
        className="mt-6 text-slate-500 w-full text-center hover:text-amber-500 transition-colors"
      >
        Don't have an account?{" "}
        <span className="font-bold">Sign up</span>
      </button>
    </div>
  );
};
