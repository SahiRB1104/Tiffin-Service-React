import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { api } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await api.post("/auth/register", {
        email,
        password,
      });

      if (data && data.access_token) {
        login(data.access_token);
        navigate("/", { replace: true });
      } else {
        setError(data?.detail || "Registration failed");
      }
    } catch (err) {
      setError(err?.message || "Registration failed");
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
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} /> {error}
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

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-5 py-4 rounded-xl border bg-slate-50"
          required
        />

        <button className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-amber-200">
          Get Started
        </button>
      </form>

      <button
        onClick={() => navigate("/login")}
        className="mt-6 text-slate-500 w-full text-center"
      >
        Already have an account? Login
      </button>
    </div>
  );
};
