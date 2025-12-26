import React, { useState } from "react";
import {
  Star,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "../api/api";
import { useAuth } from "../auth/AuthContext";

export const Review = () => {
  const { isAuthenticated } = useAuth();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  // status shape: { type: "success" | "error", msg: string }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setStatus({
        type: "error",
        msg: "Please login to submit a review",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await api.post("/reviews", {
        rating,
        comment,
      });

      setStatus({
        type: "success",
        msg: "Thank you! Your review has been submitted.",
      });

      setRating(5);
      setComment("");
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.message || "Failed to submit review",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="text-3xl font-serif mb-8 text-slate-900 text-center">
        Share Your Feedback
      </h2>

      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
        <p className="text-center text-slate-500 mb-6 font-medium">
          How was your experience with SB Tiffin?
        </p>

        {status && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm border ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-red-50 text-red-700 border-red-100"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {status.msg}
          </div>
        )}

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              className="transition-transform active:scale-90"
            >
              <Star
                size={40}
                className={
                  s <= rating
                    ? "text-amber-500 fill-amber-500"
                    : "text-slate-200"
                }
              />
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="What did you love? Any suggestions for improvement?"
            className="w-full h-32 p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 mb-6 transition-all"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 shadow-xl shadow-amber-200 disabled:opacity-50 transition-all"
          >
            {loading ? (
              "Submitting..."
            ) : (
              <>
                <Send size={18} /> Submit Review
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
