import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$]).{8,}$/;

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    setPasswordValid(strongPasswordRegex.test(value));
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!passwordValid) {
      setError("Password does not meet strength requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        otp: "", // Bypassed in backend
        newPassword,
      });

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);

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
            Reset Password
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Enter your email and define your new login password.
          </p>
        </div>

        <form onSubmit={handleResetSubmit} className="space-y-5">
          
          {/* Email Address */}
          <div>
            <label className="text-sm text-gray-500 font-medium">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-2 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm text-gray-500 font-medium">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`w-full mt-2 p-3 pr-14 border rounded-xl focus:outline-none focus:ring-2 ${
                  passwordValid
                    ? "border-emerald-500 focus:ring-emerald-500"
                    : "border-gray-300 focus:ring-red-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[60%] -translate-y-1/2 text-gray-500 hover:text-emerald-600 font-semibold text-xs select-none transition"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Password Strength Checklist */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <p className="font-semibold mb-1 text-gray-700">Password must contain:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Minimum 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character (!@#$)</li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-gray-500 font-medium">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full mt-2 p-3 pr-14 border rounded-xl focus:outline-none focus:ring-2 ${
                  confirmPassword && newPassword === confirmPassword
                    ? "border-emerald-500 focus:ring-emerald-500"
                    : "border-gray-300 focus:ring-red-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[60%] -translate-y-1/2 text-gray-500 hover:text-emerald-600 font-semibold text-xs select-none transition"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm p-3 rounded-xl font-medium">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
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
