import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function ChangePassword() {

  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$]).{8,}$/;

  const token = localStorage.getItem("token");
  let email = "";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      email = payload.sub;
    } catch {}
  }

  const handleSubmit = async () => {

    setError("");
    setMessage("");

    // ===== FRONTEND VALIDATION =====

    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }

    if (!strongPasswordRegex.test(newPassword)) {
      setError("New password does not meet strength requirements.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.put(
        `/auth/change-password?email=${email}`,
        {
          currentPassword,
          newPassword,
          confirmNewPassword,
          otp: otpSent ? otp : ""
        }
      );

      console.log("BACKEND RESPONSE:", response.data);

      const data = response.data;

      // ===== IF BACKEND RETURNS STRING =====
      if (typeof data === "string") {
        if (!otpSent) {
          setOtpSent(true);
          setMessage(data);
        } else {
          navigate("/user/profile", {
            state: { message: data }
          });
        }
        return;
      }

      // ===== IF BACKEND RETURNS OBJECT =====
      if (!data.success) {
        setError(data.message);
        return;
      }

      if (!otpSent) {
        setOtpSent(true);
        setMessage(data.message);
      } else {
        navigate("/user/profile", {
          state: { message: data.message }
        });
      }

    } catch (err) {
      console.log("ERROR:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-6 text-green-700">
          Change Password
        </h2>

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-3 pr-14 border rounded-xl"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 font-semibold text-xs select-none transition"
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        </div>

        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 pr-14 border rounded-xl"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 font-semibold text-xs select-none transition"
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        </div>

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

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full p-3 pr-14 border rounded-xl"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 font-semibold text-xs select-none transition"
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        </div>

        {confirmNewPassword && newPassword !== confirmNewPassword && (
          <p className="text-red-500 text-sm mb-2">
            Passwords do not match
          </p>
        )}

        {otpSent && (
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border rounded-xl mb-3"
          />
        )}

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {message && (
          <p className="text-green-600 text-sm mb-3">{message}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : otpSent
            ? "Verify OTP & Change"
            : "Send OTP"}
        </button>

      </div>
    </div>
  );
}

export default ChangePassword;
