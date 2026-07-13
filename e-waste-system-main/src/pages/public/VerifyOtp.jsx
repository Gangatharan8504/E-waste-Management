import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (element, index) => {
    if (!/^[0-9]?$/.test(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next box automatically
    if (element.value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace -> move to previous box
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }

    if (finalOtp.length !== 6) {
      setError("Please enter complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const res = await api.post("/auth/verify-otp", {
        email,
        otp: finalOtp,
      });

      setSuccessMsg(res.data?.message || "Verified successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSuccessMsg("");

    try {
      setLoading(true);
      const res = await api.post("/auth/resend-otp", { email });
      setSuccessMsg(res.data?.message || "OTP resent successfully!");
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200 px-4">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-6 text-green-700">
          Verify OTP
        </h2>

        {email ? (
          <p className="text-center text-sm text-gray-600 mb-4">
            Code sent to <span className="font-medium">{email}</span>
          </p>
        ) : (
          <p className="text-center text-sm text-gray-600 mb-4">
            Please enter your registered email address.
          </p>
        )}

        {!initialEmail && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        )}

        {/* OTP Boxes */}
        <div className="flex justify-center gap-1.5 sm:gap-3 mb-6">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputsRef.current[index] = el)}
              className="w-9 sm:w-12 h-11 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {successMsg && (
          <p className="text-green-600 text-sm text-center mb-3">{successMsg}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            className={`text-sm font-semibold transition ${
              cooldown > 0 ? "text-gray-400 cursor-not-allowed" : "text-green-700 hover:text-green-800"
            }`}
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
