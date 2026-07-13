import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$]).{8,}$/;

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    setPasswordValid(strongPasswordRegex.test(value));
  };

  const handleReset = async () => {
    setError("");

    if (!otp) {
      setError("Please enter OTP.");
      return;
    }

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
        email,
        otp,
        newPassword,
      });

      alert("Password reset successful!");
      navigate("/login");

    } catch (err) {
      setError("Invalid OTP or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200 px-4">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-6 text-green-700">
          Reset Password
        </h2>

        {/* Email */}
        <input
          type="email"
          className="w-full p-3 border rounded-xl mb-3 bg-gray-100"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={initialEmail !== ""}
        />

        {/* OTP */}
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-3 border rounded-xl mb-3 focus:ring-2 focus:ring-green-500 outline-none"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {/* New Password */}
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => handlePasswordChange(e.target.value)}
          className={`w-full p-3 border rounded-xl mb-2 focus:outline-none focus:ring-2 ${
            passwordValid
              ? "border-green-500 focus:ring-green-500"
              : "border-gray-300 focus:ring-red-500"
          }`}
        />

        {/* Password Rules */}
        <div className="text-xs text-gray-600 mb-3">
          <p>Password must contain:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Minimum 8 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
            <li>One special character (!@#$)</li>
          </ul>
        </div>

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full p-3 border rounded-xl mb-3 focus:outline-none focus:ring-2 ${
            confirmPassword && newPassword === confirmPassword
              ? "border-green-500 focus:ring-green-500"
              : "border-gray-300 focus:ring-red-500"
          }`}
        />

        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-red-500 text-sm mb-2">
            Passwords do not match
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

      </div>
    </div>
  );
}

export default ResetPassword;
