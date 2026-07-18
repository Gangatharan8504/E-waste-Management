import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setMessage(res.data?.message || "OTP sent successfully! Redirecting...");
      setTimeout(() => {
        navigate("/reset-password", { state: { email: email.trim().toLowerCase() } });
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "No account found with this email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute w-96 h-96 bg-emerald-200 opacity-20 rounded-full -top-32 -left-32 blur-3xl"></div>
      <div className="absolute w-96 h-96 bg-emerald-300 opacity-20 rounded-full bottom-0 right-0 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-100 transition">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            Forgot Password
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Enter your registered email address to receive a 6-digit OTP code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Address */}
          <div>
            <label className="text-sm text-gray-500 font-medium">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full mt-2 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm p-3 rounded-xl text-center font-medium">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Sending OTP..." : "Send Verification OTP"}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-emerald-600 hover:underline"
            >
              Back to Login
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default ForgotPassword;
